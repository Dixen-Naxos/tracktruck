part of 'incident_bloc.dart';

sealed class IncidentEvent {}

final class SubmitIncident extends IncidentEvent {
  final Incident incident;
  SubmitIncident(this.incident);
}

final class ResetIncident extends IncidentEvent {}
