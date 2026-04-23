import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:truck_map/blocs/auth_bloc/auth_bloc.dart';
import 'package:truck_map/screens/auth/login_screen.dart';
import 'package:truck_map/screens/home/home_shell.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        switch (state.status) {
          case AuthStatus.authenticated:
            return const HomeShell();
          case AuthStatus.unknown:
            return const Scaffold(
              backgroundColor: Color(0xFFF5F7FA),
              body: Center(child: CircularProgressIndicator()),
            );
          case AuthStatus.unauthenticated:
          case AuthStatus.loading:
            return const LoginScreen();
        }
      },
    );
  }
}
