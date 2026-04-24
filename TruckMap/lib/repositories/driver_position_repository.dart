import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'package:truck_map/config.dart';

class DriverPositionRepository {
  final http.Client _client;

  DriverPositionRepository({required http.Client client}) : _client = client;

  Future<void> sendPosition(LatLng position) async {
    final response = await _client.post(
      Uri.parse('${AppConfig.apiBaseUrl}/drivers/positions'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'position': {
          'lat': position.latitude,
          'lng': position.longitude,
        },
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      }),
    );
    if (response.statusCode != 201) {
      throw Exception(
          'Failed to send position: ${response.statusCode} ${response.body}');
    }
  }
}
