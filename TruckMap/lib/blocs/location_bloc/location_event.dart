part of 'location_bloc.dart';

sealed class LocationEvent {}

final class StartTracking extends LocationEvent {}

final class StopTracking extends LocationEvent {}

final class _PositionUpdated extends LocationEvent {
  final LatLng position;
  _PositionUpdated(this.position);
}
