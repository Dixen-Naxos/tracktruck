import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

part 'location_event.dart';
part 'location_state.dart';

class LocationBloc extends Bloc<LocationEvent, LocationState> {
  StreamSubscription<Position>? _positionSubscription;

  LocationBloc() : super(const LocationState()) {
    on<StartTracking>(_onStartTracking);
    on<StopTracking>(_onStopTracking);
    on<_PositionUpdated>(_onPositionUpdated);
  }

  Future<void> _onStartTracking(
    StartTracking event,
    Emitter<LocationState> emit,
  ) async {
    emit(state.copyWith(status: LocationStatus.loading));

    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      emit(state.copyWith(
        status: LocationStatus.error,
        errorMessage: 'Location services are disabled',
      ));
      return;
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        emit(state.copyWith(
          status: LocationStatus.error,
          errorMessage: 'Location permission denied',
        ));
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      emit(state.copyWith(
        status: LocationStatus.error,
        errorMessage: 'Location permission permanently denied',
      ));
      return;
    }

    // Get initial position
    try {
      final position = await Geolocator.getCurrentPosition();
      emit(state.copyWith(
        status: LocationStatus.tracking,
        position: LatLng(position.latitude, position.longitude),
      ));
    } catch (e) {
      emit(state.copyWith(
        status: LocationStatus.error,
        errorMessage: e.toString(),
      ));
      return;
    }

    // Stream position updates
    _positionSubscription?.cancel();
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen(
      (position) => add(_PositionUpdated(
        LatLng(position.latitude, position.longitude),
      )),
    );
  }

  void _onStopTracking(
    StopTracking event,
    Emitter<LocationState> emit,
  ) {
    _positionSubscription?.cancel();
    _positionSubscription = null;
  }

  void _onPositionUpdated(
    _PositionUpdated event,
    Emitter<LocationState> emit,
  ) {
    emit(state.copyWith(
      status: LocationStatus.tracking,
      position: event.position,
    ));
  }

  @override
  Future<void> close() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    return super.close();
  }
}
