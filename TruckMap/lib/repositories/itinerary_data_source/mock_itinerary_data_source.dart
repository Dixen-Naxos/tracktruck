import 'package:latlong2/latlong.dart';
import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/repositories/itinerary_data_source/itinerary_data_source.dart';
import 'package:truck_map/widgets/utility_point.dart';

class MockItineraryDataSource implements ItineraryDataSource {
  @override
  Future<Itinerary> computeItinerary({
    required String deliveryId,
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
          utilityPoints: [
            UtilityPoint(
              position: LatLng(48.8548, 2.3455),
              type: UtilityPointType.gasStation,
              name: 'Total Saint-Michel',
            ),
            UtilityPoint(
              position: LatLng(48.8620, 2.3300),
              type: UtilityPointType.serviceArea,
              name: 'Aire des Tuileries',
            ),
            UtilityPoint(
              position: LatLng(48.8660, 2.3100),
              type: UtilityPointType.toll,
              name: 'Péage Concorde',
            ),
            UtilityPoint(
              position: LatLng(48.8695, 2.2975),
              type: UtilityPointType.garage,
              name: 'Garage Champs-Élysées',
            ),
            UtilityPoint(
              position: LatLng(48.8710, 2.2945),
              type: UtilityPointType.gasStation,
              name: 'Shell Étoile',
            ),
            UtilityPoint(
              position: LatLng(48.8670, 2.2930),
              type: UtilityPointType.truckRest,
              name: 'Aire Trocadéro',
            ),
            UtilityPoint(
              position: LatLng(48.8615, 2.2935),
              type: UtilityPointType.toll,
              name: 'Péage Iéna',
            ),
            UtilityPoint(
              position: LatLng(48.8595, 2.2943),
              type: UtilityPointType.garage,
              name: 'Garage Champ-de-Mars',
            ),
          ],
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
