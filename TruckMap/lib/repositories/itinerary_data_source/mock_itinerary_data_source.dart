import 'package:latlong2/latlong.dart';
import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/models/waypoint.dart';
import 'package:truck_map/repositories/itinerary_data_source/itinerary_data_source.dart';

class MockItineraryDataSource implements ItineraryDataSource {
  @override
  Future<Itinerary> fetchItinerary() async {
    await Future.delayed(const Duration(milliseconds: 300));

    return Itinerary(
      id: 'itinerary-001',
      name: 'Paris Walking Tour',
      waypoints: const [
        Waypoint(
          position: LatLng(48.8530, 2.3499),
          name: 'Notre-Dame',
          description: 'Starting point',
        ),
        Waypoint(
          position: LatLng(48.8606, 2.3376),
          name: 'Louvre Museum',
        ),
        Waypoint(
          position: LatLng(48.8738, 2.2950),
          name: 'Arc de Triomphe',
          description: 'Halfway point',
        ),
        Waypoint(
          position: LatLng(48.8584, 2.2945),
          name: 'Eiffel Tower',
          description: 'Final destination',
        ),
      ],
      // Dense route points following actual Paris streets
      routePoints: const [
        // -- Segment 1: Notre-Dame → Louvre --
        // Start at Notre-Dame
        LatLng(48.8530, 2.3499),
        // Cross Pont au Double to left bank of Seine
        LatLng(48.8530, 2.3488),
        // Head west along Quai de Montebello
        LatLng(48.8528, 2.3470),
        LatLng(48.8527, 2.3450),
        // Continue along Quai Saint-Michel
        LatLng(48.8533, 2.3430),
        LatLng(48.8536, 2.3415),
        // Cross Pont Saint-Michel to Île de la Cité
        LatLng(48.8543, 2.3410),
        // Along Quai des Orfèvres
        LatLng(48.8555, 2.3420),
        // Cross Pont Neuf to right bank
        LatLng(48.8567, 2.3413),
        LatLng(48.8572, 2.3405),
        // Along Quai du Louvre heading east
        LatLng(48.8580, 2.3400),
        LatLng(48.8585, 2.3395),
        LatLng(48.8590, 2.3390),
        // Turn south into Louvre courtyard area
        LatLng(48.8595, 2.3385),
        LatLng(48.8600, 2.3380),
        // Arrive at Louvre
        LatLng(48.8606, 2.3376),

        // -- Segment 2: Louvre → Arc de Triomphe --
        // Head west along Rue de Rivoli
        LatLng(48.8610, 2.3360),
        LatLng(48.8615, 2.3340),
        LatLng(48.8618, 2.3315),
        // Continue on Rue de Rivoli past Palais Royal
        LatLng(48.8625, 2.3280),
        LatLng(48.8630, 2.3250),
        // Pass Place de la Concorde / Jardin des Tuileries
        LatLng(48.8637, 2.3220),
        LatLng(48.8643, 2.3190),
        LatLng(48.8649, 2.3160),
        // Enter Place de la Concorde
        LatLng(48.8656, 2.3130),
        LatLng(48.8660, 2.3110),
        // Start of Avenue des Champs-Élysées
        LatLng(48.8665, 2.3080),
        LatLng(48.8670, 2.3050),
        // Along Champs-Élysées heading northwest
        LatLng(48.8678, 2.3020),
        LatLng(48.8685, 2.2990),
        LatLng(48.8692, 2.2970),
        LatLng(48.8700, 2.2960),
        // Rond-Point des Champs-Élysées
        LatLng(48.8707, 2.2955),
        LatLng(48.8715, 2.2950),
        // Upper Champs-Élysées
        LatLng(48.8722, 2.2948),
        LatLng(48.8730, 2.2950),
        // Arrive at Arc de Triomphe / Place de l'Étoile
        LatLng(48.8738, 2.2950),

        // -- Segment 3: Arc de Triomphe → Eiffel Tower --
        // Head south on Avenue d'Iéna
        LatLng(48.8730, 2.2945),
        LatLng(48.8720, 2.2940),
        LatLng(48.8710, 2.2938),
        // Continue south on Avenue d'Iéna
        LatLng(48.8700, 2.2935),
        LatLng(48.8690, 2.2933),
        // Pass Place d'Iéna / Trocadéro area
        LatLng(48.8680, 2.2930),
        LatLng(48.8670, 2.2928),
        // Approach Trocadéro
        LatLng(48.8660, 2.2925),
        LatLng(48.8650, 2.2928),
        // Cross Pont d'Iéna over the Seine
        LatLng(48.8640, 2.2930),
        LatLng(48.8630, 2.2932),
        LatLng(48.8620, 2.2935),
        // Approach Champ de Mars
        LatLng(48.8610, 2.2937),
        LatLng(48.8600, 2.2940),
        LatLng(48.8590, 2.2942),
        // Arrive at Eiffel Tower
        LatLng(48.8584, 2.2945),
      ],
    );
  }
}
