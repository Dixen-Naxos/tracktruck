
import 'package:truck_map/models/itinerary.dart';

abstract class ItineraryDataSource {
  Future<Itinerary> computeItinerary({
    required String startPointId,
    required List<String> toVisitIds,
  });
}
