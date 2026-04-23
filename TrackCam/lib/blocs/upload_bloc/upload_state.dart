part of 'upload_bloc.dart';

class UploadState {
  final List<UploadTask> tasks;
  final bool isProcessing;
  final bool isConnected;
  final int? currentTaskId;
  final String? errorMessage;

  const UploadState({
    this.tasks = const [],
    this.isProcessing = false,
    this.isConnected = true,
    this.currentTaskId,
    this.errorMessage,
  });

  int get pendingCount =>
      tasks.where((t) =>
          t.status == UploadStatus.pending ||
          t.status == UploadStatus.uploading).length;

  int get completedCount =>
      tasks.where((t) => t.status == UploadStatus.completed).length;

  int get failedCount =>
      tasks.where((t) => t.status == UploadStatus.failed).length;

  UploadTask? taskForFile(String filePath) {
    final matches = tasks.where((t) => t.filePath == filePath);
    return matches.isEmpty ? null : matches.first;
  }

  UploadState copyWith({
    List<UploadTask>? tasks,
    bool? isProcessing,
    bool? isConnected,
    int? currentTaskId,
    bool clearCurrentTask = false,
    String? errorMessage,
    bool clearError = false,
  }) {
    return UploadState(
      tasks: tasks ?? this.tasks,
      isProcessing: isProcessing ?? this.isProcessing,
      isConnected: isConnected ?? this.isConnected,
      currentTaskId:
          clearCurrentTask ? null : (currentTaskId ?? this.currentTaskId),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
