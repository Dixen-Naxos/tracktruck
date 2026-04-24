import 'package:latlong2/latlong.dart';
import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/repositories/itinerary_data_source/itinerary_data_source.dart';
import 'package:truck_map/widgets/road_sign.dart';
import 'package:truck_map/widgets/utility_point.dart';

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
      utilityPoints: const [
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
      roadSigns: const [
        RoadSign(
          position: LatLng(48.8528, 2.3470),
          type: RoadSignType.heightLimit,
          value: 3.5,
        ),
        RoadSign(
          position: LatLng(48.8572, 2.3405),
          type: RoadSignType.weightLimit,
          value: 7.5,
        ),
        RoadSign(
          position: LatLng(48.8615, 2.3340),
          type: RoadSignType.widthLimit,
          value: 2.3,
        ),
        RoadSign(
          position: LatLng(48.8643, 2.3190),
          type: RoadSignType.noTrucks,
        ),
        RoadSign(
          position: LatLng(48.8678, 2.3020),
          type: RoadSignType.lengthLimit,
          value: 12,
        ),
        RoadSign(
          position: LatLng(48.8730, 2.2950),
          type: RoadSignType.heightLimit,
          value: 4,
        ),
        RoadSign(
          position: LatLng(48.8635, 2.2932),
          type: RoadSignType.noHazardousMaterials,
        ),
        RoadSign(
          position: LatLng(48.8590, 2.3390),
          type: RoadSignType.axleWeightLimit,
          value: 5.5,
        ),
        RoadSign(
          position: LatLng(48.8625, 2.3260),
          type: RoadSignType.weightLimit,
          value: 16,
        ),
        RoadSign(
          position: LatLng(48.8649, 2.3160),
          type: RoadSignType.heightLimit,
          value: 5.5,
        ),
      ],
    );
  }
}
