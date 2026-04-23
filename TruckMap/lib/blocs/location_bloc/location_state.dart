part of 'location_bloc.dart';

enum LocationStatus { initial, loading, tracking, error }

class LocationState {
  final LocationStatus status;
  final LatLng? position;
  final String? errorMessage;

  const LocationState({
    this.status = LocationStatus.initial,
    this.position,
    this.errorMessage,
  });

  LocationState copyWith({
    LocationStatus? status,
    LatLng? position,
    String? errorMessage,
  }) {
    return LocationState(
      status: status ?? this.status,
      position: position ?? this.position,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}
