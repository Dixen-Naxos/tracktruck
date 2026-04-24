import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:truck_map/repositories/delivery_repository.dart';
import 'package:truck_map/repositories/driver_position_repository.dart';
import 'package:truck_map/repositories/incident_repository.dart';
import 'package:truck_map/repositories/itinerary_data_source/mock_itinerary_data_source.dart';
import 'package:truck_map/repositories/itinerary_repository.dart';
import 'package:truck_map/services/auth_http_client.dart';
import 'package:truck_map/services/auth_service.dart';
import 'package:truck_map/main.dart';

/// Fake implementation that satisfies the [AuthService] contract without
/// touching Firebase (no [FirebaseAuth.instance] is ever created).
class _FakeAuthService implements AuthService {
  @override
  Stream<User?> get authStateChanges => Stream.value(null);

  @override
  Future<String?> getIdToken() async => null;

  @override
  Future<void> signInWithEmail(String email, String password) async {}

  @override
  Future<void> signInWithGoogle() async {}

  @override
  Future<void> signOut() async {}
}

void main() {
  testWidgets('App renders without errors', (WidgetTester tester) async {
    final authService = _FakeAuthService();
    final httpClient = AuthHttpClient(authService: authService);
    final itineraryRepository = ItineraryRepository(
      dataSource: MockItineraryDataSource(),
    );
    final deliveryRepository = DeliveryRepository();
    final incidentRepository = IncidentRepository(client: httpClient);
    final driverPositionRepository =
        DriverPositionRepository(client: httpClient);

    await tester.pumpWidget(TruckMap(
      authService: authService,
      httpClient: httpClient,
      itineraryRepository: itineraryRepository,
      deliveryRepository: deliveryRepository,
      incidentRepository: incidentRepository,
      driverPositionRepository: driverPositionRepository,
    ));

    // Allow the AuthBloc to process the authStateChanges stream and
    // transition from unknown → unauthenticated, showing LoginScreen.
    await tester.pump();

    expect(find.text('TruckMap'), findsOneWidget);
  });
}
