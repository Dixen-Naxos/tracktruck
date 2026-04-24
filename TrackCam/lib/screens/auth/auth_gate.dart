import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:track_cam/blocs/auth_bloc/auth_bloc.dart';
import 'package:track_cam/screens/auth/login_screen.dart';
import 'package:track_cam/screens/dashcam/dashcam_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        return switch (state.status) {
          AuthStatus.authenticated => const DashcamScreen(),
          AuthStatus.unknown => const Scaffold(
              backgroundColor: Colors.black,
              body: SizedBox.shrink(),
            ),
          _ => const LoginScreen(),
        };
      },
    );
  }
}
