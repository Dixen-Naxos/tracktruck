part of 'auth_bloc.dart';

abstract class AuthEvent {}

class AuthStarted extends AuthEvent {}

class _AuthUserChanged extends AuthEvent {
  final User? user;
  _AuthUserChanged(this.user);
}

class AuthSignInWithEmail extends AuthEvent {
  final String email;
  final String password;
  AuthSignInWithEmail({required this.email, required this.password});
}

class AuthSignInWithGoogle extends AuthEvent {}

class AuthSignOutRequested extends AuthEvent {}
