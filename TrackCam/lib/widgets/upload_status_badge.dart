import 'package:flutter/material.dart';

import 'package:track_cam/models/upload_task.dart';

class UploadStatusBadge extends StatelessWidget {
  final UploadTask? task;

  const UploadStatusBadge({super.key, this.task});

  @override
  Widget build(BuildContext context) {
    if (task == null) {
      return const SizedBox.shrink();
    }

    final (icon, color, label) = switch (task!.status) {
      UploadStatus.pending => (Icons.cloud_queue, Colors.grey, 'Pending'),
      UploadStatus.uploading => (Icons.cloud_upload, Colors.blue, task!.progressPercent),
      UploadStatus.completed => (Icons.cloud_done, Colors.green, 'Uploaded'),
      UploadStatus.failed => (Icons.cloud_off, Colors.red, 'Failed'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(100)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
