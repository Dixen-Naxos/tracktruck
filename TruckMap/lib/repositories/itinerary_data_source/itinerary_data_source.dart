import 'package:truck_map/models/itinerary.dart';

abstract class ItineraryDataSource {
  Future<Itinerary> fetchItinerary();
}
