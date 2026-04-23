part of 'delivery_bloc.dart';

enum DeliveryLoadStatus { initial, loading, success, error }

class DeliveryState extends Equatable {
  final DeliveryLoadStatus status;
  final List<Delivery> deliveries;
  final String? errorMessage;

  const DeliveryState({
    this.status = DeliveryLoadStatus.initial,
    this.deliveries = const [],
    this.errorMessage,
  });

  DeliveryState copyWith({
    DeliveryLoadStatus? status,
    List<Delivery>? deliveries,
    String? errorMessage,
  }) {
    return DeliveryState(
      status: status ?? this.status,
      deliveries: deliveries ?? this.deliveries,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, deliveries, errorMessage];
}
