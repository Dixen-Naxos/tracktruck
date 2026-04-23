import 'package:equatable/equatable.dart';

enum DeliveryStatus { planned, started, done }

extension DeliveryStatusX on DeliveryStatus {
  String get label {
    switch (this) {
      case DeliveryStatus.planned:
        return 'Planifiée';
      case DeliveryStatus.started:
        return 'En cours';
      case DeliveryStatus.done:
        return 'Terminée';
    }
  }
}

class Delivery extends Equatable {
  final String id;
  final String departureWarehouseId;
  final List<String> storeIds;
  final double totalDistanceKm;
  final int totalDurationSeconds;
  final DateTime plannedStartAt;
  final DateTime? actualStartAt;
  final DeliveryStatus status;

  const Delivery({
    required this.id,
    required this.departureWarehouseId,
    required this.storeIds,
    required this.totalDistanceKm,
    required this.totalDurationSeconds,
    required this.plannedStartAt,
    this.actualStartAt,
    required this.status,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: _parseId(json['_id']),
      departureWarehouseId: _parseId(json['departureWarehouseId']),
      storeIds: (json['storeIds'] as List).map(_parseId).toList(),
      totalDistanceKm: (json['totalDistanceKm'] as num).toDouble(),
      totalDurationSeconds: json['totalDurationSeconds'] as int,
      plannedStartAt: DateTime.parse(json['plannedStartAt'] as String),
      actualStartAt: json['actualStartAt'] != null
          ? DateTime.parse(json['actualStartAt'] as String)
          : null,
      status: _parseStatus(json['status'] as String),
    );
  }

  static String _parseId(dynamic raw) {
    if (raw is String) return raw;
    if (raw is Map) return raw[r'$oid'] as String? ?? raw.toString();
    return raw.toString();
  }

  static DeliveryStatus _parseStatus(String s) {
    switch (s) {
      case 'started':
        return DeliveryStatus.started;
      case 'done':
        return DeliveryStatus.done;
      default:
        return DeliveryStatus.planned;
    }
  }

  String get formattedDuration {
    final h = totalDurationSeconds ~/ 3600;
    final m = (totalDurationSeconds % 3600) ~/ 60;
    if (h > 0) return '${h}h${m.toString().padLeft(2, '0')}';
    return '${m}min';
  }

  @override
  List<Object?> get props => [id];
}
