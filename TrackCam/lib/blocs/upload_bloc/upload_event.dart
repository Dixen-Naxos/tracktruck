part of 'upload_bloc.dart';

sealed class UploadEvent {}

final class InitializeUploadQueue extends UploadEvent {}

final class EnqueueUpload extends UploadEvent {
  final String filePath;
  EnqueueUpload(this.filePath);
}

final class ProcessQueue extends UploadEvent {}

final class RetryUpload extends UploadEvent {
  final int taskId;
  RetryUpload(this.taskId);
}

final class RetryAllFailed extends UploadEvent {}

final class CancelCurrentUpload extends UploadEvent {}

final class LoadUploadTasks extends UploadEvent {}

/// Internal: progress update from the upload worker.
final class _UploadProgress extends UploadEvent {
  final int taskId;
  final int bytesUploaded;
  final int totalBytes;
  _UploadProgress(this.taskId, this.bytesUploaded, this.totalBytes);
}

/// Internal: connectivity change.
final class _ConnectivityChanged extends UploadEvent {
  final bool isConnected;
  _ConnectivityChanged(this.isConnected);
}
