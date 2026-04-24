import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:truck_map/config.dart';
import 'package:truck_map/models/location_point.dart';

class LocationsRepository {
  final http.Client _client;

  LocationsRepository({http.Client? client}) : _client = client ?? http.Client();

  Future<List<LocationPoint>> listWarehouses() => _list('/warehouses');
  Future<List<LocationPoint>> listStores() => _list('/stores');

  Future<List<LocationPoint>> _list(String path) async {
    final response = await _client.get(Uri.parse('${AppConfig.apiBaseUrl}$path'));
    if (response.statusCode != 200) {
      throw Exception('Failed to load $path: ${response.statusCode}');
    }
    final list = jsonDecode(response.body) as List;
    return list
        .map((e) => LocationPoint.fromJson(e as Map<String, dynamic>))
        .toList();
  }

}
