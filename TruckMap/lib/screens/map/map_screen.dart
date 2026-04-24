import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import 'package:truck_map/blocs/incident_bloc/incident_bloc.dart';
import 'package:truck_map/blocs/itinerary_bloc/itinerary_bloc.dart';
import 'package:truck_map/blocs/location_bloc/location_bloc.dart';
import 'package:truck_map/widgets/itinerary_polyline.dart';
import 'package:truck_map/widgets/road_sign.dart';
import 'package:truck_map/widgets/user_location_marker.dart';
import 'package:truck_map/widgets/utility_point.dart';
import 'package:truck_map/widgets/waypoint_markers.dart';
import 'package:truck_map/models/incident.dart';
import 'package:truck_map/models/itinerary.dart';

class MapScreen extends StatefulWidget {
  final String deliveryId;

  const MapScreen({super.key, required this.deliveryId});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();

  void _showIncidentSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => MultiBlocProvider(
        providers: [
          BlocProvider.value(value: context.read<IncidentBloc>()),
          BlocProvider.value(value: context.read<LocationBloc>()),
        ],
        child: _IncidentSheet(deliveryId: widget.deliveryId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<IncidentBloc, IncidentState>(
      listenWhen: (prev, curr) => curr.status == IncidentStatus.success,
      listener: (context, state) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Incident signalé avec succès')),
        );
        context.read<IncidentBloc>().add(ResetIncident());
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Itinéraire'),
          actions: [
            BlocBuilder<ItineraryBloc, ItineraryState>(
              buildWhen: (prev, curr) => prev.lastUpdated != curr.lastUpdated,
              builder: (context, state) {
                if (state.lastUpdated == null) return const SizedBox.shrink();
                final time = TimeOfDay.fromDateTime(state.lastUpdated!);
                return Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: Center(
                    child: Text(
                      'Mis à jour ${time.format(context)}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
        body: BlocBuilder<ItineraryBloc, ItineraryState>(
          builder: (context, state) {
            if (state.status == ItineraryStatus.loading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state.status == ItineraryStatus.error &&
                state.itinerary == null) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, size: 64),
                    const SizedBox(height: 16),
                    Text(state.errorMessage ??
                        "Impossible de calculer l'itinéraire"),
                  ],
                ),
              );
            }

            final itinerary = state.itinerary;
            if (itinerary == null || itinerary.orderedStops.isEmpty) {
              return const Center(child: Text('Aucun itinéraire'));
            }

            final allPoints = [
              ...itinerary.orderedStops.map((s) => s.location),
              ...itinerary.routePoints,
            ];
            final bounds = LatLngBounds.fromPoints(
              allPoints.isNotEmpty ? allPoints : itinerary.orderedStops.map((s) => s.location).toList(),
            );

            return Column(
              children: [
                _ItinerarySummary(itinerary: itinerary),
                Expanded(
                  child: BlocBuilder<LocationBloc, LocationState>(
                    builder: (context, locationState) {
                      return FlutterMap(
                        mapController: _mapController,
                        options: MapOptions(
                          initialCameraFit: CameraFit.bounds(
                            bounds: bounds,
                            padding: const EdgeInsets.all(48),
                          ),
                        ),
                        children: [
                          TileLayer(
                            urlTemplate:
                                'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                            subdomains: const ['a', 'b', 'c', 'd'],
                            userAgentPackageName: 'com.example.truck_map',
                          ),
                          if (itinerary.routePoints.isNotEmpty)
                            ItineraryPolyline(
                                routePoints: itinerary.routePoints),
                          WaypointMarkers(waypoints: itinerary.waypoints),
                          UtilityPointMarkers(
                              points: itinerary.utilityPoints),
                          RoadSignMarkers(signs: itinerary.blockingSigns),
                          MarkerLayer(
                            markers: [
                              if (itinerary.startPoint != null)
                                _warehouseMarker(itinerary.startPoint!),
                              ...itinerary.orderedStops
                                  .asMap()
                                  .entries
                                  .map((e) => _stopMarker(e.key + 1, e.value)),
                            ],
                          ),
                          if (locationState.position != null)
                            UserLocationMarker(
                                position: locationState.position!),
                        ],
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
        floatingActionButton: BlocBuilder<LocationBloc, LocationState>(
          buildWhen: (prev, curr) => prev.position != curr.position,
          builder: (context, locationState) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FloatingActionButton(
                  heroTag: 'incident_fab',
                  backgroundColor: Colors.red.shade700,
                  onPressed: () => _showIncidentSheet(context),
                  child: const Icon(
                    Icons.warning_amber_rounded,
                    color: Colors.white,
                  ),
                ),
                if (locationState.position != null) ...[
                  const SizedBox(height: 12),
                  FloatingActionButton(
                    heroTag: 'location_fab',
                    onPressed: () =>
                        _mapController.move(locationState.position!, 15),
                    child: const Icon(Icons.my_location),
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }

  Marker _warehouseMarker(ItineraryStop stop) {
    return Marker(
      point: stop.location,
      width: 44,
      height: 44,
      child: Tooltip(
        message: '${stop.name}\n${stop.address}',
        child: Container(
          decoration: BoxDecoration(
            color: Colors.orange.shade700,
            shape: BoxShape.circle,
            boxShadow: const [
              BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
            ],
          ),
          child: const Icon(Icons.warehouse, color: Colors.white, size: 24),
        ),
      ),
    );
  }

  Marker _stopMarker(int index, ItineraryStop stop) {
    return Marker(
      point: stop.location,
      width: 40,
      height: 40,
      child: Tooltip(
        message: '${stop.name}\n${stop.address}',
        child: CircleAvatar(
          backgroundColor: Colors.blue,
          child: Text(
            '$index',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

class _IncidentSheet extends StatefulWidget {
  final String deliveryId;
  const _IncidentSheet({required this.deliveryId});

  @override
  State<_IncidentSheet> createState() => _IncidentSheetState();
}

class _IncidentSheetState extends State<_IncidentSheet> {
  IncidentType _selectedType = IncidentType.breakdown;
  final _descriptionController = TextEditingController();

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  void _submit() {
    final position = context.read<LocationBloc>().state.position;
    context.read<IncidentBloc>().add(SubmitIncident(Incident(
          deliveryId: widget.deliveryId,
          type: _selectedType,
          description: _descriptionController.text.trim().isEmpty
              ? null
              : _descriptionController.text.trim(),
          latitude: position?.latitude,
          longitude: position?.longitude,
        )));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<IncidentBloc, IncidentState>(
      listenWhen: (prev, curr) => curr.status == IncidentStatus.success,
      listener: (context, _) => Navigator.of(context).pop(),
      child: Padding(
        padding: EdgeInsets.fromLTRB(
            16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Signaler un incident',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: IncidentType.values.map((type) {
                return FilterChip(
                  label: Text(type.label),
                  selected: _selectedType == type,
                  onSelected: (_) => setState(() => _selectedType = type),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Description (facultative)',
                hintText: "Décrivez l'incident...",
              ),
            ),
            const SizedBox(height: 16),
            BlocBuilder<IncidentBloc, IncidentState>(
              builder: (context, state) {
                if (state.status == IncidentStatus.error) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      state.errorMessage ?? 'Une erreur est survenue',
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.error),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
            BlocBuilder<IncidentBloc, IncidentState>(
              builder: (context, state) {
                final isLoading = state.status == IncidentStatus.loading;
                return SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(
                        backgroundColor: Colors.red.shade700),
                    onPressed: isLoading ? null : _submit,
                    icon: isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.warning_amber_rounded),
                    label: Text(isLoading ? 'Envoi...' : 'Signaler'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _ItinerarySummary extends StatelessWidget {
  final Itinerary itinerary;

  const _ItinerarySummary({required this.itinerary});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _stat(Icons.route,
              '${itinerary.totalDistanceKilometers.toStringAsFixed(1)} km'),
          _stat(Icons.timer, itinerary.formattedDuration),
          _stat(Icons.store, '${itinerary.orderedStops.length} arrêts'),
        ],
      ),
    );
  }

  Widget _stat(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 18),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }
}
