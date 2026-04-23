import 'package:equatable/equatable.dart';

enum UploadStatus { pending, uploading, completed, failed }

class UploadTask extends Equatable {
  final int? id;
  final String filePath;
  final String objectName;
  final UploadStatus status;
  final int bytesUploaded;
  final int totalBytes;
  final int retryCount;
  final DateTime createdAt;
  final String? errorMessage;

  const UploadTask({
    this.id,
    required this.filePath,
    required this.objectName,
    this.status = UploadStatus.pending,
    this.bytesUploaded = 0,
    this.totalBytes = 0,
    this.retryCount = 0,
    required this.createdAt,
    this.errorMessage,
  });

  double get progress =>
      totalBytes > 0 ? bytesUploaded / totalBytes : 0.0;

  String get progressPercent => '${(progress * 100).toStringAsFixed(0)}%';

  bool get canRetry => retryCount < maxRetries;

  static const int maxRetries = 10;

  UploadTask copyWith({
    int? id,
    String? filePath,
    String? objectName,
    UploadStatus? status,
    int? bytesUploaded,
    int? totalBytes,
    int? retryCount,
    DateTime? createdAt,
    String? errorMessage,
    bool clearError = false,
  }) {
    return UploadTask(
      id: id ?? this.id,
      filePath: filePath ?? this.filePath,
      objectName: objectName ?? this.objectName,
      status: status ?? this.status,
      bytesUploaded: bytesUploaded ?? this.bytesUploaded,
      totalBytes: totalBytes ?? this.totalBytes,
      retryCount: retryCount ?? this.retryCount,
      createdAt: createdAt ?? this.createdAt,
      errorMessage:
          clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'file_path': filePath,
      'object_name': objectName,
      'status': status.name,
      'bytes_uploaded': bytesUploaded,
      'total_bytes': totalBytes,
      'retry_count': retryCount,
      'created_at': createdAt.toIso8601String(),
      'error_message': errorMessage,
    };
  }

  factory UploadTask.fromMap(Map<String, dynamic> map) {
    return UploadTask(
      id: map['id'] as int?,
      filePath: map['file_path'] as String,
      objectName: map['object_name'] as String,
      status: UploadStatus.values.byName(map['status'] as String),
      bytesUploaded: map['bytes_uploaded'] as int? ?? 0,
      totalBytes: map['total_bytes'] as int? ?? 0,
      retryCount: map['retry_count'] as int? ?? 0,
      createdAt: DateTime.parse(map['created_at'] as String),
      errorMessage: map['error_message'] as String?,
    );
  }

  @override
  List<Object?> get props => [
        id,
        filePath,
        objectName,
        status,
        bytesUploaded,
        totalBytes,
        retryCount,
        createdAt,
        errorMessage,
      ];
}
