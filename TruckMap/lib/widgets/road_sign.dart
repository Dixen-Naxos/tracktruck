import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:latlong2/latlong.dart';

/// Truck-relevant restriction signs only (physical limits + truck/hazmat bans).
enum RoadSignType {
  noTrucks, // pictogram (B7b)
  noHazardousMaterials, // pictogram (B8)
  heightLimit, // value in meters (B12)
  weightLimit, // value in tonnes (B13)
  axleWeightLimit, // value in tonnes (B13a)
  widthLimit, // value in meters (B15)
  lengthLimit, // value in meters (B16)
}

extension RoadSignTypeX on RoadSignType {
  bool get isPictogram =>
      this == RoadSignType.noTrucks || this == RoadSignType.noHazardousMaterials;

  String? get assetPath {
    switch (this) {
      case RoadSignType.noTrucks:
        return 'assets/road_signs/B7b.svg';
      case RoadSignType.noHazardousMaterials:
        return 'assets/road_signs/B8.svg';
      default:
        return null;
    }
  }

  String get unit {
    switch (this) {
      case RoadSignType.heightLimit:
      case RoadSignType.widthLimit:
      case RoadSignType.lengthLimit:
        return 'm';
      case RoadSignType.weightLimit:
      case RoadSignType.axleWeightLimit:
        return 't';
      case RoadSignType.noTrucks:
      case RoadSignType.noHazardousMaterials:
        return '';
    }
  }

  String get label {
    switch (this) {
      case RoadSignType.noTrucks:
        return 'No trucks';
      case RoadSignType.noHazardousMaterials:
        return 'No hazardous materials';
      case RoadSignType.heightLimit:
        return 'Height limit';
      case RoadSignType.weightLimit:
        return 'Weight limit';
      case RoadSignType.axleWeightLimit:
        return 'Axle weight limit';
      case RoadSignType.widthLimit:
        return 'Width limit';
      case RoadSignType.lengthLimit:
        return 'Length limit';
    }
  }
}

class RoadSign {
  final LatLng position;
  final RoadSignType type;
  // Required for limit signs (height/weight/etc), null for pictograms.
  final double? value;

  const RoadSign({
    required this.position,
    required this.type,
    this.value,
  });
}

class RoadSignMarkers extends StatelessWidget {
  final List<RoadSign> signs;

  const RoadSignMarkers({super.key, required this.signs});

  @override
  Widget build(BuildContext context) {
    return MarkerLayer(
      markers: signs.map((sign) {
        return Marker(
          point: sign.position,
          width: 44,
          height: 44,
          child: Tooltip(
            message: _tooltip(sign),
            child: sign.type.isPictogram
                ? SvgPicture.asset(sign.type.assetPath!,
                    width: 44, height: 44)
                : _LimitBadge(sign: sign),
          ),
        );
      }).toList(),
    );
  }

  String _tooltip(RoadSign sign) {
    if (sign.value == null) return sign.type.label;
    return '${sign.type.label} • ${_formatValue(sign.value!)}${sign.type.unit}';
  }
}

/// White circle with thick red border and the value centered — matches the
/// official French B12/B13/B15/B16 panels with a value baked in.
class _LimitBadge extends StatelessWidget {
  final RoadSign sign;

  const _LimitBadge({required this.sign});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFD32F2F), width: 4),
        boxShadow: const [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              '${_formatValue(sign.value!)}${sign.type.unit}',
              style: const TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.w900,
                fontSize: 16,
                height: 1,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

String _formatValue(double v) {
  if (v == v.roundToDouble()) return v.toInt().toString();
  return v.toString();
}
