import 'package:http/http.dart' as http;
import 'package:truck_map/services/auth_service.dart';

/// http.Client wrapper that injects the Firebase ID token as a Bearer
/// Authorization header on every request.
class AuthHttpClient extends http.BaseClient {
  final http.Client _inner;
  final AuthService _authService;

  AuthHttpClient({required AuthService authService, http.Client? inner})
      : _authService = authService,
        _inner = inner ?? http.Client();

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final token = await _authService.getIdToken();
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    return _inner.send(request);
  }

  @override
  void close() => _inner.close();
}
