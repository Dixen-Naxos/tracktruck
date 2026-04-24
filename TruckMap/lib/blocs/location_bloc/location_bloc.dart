import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:truck_map/repositories/driver_position_repository.dart';

part 'location_event.dart';
part 'location_state.dart';

class LocationBloc extends Bloc<LocationEvent, LocationState> {
  final DriverPositionRepository _driverPositionRepository;
  StreamSubscription<Position>? _positionSubscription;
  Timer? _sendPositionTimer;

  static const _sendInterval = Duration(minutes: 1);

  LocationBloc({required DriverPositionRepository driverPositionRepository})
      : _driverPositionRepository = driverPositionRepository,
        super(const LocationState()) {
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
      final latLng = LatLng(position.latitude, position.longitude);
      emit(state.copyWith(
        status: LocationStatus.tracking,
        position: latLng,
      ));
      _sendPositionToApi(latLng);
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

    // Send position to API every minute
    _sendPositionTimer?.cancel();
    _sendPositionTimer = Timer.periodic(_sendInterval, (_) {
      if (state.position != null) {
        _sendPositionToApi(state.position!);
      }
    });
  }

  void _onStopTracking(
    StopTracking event,
    Emitter<LocationState> emit,
  ) {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _sendPositionTimer?.cancel();
    _sendPositionTimer = null;
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

  void _sendPositionToApi(LatLng position) {
    _driverPositionRepository.sendPosition(position).catchError((e) {
      debugPrint('[LocationBloc] Failed to send position: $e');
    });
  }

  @override
  Future<void> close() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _sendPositionTimer?.cancel();
    _sendPositionTimer = null;
    return super.close();
  }
}
