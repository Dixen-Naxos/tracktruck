import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class ItineraryPolyline extends StatelessWidget {
  final List<LatLng> routePoints;

  const ItineraryPolyline({super.key, required this.routePoints});

  @override
  Widget build(BuildContext context) {
    return PolylineLayer(
      polylines: [
        // Dark border underneath
        Polyline(
          points: routePoints,
          color: Colors.blue.shade900,
          strokeWidth: 8.0,
        ),
        // Main route line on top
        Polyline(
          points: routePoints,
          color: Colors.blue.shade400,
          strokeWidth: 5.0,
        ),
      ],
    );
  }
}
