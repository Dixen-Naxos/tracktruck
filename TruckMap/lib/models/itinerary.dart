import 'package:equatable/equatable.dart';
import 'package:latlong2/latlong.dart';
import 'package:truck_map/models/waypoint.dart';
import 'package:truck_map/widgets/road_sign.dart';
import 'package:truck_map/widgets/utility_point.dart';

class Itinerary extends Equatable {
  final String id;
  final String name;
  final List<Waypoint> waypoints;
  final List<LatLng> routePoints;
  final List<UtilityPoint> utilityPoints;
  final List<RoadSign> roadSigns;

  const Itinerary({
    required this.id,
    required this.name,
    required this.waypoints,
    required this.routePoints,
    this.utilityPoints = const [],
    this.roadSigns = const [],
  });

  factory Itinerary.fromJson(Map<String, dynamic> json) {
    return Itinerary(
      id: json['id'] as String,
      name: json['name'] as String,
      waypoints: (json['waypoints'] as List)
          .map((w) => Waypoint.fromJson(w as Map<String, dynamic>))
          .toList(),
      routePoints: (json['route_points'] as List)
          .map((p) => LatLng(
                (p['lat'] as num).toDouble(),
                (p['lng'] as num).toDouble(),
              ))
          .toList(),
    );
  }

  @override
  List<Object?> get props =>
      [id, name, waypoints, routePoints, utilityPoints, roadSigns];
}
