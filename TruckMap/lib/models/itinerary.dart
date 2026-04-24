import 'package:equatable/equatable.dart';
import 'package:latlong2/latlong.dart';
import 'package:truck_map/models/waypoint.dart';
import 'package:truck_map/widgets/road_sign.dart';
import 'package:truck_map/widgets/utility_point.dart';

class ItineraryStop extends Equatable {
  final String id;
  final String name;
  final String address;
  final LatLng location;
  final List<Waypoint> waypoints;
  final List<LatLng> routePoints;
  final List<UtilityPoint> utilityPoints;
  final List<RoadSign> roadSigns;

  const ItineraryStop({
    required this.id,
    required this.name,
    required this.address,
    required this.location,
    this.waypoints = const [],
    this.routePoints = const [],
    this.utilityPoints = const [],
    this.roadSigns = const [],
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
  final List<ItineraryStop> orderedStops;
  final double totalDistanceKilometers;
  final int totalDurationSeconds;

  const Itinerary({
    required this.orderedStops,
    required this.totalDistanceKilometers,
    required this.totalDurationSeconds,
  });

  factory Itinerary.fromJson(Map<String, dynamic> json) {
    final data = json['itinerary'] as Map<String, dynamic>;
    return Itinerary(
      orderedStops: (data['orderedStops'] as List)
          .map((s) => ItineraryStop.fromJson(s as Map<String, dynamic>))
          .toList(),
      totalDistanceKilometers:
          (data['totalDistanceKilometers'] as num).toDouble(),
      totalDurationSeconds: data['totalDurationSeconds'] as int,
    );
  }

  List<LatLng> get routePoints =>
      orderedStops.expand((s) => s.routePoints).toList();

  List<Waypoint> get waypoints =>
      orderedStops.expand((s) => s.waypoints).toList();

  List<UtilityPoint> get utilityPoints =>
      orderedStops.expand((s) => s.utilityPoints).toList();

  List<RoadSign> get roadSigns =>
      orderedStops.expand((s) => s.roadSigns).toList();

  String get formattedDuration {
    final h = totalDurationSeconds ~/ 3600;
    final m = (totalDurationSeconds % 3600) ~/ 60;
    if (h > 0) return '${h}h${m.toString().padLeft(2, '0')}';
    return '${m}min';
  }

  @override
  List<Object?> get props =>
      [orderedStops, totalDistanceKilometers, totalDurationSeconds];
}
