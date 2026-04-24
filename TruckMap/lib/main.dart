import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'package:truck_map/blocs/auth_bloc/auth_bloc.dart';
import 'package:truck_map/blocs/delivery_bloc/delivery_bloc.dart';
import 'package:truck_map/blocs/incident_bloc/incident_bloc.dart';
import 'package:truck_map/blocs/itinerary_bloc/itinerary_bloc.dart';
import 'package:truck_map/blocs/location_bloc/location_bloc.dart';
import 'package:truck_map/firebase_options.dart';
import 'package:truck_map/repositories/delivery_repository.dart';
import 'package:truck_map/repositories/incident_repository.dart';
import 'package:truck_map/repositories/itinerary_data_source/remote_itinerary_data_source.dart';
import 'package:truck_map/repositories/itinerary_repository.dart';
import 'package:truck_map/screens/auth/auth_gate.dart';
import 'package:truck_map/services/auth_http_client.dart';
import 'package:truck_map/services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await initializeDateFormatting('fr_FR');

  final authService = AuthService();
  final httpClient = AuthHttpClient(authService: authService);

  final itineraryRepository = ItineraryRepository(
    dataSource: RemoteItineraryDataSource(client: httpClient),
  );
  final deliveryRepository = DeliveryRepository(client: httpClient);
  final incidentRepository = IncidentRepository(client: httpClient);

  runApp(TruckMap(
    authService: authService,
    httpClient: httpClient,
    itineraryRepository: itineraryRepository,
    deliveryRepository: deliveryRepository,
    incidentRepository: incidentRepository,
  ));
}

class TruckMap extends StatelessWidget {
  final AuthService authService;
  final AuthHttpClient httpClient;
  final ItineraryRepository itineraryRepository;
  final DeliveryRepository deliveryRepository;
  final IncidentRepository incidentRepository;

  const TruckMap({
    super.key,
    required this.authService,
    required this.httpClient,
    required this.itineraryRepository,
    required this.deliveryRepository,
    required this.incidentRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authService),
        RepositoryProvider.value(value: httpClient),
        RepositoryProvider.value(value: itineraryRepository),
        RepositoryProvider.value(value: incidentRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (_) =>
                AuthBloc(authService: authService)..add(AuthStarted()),
          ),
          BlocProvider(
            create: (_) =>
                ItineraryBloc(itineraryRepository: itineraryRepository),
          ),
          BlocProvider(
            create: (_) => DeliveryBloc(repository: deliveryRepository),
          ),
          BlocProvider(
            create: (_) => IncidentBloc(repository: incidentRepository),
          ),
          BlocProvider(
            create: (_) => LocationBloc()..add(StartTracking()),
          ),
        ],
        child: MaterialApp(
          title: 'TruckMap',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorSchemeSeed: Colors.blue,
            useMaterial3: true,
          ),
          home: const AuthGate(),
        ),
      ),
    );
  }
}
