import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:track_cam/blocs/auth_bloc/auth_bloc.dart';
import 'package:track_cam/blocs/camera_bloc/camera_bloc.dart';
import 'package:track_cam/blocs/upload_bloc/upload_bloc.dart';
import 'package:track_cam/firebase_options.dart';
import 'package:track_cam/repositories/upload_repository.dart';
import 'package:track_cam/repositories/video_repository.dart';
import 'package:track_cam/screens/auth/auth_gate.dart';
import 'package:track_cam/services/auth_service.dart';
import 'package:track_cam/services/camera_service.dart';
import 'package:track_cam/services/storage_service.dart';
import 'package:track_cam/services/upload_api_service.dart';
import 'package:track_cam/services/upload_queue_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

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
  final authService = AuthService();
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
    authService: authService,
    videoRepository: videoRepository,
    uploadRepository: uploadRepository,
  ));
}

class TrackCam extends StatelessWidget {
  final AuthService authService;
  final VideoRepository videoRepository;
  final UploadRepository uploadRepository;

  const TrackCam({
    super.key,
    required this.authService,
    required this.videoRepository,
    required this.uploadRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authService),
        RepositoryProvider.value(value: videoRepository),
        RepositoryProvider.value(value: uploadRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (_) =>
                AuthBloc(authService: authService)..add(AuthStarted()),
          ),
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
              );
            },
          ),
        ],
        child: MaterialApp(
          title: 'TrackCam',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorSchemeSeed: Colors.red,
            useMaterial3: true,
            brightness: Brightness.dark,
          ),
          home: const AuthGate(),
        ),
      ),
    );
  }
}
