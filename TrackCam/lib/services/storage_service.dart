import 'dart:io';

import 'package:intl/intl.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'package:track_cam/models/video_segment.dart';

class StorageService {
  static const String _segmentsDirName = 'dashcam_segments';

  Future<Directory> getSegmentsDirectory() async {
    final appDir = await getApplicationDocumentsDirectory();
    final segmentsDir = Directory(p.join(appDir.path, _segmentsDirName));
    if (!await segmentsDir.exists()) {
      await segmentsDir.create(recursive: true);
    }
    return segmentsDir;
  }

  Future<String> generateSegmentPath() async {
    final dir = await getSegmentsDirectory();
    final timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
    return p.join(dir.path, 'dashcam_$timestamp.mp4');
  }

  Future<List<VideoSegment>> listSegments() async {
    final dir = await getSegmentsDirectory();
    if (!await dir.exists()) return [];

    final files = dir
        .listSync()
        .whereType<File>()
        .where((f) => f.path.endsWith('.mp4'))
        .toList()
      ..sort((a, b) => b.statSync().modified.compareTo(a.statSync().modified));

    return files.map((file) {
      final stat = file.statSync();
      final baseName = p.basenameWithoutExtension(file.path);
      final dateStr = baseName.replaceFirst('dashcam_', '');
      DateTime startTime;
      try {
        startTime = DateFormat('yyyyMMdd_HHmmss').parse(dateStr);
      } catch (_) {
        startTime = stat.modified;
      }
      return VideoSegment(
        filePath: file.path,
        startTime: startTime,
        fileSizeBytes: stat.size,
      );
    }).toList();
  }

  Future<void> deleteSegment(String filePath) async {
    final file = File(filePath);
    if (await file.exists()) {
      await file.delete();
    }
  }
}
