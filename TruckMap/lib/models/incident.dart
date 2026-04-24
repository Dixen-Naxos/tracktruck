enum IncidentType { breakdown, accident, obstacle, delay, other }

extension IncidentTypeX on IncidentType {
  String get label => switch (this) {
        IncidentType.breakdown => 'Panne',
        IncidentType.accident => 'Accident',
        IncidentType.obstacle => 'Obstacle',
        IncidentType.delay => 'Retard',
        IncidentType.other => 'Autre',
      };
}

class Incident {
  final String deliveryId;
  final IncidentType type;
  final String? description;
  final double? latitude;
  final double? longitude;

  const Incident({
    required this.deliveryId,
    required this.type,
    this.description,
    this.latitude,
    this.longitude,
  });

  Map<String, dynamic> toJson() => {
        'deliveryId': deliveryId,
        'type': type.name,
        if (description != null && description!.isNotEmpty)
          'description': description,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
      };
}
