import 'package:equatable/equatable.dart';
import 'package:latlong2/latlong.dart';
import 'package:truck_map/models/waypoint.dart';
import 'package:truck_map/widgets/road_sign.dart' as rs;
import 'package:truck_map/widgets/utility_point.dart';

class ItineraryStop extends Equatable {
  final String id;
  final String name;
  final String address;
  final LatLng location;
  final List<Waypoint> waypoints;
  final List<LatLng> routePoints;
  final List<UtilityPoint> utilityPoints;

  const ItineraryStop({
    required this.id,
    required this.name,
    required this.address,
    required this.location,
    this.waypoints = const [],
    this.routePoints = const [],
    this.utilityPoints = const [],
  });

  factory ItineraryStop.fromJson(Map<String, dynamic> json) {
    final loc = json['location'] as Map<String, dynamic>;
    return ItineraryStop(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      location: LatLng(
        (loc['lat'] as num).toDouble(),
        (loc['lng'] as num).toDouble(),
      ),
    );
  }

  @override
  List<Object?> get props => [id, name, address, location];
}

class Itinerary extends Equatable {
  final ItineraryStop? startPoint;
  final List<ItineraryStop> orderedStops;
  final double totalDistanceKilometers;
  final int totalDurationSeconds;
  final List<LatLng> routePoints;
  final List<rs.RoadSign> blockingSigns;

  const Itinerary({
    required this.orderedStops,
    required this.totalDistanceKilometers,
    required this.totalDurationSeconds,
    this.startPoint,
    this.routePoints = const [],
    this.blockingSigns = const [],
  });

  factory Itinerary.fromJson(Map<String, dynamic> json) {
    final data = json['itinerary'] as Map<String, dynamic>;
    final encoded = data['encodedPolyline'] as String? ?? '';

    final rawSigns = data['blockingSigns'] as List? ?? [];
    final signs = rawSigns
        .map((s) => _parseSign(s as Map<String, dynamic>))
        .whereType<rs.RoadSign>()
        .toList();

    ItineraryStop? startPoint;
    if (data['startPoint'] != null) {
      startPoint = ItineraryStop.fromJson(
          data['startPoint'] as Map<String, dynamic>);
    }

    return Itinerary(
      startPoint: startPoint,
      orderedStops: (data['orderedStops'] as List)
          .map((s) => ItineraryStop.fromJson(s as Map<String, dynamic>))
          .toList(),
      totalDistanceKilometers:
          (data['totalDistanceKilometers'] as num).toDouble(),
      totalDurationSeconds: data['totalDurationSeconds'] as int,
      routePoints: _decodePolyline(encoded),
      blockingSigns: signs,
    );
  }

  static rs.RoadSign? _parseSign(Map<String, dynamic> s) {
    final loc = s['location'] as Map<String, dynamic>?;
    if (loc == null) return null;
    final position = LatLng(
      (loc['lat'] as num).toDouble(),
      (loc['lng'] as num).toDouble(),
    );
    final value = s['value'] != null ? (s['value'] as num).toDouble() : null;
    rs.RoadSignType type;
    switch (s['type'] as String) {
      case 'hgv_forbidden':
        type = rs.RoadSignType.noTrucks;
      case 'maxheight':
        type = rs.RoadSignType.heightLimit;
      case 'maxweight':
        type = rs.RoadSignType.weightLimit;
      case 'maxwidth':
        type = rs.RoadSignType.widthLimit;
      default:
        return null;
    }
    // Les panneaux de limite sans valeur ne sont pas affichables
    if (!type.isPictogram && value == null) return null;
    return rs.RoadSign(position: position, type: type, value: value);
  }

  /// Decodes a Google Maps encoded polyline string into a list of LatLng.
  static List<LatLng> _decodePolyline(String encoded) {
    if (encoded.isEmpty) return [];
    final points = <LatLng>[];
    int index = 0;
    int lat = 0;
    int lng = 0;
    while (index < encoded.length) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      points.add(LatLng(lat / 1e5, lng / 1e5));
    }
    return points;
  }

  List<Waypoint> get waypoints =>
      orderedStops.expand((s) => s.waypoints).toList();

  List<UtilityPoint> get utilityPoints =>
      orderedStops.expand((s) => s.utilityPoints).toList();

  String get formattedDuration {
    final h = totalDurationSeconds ~/ 3600;
    final m = (totalDurationSeconds % 3600) ~/ 60;
    if (h > 0) return '${h}h${m.toString().padLeft(2, '0')}';
    return '${m}min';
  }

  @override
  List<Object?> get props => [
        startPoint,
        orderedStops,
        totalDistanceKilometers,
        totalDurationSeconds,
        routePoints,
        blockingSigns,
      ];
}
