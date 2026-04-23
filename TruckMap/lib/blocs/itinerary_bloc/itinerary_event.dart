part of 'itinerary_bloc.dart';

sealed class ItineraryEvent {}

final class StartPolling extends ItineraryEvent {}

final class StopPolling extends ItineraryEvent {}

final class _PollTick extends ItineraryEvent {}
