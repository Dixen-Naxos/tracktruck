part of 'camera_bloc.dart';

enum CameraStatus { initial, initializing, ready, error }

enum RecordingStatus { idle, recording, stopping }

class CameraState {
  final CameraStatus cameraStatus;
  final RecordingStatus recordingStatus;
  final String? errorMessage;
  final List<VideoSegment> segments;
  final int currentSegmentIndex;
  final DateTime? currentSegmentStart;
  final Duration elapsedInSegment;

  const CameraState({
    this.cameraStatus = CameraStatus.initial,
    this.recordingStatus = RecordingStatus.idle,
    this.errorMessage,
    this.segments = const [],
    this.currentSegmentIndex = 0,
    this.currentSegmentStart,
    this.elapsedInSegment = Duration.zero,
  });

  bool get isRecording => recordingStatus == RecordingStatus.recording;
  bool get isCameraReady => cameraStatus == CameraStatus.ready;

  CameraState copyWith({
    CameraStatus? cameraStatus,
    RecordingStatus? recordingStatus,
    String? errorMessage,
    bool clearError = false,
    List<VideoSegment>? segments,
    int? currentSegmentIndex,
    DateTime? currentSegmentStart,
    bool clearSegmentStart = false,
    Duration? elapsedInSegment,
  }) {
    return CameraState(
      cameraStatus: cameraStatus ?? this.cameraStatus,
      recordingStatus: recordingStatus ?? this.recordingStatus,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      segments: segments ?? this.segments,
      currentSegmentIndex: currentSegmentIndex ?? this.currentSegmentIndex,
      currentSegmentStart: clearSegmentStart
          ? null
          : (currentSegmentStart ?? this.currentSegmentStart),
      elapsedInSegment: elapsedInSegment ?? this.elapsedInSegment,
    );
  }
}
