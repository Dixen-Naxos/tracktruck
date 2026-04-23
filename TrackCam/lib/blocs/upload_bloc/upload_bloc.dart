import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:track_cam/models/upload_task.dart';
import 'package:track_cam/repositories/upload_repository.dart';

part 'upload_event.dart';
part 'upload_state.dart';

class UploadBloc extends Bloc<UploadEvent, UploadState> {
  final UploadRepository uploadRepository;
  final Connectivity _connectivity = Connectivity();

  StreamSubscription? _connectivitySubscription;
  CancelToken? _currentCancelToken;

  UploadBloc({required this.uploadRepository}) : super(const UploadState()) {
    on<InitializeUploadQueue>(_onInitialize);
    on<EnqueueUpload>(_onEnqueue);
    on<ProcessQueue>(_onProcessQueue);
    on<RetryUpload>(_onRetryUpload);
    on<RetryAllFailed>(_onRetryAllFailed);
    on<CancelCurrentUpload>(_onCancelCurrent);
    on<LoadUploadTasks>(_onLoadTasks);
    on<_UploadProgress>(_onProgress);
    on<_ConnectivityChanged>(_onConnectivityChanged);
  }

  Future<void> _onInitialize(
    InitializeUploadQueue event,
    Emitter<UploadState> emit,
  ) async {
    // Load existing tasks from DB
    final tasks = await uploadRepository.getUploadTasks();
    emit(state.copyWith(tasks: tasks));

    // Listen for connectivity changes
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (results) {
        final connected =
            results.any((r) => r != ConnectivityResult.none);
        add(_ConnectivityChanged(connected));
      },
    );

    // Check current connectivity
    final current = await _connectivity.checkConnectivity();
    final connected = current.any((r) => r != ConnectivityResult.none);
    emit(state.copyWith(isConnected: connected));

    // Process any leftover pending tasks
    if (connected && tasks.any((t) => t.status == UploadStatus.pending)) {
      add(ProcessQueue());
    }
  }

  Future<void> _onEnqueue(
    EnqueueUpload event,
    Emitter<UploadState> emit,
  ) async {
    await uploadRepository.enqueueSegment(event.filePath);
    final tasks = await uploadRepository.getUploadTasks();
    emit(state.copyWith(tasks: tasks));

    // Start processing if not already running
    if (!state.isProcessing && state.isConnected) {
      add(ProcessQueue());
    }
  }

  Future<void> _onProcessQueue(
    ProcessQueue event,
    Emitter<UploadState> emit,
  ) async {
    if (state.isProcessing || !state.isConnected) return;

    emit(state.copyWith(isProcessing: true));

    while (state.isConnected) {
      final pending = await uploadRepository.uploadQueueService.getNextPending();
      if (pending == null) break;

      _currentCancelToken = CancelToken();
      emit(state.copyWith(currentTaskId: pending.id));

      final result = await uploadRepository.processNextUpload(
        cancelToken: _currentCancelToken,
        onProgress: (bytesUploaded, totalBytes) {
          add(_UploadProgress(pending.id!, bytesUploaded, totalBytes));
        },
      );

      _currentCancelToken = null;

      // Refresh task list after each upload
      final tasks = await uploadRepository.getUploadTasks();
      emit(state.copyWith(tasks: tasks));

      if (result == null) break;

      // If failed, apply backoff delay before continuing
      if (result.status == UploadStatus.failed) {
        final delay = uploadRepository.getRetryDelay(result.retryCount);
        await Future.delayed(delay);
      }
    }

    emit(state.copyWith(isProcessing: false, clearCurrentTask: true));
  }

  void _onProgress(
    _UploadProgress event,
    Emitter<UploadState> emit,
  ) {
    final updatedTasks = state.tasks.map((t) {
      if (t.id == event.taskId) {
        return t.copyWith(
          status: UploadStatus.uploading,
          bytesUploaded: event.bytesUploaded,
          totalBytes: event.totalBytes,
        );
      }
      return t;
    }).toList();
    emit(state.copyWith(tasks: updatedTasks));
  }

  Future<void> _onRetryUpload(
    RetryUpload event,
    Emitter<UploadState> emit,
  ) async {
    await uploadRepository.retryTask(event.taskId);
    final tasks = await uploadRepository.getUploadTasks();
    emit(state.copyWith(tasks: tasks));

    if (!state.isProcessing && state.isConnected) {
      add(ProcessQueue());
    }
  }

  Future<void> _onRetryAllFailed(
    RetryAllFailed event,
    Emitter<UploadState> emit,
  ) async {
    await uploadRepository.retryAllFailed();
    final tasks = await uploadRepository.getUploadTasks();
    emit(state.copyWith(tasks: tasks));

    if (!state.isProcessing && state.isConnected) {
      add(ProcessQueue());
    }
  }

  void _onCancelCurrent(
    CancelCurrentUpload event,
    Emitter<UploadState> emit,
  ) {
    _currentCancelToken?.cancel('User cancelled');
    _currentCancelToken = null;
  }

  Future<void> _onLoadTasks(
    LoadUploadTasks event,
    Emitter<UploadState> emit,
  ) async {
    final tasks = await uploadRepository.getUploadTasks();
    emit(state.copyWith(tasks: tasks));
  }

  void _onConnectivityChanged(
    _ConnectivityChanged event,
    Emitter<UploadState> emit,
  ) {
    emit(state.copyWith(isConnected: event.isConnected));

    if (event.isConnected && !state.isProcessing) {
      // Reconnected — resume processing
      add(ProcessQueue());
    } else if (!event.isConnected) {
      // Lost connection — cancel current upload (it will resume later)
      _currentCancelToken?.cancel('No network');
      _currentCancelToken = null;
    }
  }

  @override
  Future<void> close() {
    _connectivitySubscription?.cancel();
    _currentCancelToken?.cancel('Bloc closed');
    return super.close();
  }
}
