part of 'camera_bloc.dart';

sealed class CameraEvent {}

final class InitializeCamera extends CameraEvent {}

final class StartRecording extends CameraEvent {}

final class StopRecording extends CameraEvent {}

final class LoadSegments extends CameraEvent {}

final class DeleteSegment extends CameraEvent {
  final String filePath;
  DeleteSegment(this.filePath);
}

/// Internal: fired by the 5-minute Timer to rotate segments.
final class _RotateSegment extends CameraEvent {}

/// Internal: fired every second to update elapsed time display.
final class _TickElapsed extends CameraEvent {}
