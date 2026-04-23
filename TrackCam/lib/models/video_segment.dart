import 'package:equatable/equatable.dart';

enum SegmentUploadStatus { pending, uploading, completed, failed, none }

class VideoSegment extends Equatable {
  final String filePath;
  final DateTime startTime;
  final DateTime? endTime;
  final int fileSizeBytes;
  final SegmentUploadStatus uploadStatus;

  const VideoSegment({
    required this.filePath,
    required this.startTime,
    this.endTime,
    this.fileSizeBytes = 0,
    this.uploadStatus = SegmentUploadStatus.none,
  });

  String get fileName => filePath.split('/').last;

  String get fileSizeMB => (fileSizeBytes / 1024 / 1024).toStringAsFixed(1);

  VideoSegment copyWith({
    String? filePath,
    DateTime? startTime,
    DateTime? endTime,
    int? fileSizeBytes,
    SegmentUploadStatus? uploadStatus,
  }) {
    return VideoSegment(
      filePath: filePath ?? this.filePath,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      fileSizeBytes: fileSizeBytes ?? this.fileSizeBytes,
      uploadStatus: uploadStatus ?? this.uploadStatus,
    );
  }

  @override
  List<Object?> get props =>
      [filePath, startTime, endTime, fileSizeBytes, uploadStatus];
}
