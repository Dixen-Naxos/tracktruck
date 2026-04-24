import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:truck_map/models/delivery.dart';
import 'package:truck_map/repositories/delivery_repository.dart';

part 'delivery_event.dart';
part 'delivery_state.dart';

class DeliveryBloc extends Bloc<DeliveryEvent, DeliveryState> {
  final DeliveryRepository repository;

  DeliveryBloc({required this.repository}) : super(const DeliveryState()) {
    on<LoadDeliveries>(_onLoad);
  }

  Future<void> _onLoad(
    LoadDeliveries event,
    Emitter<DeliveryState> emit,
  ) async {
    emit(state.copyWith(status: DeliveryLoadStatus.loading));
    try {
      final deliveries = await repository.listDeliveries();
      emit(state.copyWith(
        status: DeliveryLoadStatus.success,
        deliveries: deliveries,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: DeliveryLoadStatus.error,
        errorMessage: e.toString(),
      ));
    }
  }
}
