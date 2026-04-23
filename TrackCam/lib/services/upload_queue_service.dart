import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;

import 'package:track_cam/models/upload_task.dart';

class UploadQueueService {
  static const String _dbName = 'upload_queue.db';
  static const String _tableName = 'upload_queue';

  Database? _db;

  Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, _dbName);
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE $_tableName (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT NOT NULL,
            object_name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            bytes_uploaded INTEGER NOT NULL DEFAULT 0,
            total_bytes INTEGER NOT NULL DEFAULT 0,
            retry_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            error_message TEXT
          )
        ''');
      },
    );
  }

  Future<int> enqueue(String filePath, String objectName) async {
    final db = await database;
    return db.insert(_tableName, {
      'file_path': filePath,
      'object_name': objectName,
      'status': UploadStatus.pending.name,
      'bytes_uploaded': 0,
      'total_bytes': 0,
      'created_at': DateTime.now().toIso8601String(),
    });
  }

  Future<UploadTask?> getNextPending() async {
    final db = await database;
    final results = await db.query(
      _tableName,
      where: 'status = ?',
      whereArgs: [UploadStatus.pending.name],
      orderBy: 'created_at ASC',
      limit: 1,
    );
    if (results.isEmpty) return null;
    return UploadTask.fromMap(results.first);
  }

  Future<void> updateStatus(int id, UploadStatus status) async {
    final db = await database;
    await db.update(
      _tableName,
      {'status': status.name},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> updateProgress(
    int id, {
    required int bytesUploaded,
    int? totalBytes,
  }) async {
    final db = await database;
    final values = <String, dynamic>{
      'bytes_uploaded': bytesUploaded,
    };
    if (totalBytes != null) values['total_bytes'] = totalBytes;

    await db.update(
      _tableName,
      values,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> markCompleted(int id) async {
    final db = await database;
    await db.update(
      _tableName,
      {
        'status': UploadStatus.completed.name,
        'error_message': null,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> markFailed(int id, String error) async {
    final db = await database;
    await db.rawUpdate(
      'UPDATE $_tableName SET status = ?, error_message = ?, retry_count = retry_count + 1 WHERE id = ?',
      [UploadStatus.failed.name, error, id],
    );
  }

  Future<void> resetForRetry(int id) async {
    final db = await database;
    await db.update(
      _tableName,
      {
        'status': UploadStatus.pending.name,
        'error_message': null,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<List<UploadTask>> getAllTasks() async {
    final db = await database;
    final results = await db.query(
      _tableName,
      orderBy: 'created_at DESC',
    );
    return results.map(UploadTask.fromMap).toList();
  }

  Future<UploadTask?> getTaskForFile(String filePath) async {
    final db = await database;
    final results = await db.query(
      _tableName,
      where: 'file_path = ?',
      whereArgs: [filePath],
      limit: 1,
    );
    if (results.isEmpty) return null;
    return UploadTask.fromMap(results.first);
  }

  Future<void> deleteTask(int id) async {
    final db = await database;
    await db.delete(
      _tableName,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<int> pendingCount() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $_tableName WHERE status IN (?, ?)',
      [
        UploadStatus.pending.name,
        UploadStatus.uploading.name,
      ],
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }
}
