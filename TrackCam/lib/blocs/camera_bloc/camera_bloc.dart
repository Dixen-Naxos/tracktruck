import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:track_cam/models/video_segment.dart';
import 'package:track_cam/repositories/video_repository.dart';

part 'camera_event.dart';
part 'camera_state.dart';

class CameraBloc extends Bloc<CameraEvent, CameraState> {
  final VideoRepository videoRepository;

  /// Called when a segment is saved, so the UploadBloc can enqueue it.
  final void Function(String filePath)? onSegmentSaved;

  static const segmentDuration = Duration(minutes: 5);

  Timer? _segmentTimer;
  Timer? _elapsedTicker;

  CameraBloc({
    required this.videoRepository,
    this.onSegmentSaved,
  }) : super(const CameraState()) {
    on<InitializeCamera>(_onInitializeCamera);
    on<StartRecording>(_onStartRecording);
    on<StopRecording>(_onStopRecording);
    on<_RotateSegment>(_onRotateSegment);
    on<_TickElapsed>(_onTickElapsed);
    on<LoadSegments>(_onLoadSegments);
    on<DeleteSegment>(_onDeleteSegment);
  }

  Future<void> _onInitializeCamera(
    InitializeCamera event,
    Emitter<CameraState> emit,
  ) async {
    emit(state.copyWith(cameraStatus: CameraStatus.initializing));
    try {
      await videoRepository.initializeCamera();
      emit(state.copyWith(cameraStatus: CameraStatus.ready, clearError: true));
    } catch (e) {
      emit(state.copyWith(
        cameraStatus: CameraStatus.error,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onStartRecording(
    StartRecording event,
    Emitter<CameraState> emit,
  ) async {
    if (!state.isCameraReady) return;
    try {
      await videoRepository.startRecording();
      final now = DateTime.now();
      emit(state.copyWith(
        recordingStatus: RecordingStatus.recording,
        currentSegmentStart: now,
        currentSegmentIndex: state.currentSegmentIndex + 1,
        elapsedInSegment: Duration.zero,
        clearError: true,
      ));
      _startSegmentTimer();
      _startElapsedTicker();
    } catch (e) {
      emit(state.copyWith(errorMessage: e.toString()));
    }
  }

  Future<void> _onStopRecording(
    StopRecording event,
    Emitter<CameraState> emit,
  ) async {
    _cancelTimers();
    emit(state.copyWith(recordingStatus: RecordingStatus.stopping));
    try {
      final segment = await videoRepository.stopAndSaveSegment();
      final updatedSegments = [segment, ...state.segments];
      emit(state.copyWith(
        recordingStatus: RecordingStatus.idle,
        segments: updatedSegments,
        clearSegmentStart: true,
        elapsedInSegment: Duration.zero,
      ));
      onSegmentSaved?.call(segment.filePath);
    } catch (e) {
      emit(state.copyWith(
        recordingStatus: RecordingStatus.idle,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onRotateSegment(
    _RotateSegment event,
    Emitter<CameraState> emit,
  ) async {
    try {
      // Stop current segment and save
      final segment = await videoRepository.stopAndSaveSegment();
      final updatedSegments = [segment, ...state.segments];

      // Immediately start a new recording
      await videoRepository.startRecording();
      final now = DateTime.now();

      emit(state.copyWith(
        segments: updatedSegments,
        currentSegmentStart: now,
        currentSegmentIndex: state.currentSegmentIndex + 1,
        elapsedInSegment: Duration.zero,
      ));

      // Notify upload system
      onSegmentSaved?.call(segment.filePath);

      // Restart the 5-minute timer for the new segment
      _startSegmentTimer();
    } catch (e) {
      _cancelTimers();
      emit(state.copyWith(
        recordingStatus: RecordingStatus.idle,
        errorMessage: 'Segment rotation failed: $e',
      ));
    }
  }

  void _onTickElapsed(
    _TickElapsed event,
    Emitter<CameraState> emit,
  ) {
    if (state.currentSegmentStart != null) {
      final elapsed = DateTime.now().difference(state.currentSegmentStart!);
      emit(state.copyWith(elapsedInSegment: elapsed));
    }
  }

  Future<void> _onLoadSegments(
    LoadSegments event,
    Emitter<CameraState> emit,
  ) async {
    try {
      final segments = await videoRepository.listSegments();
      emit(state.copyWith(segments: segments));
    } catch (e) {
      emit(state.copyWith(errorMessage: e.toString()));
    }
  }

  Future<void> _onDeleteSegment(
    DeleteSegment event,
    Emitter<CameraState> emit,
  ) async {
    try {
      await videoRepository.deleteSegment(event.filePath);
      final updatedSegments =
          state.segments.where((s) => s.filePath != event.filePath).toList();
      emit(state.copyWith(segments: updatedSegments));
    } catch (e) {
      emit(state.copyWith(errorMessage: e.toString()));
    }
  }

  void _startSegmentTimer() {
    _segmentTimer?.cancel();
    _segmentTimer = Timer(segmentDuration, () {
      add(_RotateSegment());
    });
  }

  void _startElapsedTicker() {
    _elapsedTicker?.cancel();
    _elapsedTicker = Timer.periodic(const Duration(seconds: 1), (_) {
      add(_TickElapsed());
    });
  }

  void _cancelTimers() {
    _segmentTimer?.cancel();
    _segmentTimer = null;
    _elapsedTicker?.cancel();
    _elapsedTicker = null;
  }

  @override
  Future<void> close() {
    _cancelTimers();
    videoRepository.dispose();
    return super.close();
  }
}
