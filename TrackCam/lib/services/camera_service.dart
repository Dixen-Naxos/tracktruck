import 'package:camera/camera.dart';

class CameraService {
  CameraController? _controller;
  List<CameraDescription> _cameras = [];

  CameraController? get controller => _controller;
  bool get isInitialized => _controller?.value.isInitialized ?? false;
  bool get isRecording => _controller?.value.isRecordingVideo ?? false;

  Future<void> initialize({
    ResolutionPreset resolution = ResolutionPreset.high,
  }) async {
    _cameras = await availableCameras();
    if (_cameras.isEmpty) {
      throw CameraException('noCameras', 'No cameras available on this device');
    }

    final backCamera = _cameras.firstWhere(
      (c) => c.lensDirection == CameraLensDirection.back,
      orElse: () => _cameras.first,
    );

    _controller = CameraController(
      backCamera,
      resolution,
      enableAudio: true,
    );

    await _controller!.initialize();
  }

  Future<void> startRecording() async {
    if (_controller == null || !isInitialized) {
      throw CameraException('notInitialized', 'Camera not initialized');
    }
    if (isRecording) return;
    await _controller!.startVideoRecording();
  }

  Future<XFile> stopRecording() async {
    if (_controller == null || !isRecording) {
      throw CameraException('notRecording', 'Not currently recording');
    }
    return await _controller!.stopVideoRecording();
  }

  Future<void> dispose() async {
    await _controller?.dispose();
    _controller = null;
  }
}
