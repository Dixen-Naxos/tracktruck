import 'dart:io';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:path/path.dart' as p;

import 'package:track_cam/models/upload_task.dart';
import 'package:track_cam/services/upload_api_service.dart';
import 'package:track_cam/services/upload_queue_service.dart';

class UploadRepository {
  final UploadApiService uploadApiService;
  final UploadQueueService uploadQueueService;

  UploadRepository({
    required this.uploadApiService,
    required this.uploadQueueService,
  });

  /// Enqueues a segment file for upload.
  /// Returns the created task's ID.
  Future<int> enqueueSegment(String filePath) async {
    final fileName = p.basename(filePath);
    final objectName = 'segments/$fileName';
    return uploadQueueService.enqueue(filePath, objectName);
  }

  /// Processes the next pending upload in the queue.
  /// Gets a signed URL from the API then uploads directly to GCS.
  /// Returns the completed task, or null if the queue is empty.
  Future<UploadTask?> processNextUpload({
    void Function(int bytesUploaded, int totalBytes)? onProgress,
    CancelToken? cancelToken,
  }) async {
    final task = await uploadQueueService.getNextPending();
    if (task == null) return null;

    final taskId = task.id!;

    try {
      final file = File(task.filePath);
      if (!await file.exists()) {
        await uploadQueueService.markFailed(taskId, 'File not found');
        return task.copyWith(
          status: UploadStatus.failed,
          errorMessage: 'File not found',
        );
      }

      final totalBytes = await file.length();
      await uploadQueueService.updateProgress(
        taskId,
        bytesUploaded: 0,
        totalBytes: totalBytes,
      );
      await uploadQueueService.updateStatus(taskId, UploadStatus.uploading);

      // Step 1: get signed URL from API, Step 2: PUT directly to GCS
      await uploadApiService.uploadFile(
        filePath: task.filePath,
        timestamp: task.createdAt,
        cancelToken: cancelToken,
        onProgress: (sent, total) {
          onProgress?.call(sent, total);
          uploadQueueService.updateProgress(
            taskId,
            bytesUploaded: sent,
            totalBytes: total,
          );
        },
      );

      await uploadQueueService.markCompleted(taskId);
      return task.copyWith(
        status: UploadStatus.completed,
        bytesUploaded: totalBytes,
        totalBytes: totalBytes,
      );
    } on DioException catch (e) {
      final errorMsg = e.message ?? e.toString();
      await uploadQueueService.markFailed(taskId, errorMsg);
      return task.copyWith(
        status: UploadStatus.failed,
        errorMessage: errorMsg,
      );
    } catch (e) {
      await uploadQueueService.markFailed(taskId, e.toString());
      return task.copyWith(
        status: UploadStatus.failed,
        errorMessage: e.toString(),
      );
    }
  }

  /// Retries a specific failed task if it hasn't exceeded max retries.
  Future<bool> retryTask(int taskId) async {
    final tasks = await uploadQueueService.getAllTasks();
    final task = tasks.where((t) => t.id == taskId).firstOrNull;
    if (task == null || !task.canRetry) return false;

    await uploadQueueService.resetForRetry(taskId);
    return true;
  }

  /// Resets all failed tasks that haven't exceeded max retries.
  Future<int> retryAllFailed() async {
    final tasks = await uploadQueueService.getAllTasks();
    int count = 0;
    for (final task in tasks) {
      if (task.status == UploadStatus.failed && task.canRetry) {
        await uploadQueueService.resetForRetry(task.id!);
        count++;
      }
    }
    return count;
  }

  Future<List<UploadTask>> getUploadTasks() {
    return uploadQueueService.getAllTasks();
  }

  Future<UploadTask?> getTaskForFile(String filePath) {
    return uploadQueueService.getTaskForFile(filePath);
  }

  Future<int> pendingCount() {
    return uploadQueueService.pendingCount();
  }

  /// Calculates exponential backoff delay for a given retry count.
  Duration getRetryDelay(int retryCount) {
    final seconds = min(pow(2, retryCount).toInt(), 300); // Cap at 5 min
    return Duration(seconds: seconds);
  }
}
