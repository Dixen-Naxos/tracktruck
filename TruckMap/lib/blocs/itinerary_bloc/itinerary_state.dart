part of 'itinerary_bloc.dart';

enum ItineraryStatus { initial, loading, success, error }

class ItineraryState {
  final ItineraryStatus status;
  final Itinerary? itinerary;
  final String? errorMessage;
  final DateTime? lastUpdated;

  const ItineraryState({
    this.status = ItineraryStatus.initial,
    this.itinerary,
    this.errorMessage,
    this.lastUpdated,
  });

  ItineraryState copyWith({
    ItineraryStatus? status,
    Itinerary? itinerary,
    String? errorMessage,
    bool clearError = false,
    DateTime? lastUpdated,
  }) {
    return ItineraryState(
      status: status ?? this.status,
      itinerary: itinerary ?? this.itinerary,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }
}
