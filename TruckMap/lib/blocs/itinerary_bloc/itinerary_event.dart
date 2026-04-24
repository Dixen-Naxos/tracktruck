part of 'itinerary_bloc.dart';

sealed class ItineraryEvent {}

final class ComputeItinerary extends ItineraryEvent {
  final String deliveryId;

  ComputeItinerary({required this.deliveryId});
}

final class StopPolling extends ItineraryEvent {}

final class _PollTick extends ItineraryEvent {}
