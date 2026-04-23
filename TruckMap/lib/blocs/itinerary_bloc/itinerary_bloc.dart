import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/repositories/itinerary_repository.dart';

part 'itinerary_event.dart';
part 'itinerary_state.dart';

class ItineraryBloc extends Bloc<ItineraryEvent, ItineraryState> {
  final ItineraryRepository itineraryRepository;

  static const pollInterval = Duration(seconds: 15);

  Timer? _pollTimer;

  ItineraryBloc({required this.itineraryRepository})
      : super(const ItineraryState()) {
    on<StartPolling>(_onStartPolling);
    on<StopPolling>(_onStopPolling);
    on<_PollTick>(_onPollTick);
  }

  Future<void> _onStartPolling(
    StartPolling event,
    Emitter<ItineraryState> emit,
  ) async {
    await _fetchItinerary(emit);

    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(pollInterval, (_) {
      add(_PollTick());
    });
  }

  Future<void> _onStopPolling(
    StopPolling event,
    Emitter<ItineraryState> emit,
  ) async {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> _onPollTick(
    _PollTick event,
    Emitter<ItineraryState> emit,
  ) async {
    await _fetchItinerary(emit);
  }

  Future<void> _fetchItinerary(Emitter<ItineraryState> emit) async {
    if (state.itinerary == null) {
      emit(state.copyWith(status: ItineraryStatus.loading));
    }

    try {
      final itinerary = await itineraryRepository.fetchItinerary();
      emit(state.copyWith(
        status: ItineraryStatus.success,
        itinerary: itinerary,
        lastUpdated: DateTime.now(),
        clearError: true,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: state.itinerary != null
            ? ItineraryStatus.success
            : ItineraryStatus.error,
        errorMessage: e.toString(),
      ));
    }
  }

  @override
  Future<void> close() {
    _pollTimer?.cancel();
    _pollTimer = null;
    return super.close();
  }
}
