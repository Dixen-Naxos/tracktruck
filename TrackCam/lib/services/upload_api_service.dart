import 'dart:io';

import 'package:dio/dio.dart';

import 'package:track_cam/config.dart';

class UploadApiService {
  final Dio _dio;

  UploadApiService({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              connectTimeout: const Duration(seconds: 30),
              // No receive timeout — large uploads can take a while
              receiveTimeout: const Duration(minutes: 10),
            ));

  /// Uploads a video file directly to the backend API as multipart form data.
  /// The backend is responsible for transferring it to GCS.
  /// Calls [onProgress] with (bytesSent, totalBytes).
  Future<void> uploadFile({
    required String filePath,
    required String objectName,
    void Function(int bytesSent, int totalBytes)? onProgress,
    CancelToken? cancelToken,
  }) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }

    final formData = FormData.fromMap({
      'objectName': objectName,
      'file': await MultipartFile.fromFile(
        filePath,
        contentType: DioMediaType('video', 'mp4'),
      ),
    });

    await _dio.post(
      '${AppConfig.apiBaseUrl}/upload',
      data: formData,
      onSendProgress: (sent, total) {
        onProgress?.call(sent, total);
      },
      cancelToken: cancelToken,
    );
  }
}
