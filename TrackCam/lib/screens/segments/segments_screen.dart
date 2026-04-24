import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import 'package:track_cam/blocs/camera_bloc/camera_bloc.dart';
import 'package:track_cam/blocs/upload_bloc/upload_bloc.dart';
import 'package:track_cam/models/upload_task.dart';
import 'package:track_cam/models/video_segment.dart';
import 'package:track_cam/widgets/upload_status_badge.dart';

class SegmentsScreen extends StatelessWidget {
  const SegmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    context.read<CameraBloc>().add(LoadSegments());
    context.read<UploadBloc>().add(LoadUploadTasks());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recorded Segments'),
        actions: [
          BlocBuilder<UploadBloc, UploadState>(
            buildWhen: (prev, curr) => prev.failedCount != curr.failedCount,
            builder: (context, state) {
              if (state.failedCount == 0) return const SizedBox.shrink();
              return TextButton.icon(
                onPressed: () =>
                    context.read<UploadBloc>().add(RetryAllFailed()),
                icon: const Icon(Icons.refresh, size: 18),
                label: Text('Retry ${state.failedCount} failed'),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<CameraBloc, CameraState>(
        buildWhen: (prev, curr) => prev.segments != curr.segments,
        builder: (context, cameraState) {
          if (cameraState.segments.isEmpty) {
            return const Center(
              child: Text('No segments recorded yet.'),
            );
          }
          return BlocBuilder<UploadBloc, UploadState>(
            builder: (context, uploadState) {
              return ListView.builder(
                itemCount: cameraState.segments.length,
                itemBuilder: (context, index) {
                  final segment = cameraState.segments[index];
                  return _SegmentTile(
                    segment: segment,
                    uploadTask: uploadState.taskForFile(segment.filePath),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

class _SegmentTile extends StatelessWidget {
  final VideoSegment segment;
  final UploadTask? uploadTask;

  const _SegmentTile({required this.segment, this.uploadTask});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');

    return Dismissible(
      key: ValueKey(segment.filePath),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: Colors.red,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Delete segment?'),
            content: const Text(
                'This will permanently delete this video segment.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child:
                    const Text('Delete', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        );
      },
      onDismissed: (_) {
        context.read<CameraBloc>().add(DeleteSegment(segment.filePath));
      },
      child: ListTile(
        leading: const Icon(Icons.videocam),
        title: Text(segment.fileName),
        subtitle: Text(
          '${dateFormat.format(segment.startTime)} - ${segment.fileSizeMB} MB',
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            UploadStatusBadge(task: uploadTask),
            if (uploadTask != null &&
                uploadTask!.status == UploadStatus.failed &&
                uploadTask!.canRetry)
              IconButton(
                icon: const Icon(Icons.refresh, size: 18),
                onPressed: () => context
                    .read<UploadBloc>()
                    .add(RetryUpload(uploadTask!.id!)),
              ),
          ],
        ),
      ),
    );
  }
}
