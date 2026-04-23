import 'dart:io';

import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'package:track_cam/config.dart';

class UploadApiService {
  final Dio _dio;

  UploadApiService({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              connectTimeout: const Duration(seconds: 30),
              receiveTimeout: const Duration(minutes: 10),
            ));

  /// 1. Requests a signed GCS upload URL from the API.
  /// 2. Uploads the file directly to GCS via the signed URL.
  /// Calls [onProgress] with (bytesSent, totalBytes).
  Future<void> uploadFile({
    required String filePath,
    required DateTime timestamp,
    void Function(int bytesSent, int totalBytes)? onProgress,
    CancelToken? cancelToken,
  }) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }

    // Step 1 — get a signed upload URL from the API
    final token = await FirebaseAuth.instance.currentUser?.getIdToken();
    if (token == null) throw Exception('User not authenticated');

    final response = await _dio.post(
      '${AppConfig.apiBaseUrl}/videos/upload-url',
      data: {'timestamp': timestamp.toUtc().toIso8601String()},
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
        contentType: 'application/json',
      ),
      cancelToken: cancelToken,
    );

    final uploadUrl = response.data['uploadUrl'] as String;
    final contentType = response.data['contentType'] as String;

    // Step 2 — upload file bytes directly to GCS
    final fileLength = await file.length();

    await _dio.put(
      uploadUrl,
      data: file.openRead(),
      options: Options(
        headers: {
          Headers.contentTypeHeader: contentType,
          Headers.contentLengthHeader: fileLength,
        },
      ),
      onSendProgress: (sent, total) => onProgress?.call(sent, total),
      cancelToken: cancelToken,
    );
  }
}
