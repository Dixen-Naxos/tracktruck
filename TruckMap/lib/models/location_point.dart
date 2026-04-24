import 'package:equatable/equatable.dart';

class LocationPoint extends Equatable {
  final String id;
  final String name;
  final String address;

  const LocationPoint({
    required this.id,
    required this.name,
    required this.address,
  });

  factory LocationPoint.fromJson(Map<String, dynamic> json) {
    final raw = json['_id'];
    final id = raw is String
        ? raw
        : (raw is Map ? (raw[r'$oid'] as String? ?? raw.toString()) : raw.toString());
    return LocationPoint(
      id: id,
      name: json['name'] as String,
      address: json['address'] as String,
    );
  }

  @override
  List<Object?> get props => [id, name, address];
}
