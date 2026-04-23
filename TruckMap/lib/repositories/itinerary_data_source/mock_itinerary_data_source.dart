import 'package:latlong2/latlong.dart';
import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/repositories/itinerary_data_source/itinerary_data_source.dart';

class MockItineraryDataSource implements ItineraryDataSource {
  @override
  Future<Itinerary> computeItinerary({
    required String startPointId,
    required List<String> toVisitIds,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));

    return const Itinerary(
      totalDistanceKilometers: 38.4,
      totalDurationSeconds: 5040,
      orderedStops: [
        ItineraryStop(
          id: 'stop-1',
          name: 'Supérette Bastille',
          address: '5 Place de la Bastille, 75004 Paris',
          location: LatLng(48.853, 2.369),
        ),
        ItineraryStop(
          id: 'stop-2',
          name: 'Supérette République',
          address: '16 Place de la République, 75010 Paris',
          location: LatLng(48.867, 2.363),
        ),
        ItineraryStop(
          id: 'stop-3',
          name: 'Supérette Montmartre',
          address: '30 Rue des Abbesses, 75018 Paris',
          location: LatLng(48.884, 2.338),
        ),
      ],
    );
  }
}
