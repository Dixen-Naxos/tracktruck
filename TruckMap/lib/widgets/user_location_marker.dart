import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class UserLocationMarker extends StatelessWidget {
  final LatLng position;

  const UserLocationMarker({super.key, required this.position});

  @override
  Widget build(BuildContext context) {
    return MarkerLayer(
      markers: [
        // Accuracy halo
        Marker(
          point: position,
          width: 60,
          height: 60,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.blue.withAlpha(30),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.blue.withAlpha(60), width: 1),
            ),
          ),
        ),
        // Blue dot
        Marker(
          point: position,
          width: 22,
          height: 22,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.blue,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 6,
                  offset: Offset(0, 2),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
