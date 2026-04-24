import 'dart:convert';

import 'package:http/http.dart' as http;

import 'package:truck_map/config.dart';
import 'package:truck_map/models/incident.dart';

class IncidentRepository {
  final http.Client _client;

  IncidentRepository({required http.Client client}) : _client = client;

  Future<void> createIncident(Incident incident) async {
    final response = await _client.post(
      Uri.parse('${AppConfig.apiBaseUrl}/incidents'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(incident.toJson()),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(
          "Erreur lors du signalement de l'incident : ${response.statusCode}");
    }
  }
}
