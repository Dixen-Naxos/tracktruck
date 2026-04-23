import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:truck_map/services/auth_service.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService authService;
  StreamSubscription<User?>? _authSubscription;

  AuthBloc({required this.authService}) : super(const AuthState()) {
    on<AuthStarted>(_onStarted);
    on<_AuthUserChanged>(_onUserChanged);
    on<AuthSignInWithEmail>(_onSignInWithEmail);
    on<AuthSignInWithGoogle>(_onSignInWithGoogle);
    on<AuthSignOutRequested>(_onSignOut);
  }

  void _onStarted(AuthStarted event, Emitter<AuthState> emit) {
    _authSubscription = authService.authStateChanges.listen(
      (user) => add(_AuthUserChanged(user)),
    );
  }

  void _onUserChanged(_AuthUserChanged event, Emitter<AuthState> emit) {
    if (event.user != null) {
      emit(state.copyWith(
        status: AuthStatus.authenticated,
        user: event.user,
        clearError: true,
      ));
    } else {
      emit(state.copyWith(
        status: AuthStatus.unauthenticated,
        clearUser: true,
        clearError: true,
      ));
    }
  }

  Future<void> _onSignInWithEmail(
    AuthSignInWithEmail event,
    Emitter<AuthState> emit,
  ) async {
    emit(state.copyWith(status: AuthStatus.loading, clearError: true));
    try {
      await authService.signInWithEmail(event.email, event.password);
    } on FirebaseAuthException catch (e) {
      emit(state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: _mapFirebaseError(e.code),
      ));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onSignInWithGoogle(
    AuthSignInWithGoogle event,
    Emitter<AuthState> emit,
  ) async {
    emit(state.copyWith(status: AuthStatus.loading, clearError: true));
    try {
      await authService.signInWithGoogle();
    } on FirebaseAuthException catch (e) {
      emit(state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: _mapFirebaseError(e.code),
      ));
    } catch (e) {
      final msg = e.toString();
      emit(state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: msg.contains('cancelled') ? null : msg,
      ));
    }
  }

  Future<void> _onSignOut(
    AuthSignOutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await authService.signOut();
  }

  String _mapFirebaseError(String code) {
    switch (code) {
      case 'user-not-found':
        return 'Aucun compte trouvé pour cet email.';
      case 'wrong-password':
      case 'invalid-credential':
        return 'Email ou mot de passe incorrect.';
      case 'invalid-email':
        return 'Adresse email invalide.';
      case 'user-disabled':
        return 'Ce compte a été désactivé.';
      case 'too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard.';
      default:
        return 'Échec de la connexion. Réessayez.';
    }
  }

  @override
  Future<void> close() {
    _authSubscription?.cancel();
    return super.close();
  }
}
