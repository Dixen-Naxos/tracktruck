import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:track_cam/blocs/camera_bloc/camera_bloc.dart';
import 'package:track_cam/blocs/upload_bloc/upload_bloc.dart';
import 'package:track_cam/repositories/upload_repository.dart';
import 'package:track_cam/repositories/video_repository.dart';
import 'package:track_cam/screens/dashcam/dashcam_screen.dart';
import 'package:track_cam/services/camera_service.dart';
import 'package:track_cam/services/storage_service.dart';
import 'package:track_cam/services/upload_api_service.dart';
import 'package:track_cam/services/upload_queue_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to landscape (dashcam orientation)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  // Request permissions
  await [
    Permission.camera,
    Permission.microphone,
  ].request();

  // Create services
  final cameraService = CameraService();
  final storageService = StorageService();
  final uploadApiService = UploadApiService();
  final uploadQueueService = UploadQueueService();

  // Create repositories
  final videoRepository = VideoRepository(
    cameraService: cameraService,
    storageService: storageService,
  );
  final uploadRepository = UploadRepository(
    uploadApiService: uploadApiService,
    uploadQueueService: uploadQueueService,
  );

  runApp(TrackCam(
    videoRepository: videoRepository,
    uploadRepository: uploadRepository,
  ));
}

class TrackCam extends StatelessWidget {
  final VideoRepository videoRepository;
  final UploadRepository uploadRepository;

  const TrackCam({
    super.key,
    required this.videoRepository,
    required this.uploadRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: videoRepository),
        RepositoryProvider.value(value: uploadRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (_) => UploadBloc(uploadRepository: uploadRepository)
              ..add(InitializeUploadQueue()),
          ),
          BlocProvider(
            create: (context) {
              return CameraBloc(
                videoRepository: videoRepository,
                onSegmentSaved: (filePath) {
                  context.read<UploadBloc>().add(EnqueueUpload(filePath));
                },
              )..add(InitializeCamera());
            },
          ),
        ],
        child: MaterialApp(
          title: 'Dashcam',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorSchemeSeed: Colors.red,
            useMaterial3: true,
            brightness: Brightness.dark,
          ),
          home: const DashcamScreen(),
        ),
      ),
    );
  }
}
