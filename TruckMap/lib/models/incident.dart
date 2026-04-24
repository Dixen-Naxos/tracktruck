enum IncidentType { breakdown, accident, obstacle, delay, other }

extension IncidentTypeX on IncidentType {
  String get label => switch (this) {
        IncidentType.breakdown => 'Panne',
        IncidentType.accident => 'Accident',
        IncidentType.obstacle => 'Obstacle',
        IncidentType.delay => 'Retard',
        IncidentType.other => 'Autre',
      };

  String get apiValue => switch (this) {
        IncidentType.breakdown => 'vehicle_breakdown',
        IncidentType.accident => 'accident',
        IncidentType.obstacle => 'obstacle',
        IncidentType.delay => 'delivery_delayed',
        IncidentType.other => 'other',
      };
}

class Incident {
  final String deliveryId;
  final IncidentType type;
  final String? description;
  final double? latitude;
  final double? longitude;
  final int? expectedDelayMinutes;

  const Incident({
    required this.deliveryId,
    required this.type,
    this.description,
    this.latitude,
    this.longitude,
    this.expectedDelayMinutes,
  });

  Map<String, dynamic> toJson() => {
        'deliveryId': deliveryId,
        'type': type.apiValue,
        if (description != null && description!.isNotEmpty)
          'comment': description,
        if (latitude != null && longitude != null)
          'position': {'lat': latitude, 'lng': longitude},
        if (type == IncidentType.delay && expectedDelayMinutes != null)
          'expectedDelayMinutes': expectedDelayMinutes,
      };
}
