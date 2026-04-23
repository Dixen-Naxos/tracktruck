import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:truck_map/models/waypoint.dart';

class WaypointMarkers extends StatelessWidget {
  final List<Waypoint> waypoints;

  const WaypointMarkers({super.key, required this.waypoints});

  @override
  Widget build(BuildContext context) {
    return MarkerLayer(
      markers: List.generate(waypoints.length, (index) {
        final waypoint = waypoints[index];
        final isFirst = index == 0;
        final isLast = index == waypoints.length - 1;

        final color = isFirst
            ? Colors.green
            : isLast
                ? Colors.red
                : Colors.blue.shade700;

        return Marker(
          point: waypoint.position,
          width: 180,
          height: 70,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        waypoint.name,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey.shade800,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              // Small triangle pointer
              CustomPaint(
                size: const Size(12, 6),
                painter: _TrianglePainter(),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _TrianglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
