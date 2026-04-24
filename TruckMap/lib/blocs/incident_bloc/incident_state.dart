part of 'incident_bloc.dart';

enum IncidentStatus { initial, loading, success, error }

class IncidentState extends Equatable {
  final IncidentStatus status;
  final String? errorMessage;

  const IncidentState({
    this.status = IncidentStatus.initial,
    this.errorMessage,
  });

  IncidentState copyWith({
    IncidentStatus? status,
    String? errorMessage,
    bool clearError = false,
  }) {
    return IncidentState(
      status: status ?? this.status,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  List<Object?> get props => [status, errorMessage];
}
