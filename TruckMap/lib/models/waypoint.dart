import 'package:equatable/equatable.dart';
import 'package:latlong2/latlong.dart';

class Waypoint extends Equatable {
  final LatLng position;
  final String name;
  final String? description;

  const Waypoint({
    required this.position,
    required this.name,
    this.description,
  });

  factory Waypoint.fromJson(Map<String, dynamic> json) {
    return Waypoint(
      position: LatLng(
        (json['lat'] as num).toDouble(),
        (json['lng'] as num).toDouble(),
      ),
      name: json['name'] as String,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'lat': position.latitude,
        'lng': position.longitude,
        'name': name,
        'description': description,
      };

  @override
  List<Object?> get props => [position, name, description];
}
