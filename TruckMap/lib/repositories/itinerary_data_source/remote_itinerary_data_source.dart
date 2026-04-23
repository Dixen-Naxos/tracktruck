import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:truck_map/config.dart';
import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/repositories/itinerary_data_source/itinerary_data_source.dart';

class RemoteItineraryDataSource implements ItineraryDataSource {
  final http.Client client;

  RemoteItineraryDataSource({http.Client? client})
      : client = client ?? http.Client();

  @override
  Future<Itinerary> fetchItinerary() async {
    final response = await client.get(
      Uri.parse('${AppConfig.apiBaseUrl}/itinerary'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to fetch itinerary: ${response.statusCode}');
    }
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return Itinerary.fromJson(json);
  }
}
