import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/repositories/itinerary_data_source/itinerary_data_source.dart';

class ItineraryRepository {
  final ItineraryDataSource dataSource;

  ItineraryRepository({required this.dataSource});

  Future<Itinerary> fetchItinerary() {
    return dataSource.fetchItinerary();
  }
}
