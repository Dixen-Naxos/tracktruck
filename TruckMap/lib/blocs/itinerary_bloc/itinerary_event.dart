part of 'itinerary_bloc.dart';

sealed class ItineraryEvent {}

final class ComputeItinerary extends ItineraryEvent {
  final String startPointId;
  final List<String> toVisitIds;

  ComputeItinerary({
    required this.startPointId,
    required this.toVisitIds,
  });
}

final class StopPolling extends ItineraryEvent {}

final class _PollTick extends ItineraryEvent {}
