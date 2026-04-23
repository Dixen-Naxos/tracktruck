import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:truck_map/blocs/itinerary_bloc/itinerary_bloc.dart';
import 'package:truck_map/blocs/location_bloc/location_bloc.dart';
import 'package:truck_map/repositories/itinerary_data_source/mock_itinerary_data_source.dart';
import 'package:truck_map/repositories/itinerary_repository.dart';
import 'package:truck_map/screens/map/map_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Swap MockItineraryDataSource -> RemoteItineraryDataSource when API is ready
  final dataSource = MockItineraryDataSource();
  final itineraryRepository = ItineraryRepository(dataSource: dataSource);

  runApp(TruckMap(itineraryRepository: itineraryRepository));
}

class TruckMap extends StatelessWidget {
  final ItineraryRepository itineraryRepository;

  const TruckMap({super.key, required this.itineraryRepository});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider.value(
      value: itineraryRepository,
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (_) =>
                ItineraryBloc(itineraryRepository: itineraryRepository)
                  ..add(StartPolling()),
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
          home: const MapScreen(),
        ),
      ),
    );
  }
}
