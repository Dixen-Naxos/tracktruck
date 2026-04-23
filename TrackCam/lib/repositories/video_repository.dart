import 'dart:io';

import 'package:camera/camera.dart';

import 'package:track_cam/models/video_segment.dart';
import 'package:track_cam/services/camera_service.dart';
import 'package:track_cam/services/storage_service.dart';

class VideoRepository {
  final CameraService cameraService;
  final StorageService storageService;

  VideoRepository({
    required this.cameraService,
    required this.storageService,
  });

  CameraController? get cameraController => cameraService.controller;
  bool get isInitialized => cameraService.isInitialized;
  bool get isRecording => cameraService.isRecording;

  Future<void> initializeCamera() async {
    await cameraService.initialize();
  }

  Future<void> startRecording() async {
    await cameraService.startRecording();
  }

  /// Stops recording, moves the temp file to the segments directory
  /// with a timestamped filename, and returns the saved segment metadata.
  Future<VideoSegment> stopAndSaveSegment() async {
    final xFile = await cameraService.stopRecording();
    final targetPath = await storageService.generateSegmentPath();

    final savedFile = await File(xFile.path).copy(targetPath);
    await File(xFile.path).delete();

    final stat = savedFile.statSync();
    return VideoSegment(
      filePath: targetPath,
      startTime: DateTime.now(),
      fileSizeBytes: stat.size,
    );
  }

  Future<List<VideoSegment>> listSegments() {
    return storageService.listSegments();
  }

  Future<void> deleteSegment(String filePath) {
    return storageService.deleteSegment(filePath);
  }

  Future<void> dispose() async {
    await cameraService.dispose();
  }
}
