import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import 'package:truck_map/blocs/itinerary_bloc/itinerary_bloc.dart';
import 'package:truck_map/blocs/location_bloc/location_bloc.dart';
import 'package:truck_map/models/itinerary.dart';
import 'package:truck_map/widgets/user_location_marker.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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

          if (state.status == ItineraryStatus.error && state.itinerary == null) {
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

          final stopPositions =
              itinerary.orderedStops.map((s) => s.location).toList();
          final bounds = LatLngBounds.fromPoints(stopPositions);

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
                        MarkerLayer(
                          markers: itinerary.orderedStops
                              .asMap()
                              .entries
                              .map((e) => _stopMarker(e.key + 1, e.value))
                              .toList(),
                        ),
                        if (locationState.position != null)
                          UserLocationMarker(position: locationState.position!),
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
        builder: (context, state) {
          if (state.position == null) return const SizedBox.shrink();
          return FloatingActionButton(
            onPressed: () => _mapController.move(state.position!, 15),
            child: const Icon(Icons.my_location),
          );
        },
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
