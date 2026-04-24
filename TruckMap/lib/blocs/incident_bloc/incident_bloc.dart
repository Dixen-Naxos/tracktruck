import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:truck_map/models/incident.dart';
import 'package:truck_map/repositories/incident_repository.dart';

part 'incident_event.dart';
part 'incident_state.dart';

class IncidentBloc extends Bloc<IncidentEvent, IncidentState> {
  final IncidentRepository _repository;

  IncidentBloc({required IncidentRepository repository})
      : _repository = repository,
        super(const IncidentState()) {
    on<SubmitIncident>(_onSubmit);
    on<ResetIncident>(_onReset);
  }

  Future<void> _onSubmit(
      SubmitIncident event, Emitter<IncidentState> emit) async {
    emit(state.copyWith(status: IncidentStatus.loading, clearError: true));
    try {
      await _repository.createIncident(event.incident);
      emit(state.copyWith(status: IncidentStatus.success));
    } catch (e) {
      emit(state.copyWith(
        status: IncidentStatus.error,
        errorMessage: e.toString(),
      ));
    }
  }

  void _onReset(ResetIncident event, Emitter<IncidentState> emit) {
    emit(const IncidentState());
  }
}
