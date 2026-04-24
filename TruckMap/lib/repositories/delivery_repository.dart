import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:truck_map/config.dart';
import 'package:truck_map/models/delivery.dart';

class DeliveryRepository {
  final http.Client _client;

  DeliveryRepository({http.Client? client}) : _client = client ?? http.Client();

  Future<List<Delivery>> listDeliveries() async {
    final response = await _client.get(
      Uri.parse('${AppConfig.apiBaseUrl}/deliveries'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to load deliveries: ${response.statusCode}');
    }
    final list = jsonDecode(response.body) as List;
    return list
        .map((e) => Delivery.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
