import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import 'package:track_cam/blocs/camera_bloc/camera_bloc.dart';
import 'package:track_cam/blocs/upload_bloc/upload_bloc.dart';
import 'package:track_cam/screens/segments/segments_screen.dart';
import 'package:track_cam/widgets/recording_indicator.dart';

class DashcamScreen extends StatefulWidget {
  const DashcamScreen({super.key});

  @override
  State<DashcamScreen> createState() => _DashcamScreenState();
}

class _DashcamScreenState extends State<DashcamScreen>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    context.read<CameraBloc>().add(InitializeCamera());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    WakelockPlus.disable();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final bloc = context.read<CameraBloc>();
    if (state == AppLifecycleState.inactive && bloc.state.isRecording) {
      bloc.add(StopRecording());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: BlocConsumer<CameraBloc, CameraState>(
        listenWhen: (prev, curr) =>
            prev.recordingStatus != curr.recordingStatus,
        listener: (context, state) {
          if (state.isRecording) {
            WakelockPlus.enable();
          } else {
            WakelockPlus.disable();
          }
        },
        builder: (context, cameraState) {
          return Stack(
            fit: StackFit.expand,
            children: [
              _buildCameraPreview(cameraState),

              // Recording indicator (top-left)
              if (cameraState.isRecording)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 16,
                  left: 16,
                  child: RecordingIndicator(
                    elapsed: cameraState.elapsedInSegment,
                    segmentIndex: cameraState.currentSegmentIndex,
                  ),
                ),

              // Upload queue indicator (top-right)
              Positioned(
                top: MediaQuery.of(context).padding.top + 16,
                right: 16,
                child: BlocBuilder<UploadBloc, UploadState>(
                  buildWhen: (prev, curr) =>
                      prev.pendingCount != curr.pendingCount ||
                      prev.isConnected != curr.isConnected,
                  builder: (context, uploadState) {
                    if (uploadState.pendingCount == 0 &&
                        uploadState.isConnected) {
                      return const SizedBox.shrink();
                    }
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            uploadState.isConnected
                                ? Icons.cloud_upload
                                : Icons.cloud_off,
                            color: uploadState.isConnected
                                ? Colors.blue
                                : Colors.orange,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            uploadState.isConnected
                                ? '${uploadState.pendingCount} uploading'
                                : 'Offline',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // Error banner
              if (cameraState.errorMessage != null)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 56,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade900.withAlpha(200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      cameraState.errorMessage!,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),

              // Bottom controls
              Positioned(
                bottom: 40,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Segments list button
                    IconButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const SegmentsScreen(),
                        ),
                      ),
                      icon: const Icon(Icons.video_library,
                          color: Colors.white, size: 32),
                    ),

                    // Record / Stop button
                    _buildRecordButton(cameraState),

                    // Spacer for symmetry
                    const SizedBox(width: 48),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCameraPreview(CameraState state) {
    if (state.cameraStatus == CameraStatus.initializing) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }
    if (state.cameraStatus == CameraStatus.error) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error, color: Colors.red, size: 64),
            const SizedBox(height: 16),
            Text(
              state.errorMessage ?? 'Camera error',
              style: const TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () =>
                  context.read<CameraBloc>().add(InitializeCamera()),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    final controller =
        context.read<CameraBloc>().videoRepository.cameraController;
    if (controller == null || !controller.value.isInitialized) {
      return const SizedBox.shrink();
    }
    return CameraPreview(controller);
  }

  Widget _buildRecordButton(CameraState state) {
    final isRecording = state.isRecording;
    final isStopping = state.recordingStatus == RecordingStatus.stopping;

    return GestureDetector(
      onTap: isStopping
          ? null
          : () {
              final bloc = context.read<CameraBloc>();
              if (isRecording) {
                bloc.add(StopRecording());
              } else {
                bloc.add(StartRecording());
              }
            },
      child: Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 4),
        ),
        child: Center(
          child: isStopping
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: isRecording ? 28 : 56,
                  height: isRecording ? 28 : 56,
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(isRecording ? 6 : 28),
                  ),
                ),
        ),
      ),
    );
  }
}
