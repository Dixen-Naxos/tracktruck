import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

enum UtilityPointType { gasStation, garage, toll, truckRest, serviceArea }

extension UtilityPointTypeX on UtilityPointType {
  Color get color {
    switch (this) {
      case UtilityPointType.gasStation:
        return Colors.red.shade600;
      case UtilityPointType.garage:
        return Colors.grey.shade300;
      case UtilityPointType.toll:
        return Colors.purple.shade600;
      case UtilityPointType.truckRest:
        return Colors.blue.shade600;
      case UtilityPointType.serviceArea:
        return const Color(0xFFB7E4C7); // pastel green
    }
  }

  Color get foreground {
    switch (this) {
      case UtilityPointType.garage:
      case UtilityPointType.serviceArea:
        return Colors.black87;
      default:
        return Colors.white;
    }
  }

  String get label {
    switch (this) {
      case UtilityPointType.gasStation:
        return 'Gas Station';
      case UtilityPointType.garage:
        return 'Garage';
      case UtilityPointType.toll:
        return 'Toll';
      case UtilityPointType.truckRest:
        return 'Truck Rest';
      case UtilityPointType.serviceArea:
        return 'Service Area';
    }
  }
}

class UtilityPoint {
  final LatLng position;
  final UtilityPointType type;
  final String name;

  const UtilityPoint({
    required this.position,
    required this.type,
    required this.name,
  });
}

class UtilityPointMarkers extends StatelessWidget {
  final List<UtilityPoint> points;

  const UtilityPointMarkers({super.key, required this.points});

  @override
  Widget build(BuildContext context) {
    return MarkerLayer(
      markers: points.map((point) {
        return Marker(
          point: point.position,
          width: 40,
          height: 40,
          child: Tooltip(
            message: '${point.type.label} • ${point.name}',
            child: Container(
              decoration: BoxDecoration(
                color: point.type.color,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: _UtilityIcon(
                  type: point.type,
                  color: point.type.foreground,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _UtilityIcon extends StatelessWidget {
  final UtilityPointType type;
  final Color color;

  const _UtilityIcon({required this.type, required this.color});

  @override
  Widget build(BuildContext context) {
    switch (type) {
      case UtilityPointType.gasStation:
        return Icon(Icons.local_gas_station, color: color, size: 20);
      case UtilityPointType.garage:
        return Icon(Icons.build, color: color, size: 20);
      case UtilityPointType.toll:
        return Text(
          'T',
          style: TextStyle(
            color: color,
            fontSize: 18,
            fontWeight: FontWeight.w900,
            height: 1,
          ),
        );
      case UtilityPointType.truckRest:
        return Text(
          'Zzz',
          style: TextStyle(
            color: color,
            fontSize: 13,
            fontWeight: FontWeight.w800,
            height: 1,
          ),
        );
      case UtilityPointType.serviceArea:
        return Icon(Icons.local_cafe, color: color, size: 18);
    }
  }
}
