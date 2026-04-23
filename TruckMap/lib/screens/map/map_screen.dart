import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';

import 'package:truck_map/blocs/itinerary_bloc/itinerary_bloc.dart';
import 'package:truck_map/blocs/location_bloc/location_bloc.dart';
import 'package:truck_map/widgets/itinerary_polyline.dart';
import 'package:truck_map/widgets/user_location_marker.dart';
import 'package:truck_map/widgets/utility_point.dart';
import 'package:truck_map/widgets/waypoint_markers.dart';

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
        title: BlocBuilder<ItineraryBloc, ItineraryState>(
          buildWhen: (prev, curr) =>
              prev.itinerary?.name != curr.itinerary?.name,
          builder: (context, state) {
            return Text(state.itinerary?.name ?? 'Itinerary Map');
          },
        ),
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
                    'Updated ${time.format(context)}',
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
                  const Icon(Icons.error, size: 64),
                  const SizedBox(height: 16),
                  Text(state.errorMessage ?? 'Failed to load itinerary'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () =>
                        context.read<ItineraryBloc>().add(StartPolling()),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final itinerary = state.itinerary;
          if (itinerary == null || itinerary.waypoints.isEmpty) {
            return const Center(child: Text('No itinerary data'));
          }

          // Compute bounds from all route points
          final bounds = LatLngBounds.fromPoints(itinerary.routePoints);

          return BlocBuilder<LocationBloc, LocationState>(
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
                  ItineraryPolyline(routePoints: itinerary.routePoints),
                  WaypointMarkers(waypoints: itinerary.waypoints),
                  UtilityPointMarkers(points: itinerary.utilityPoints),
                  if (locationState.position != null)
                    UserLocationMarker(position: locationState.position!),
                ],
              );
            },
          );
        },
      ),
      floatingActionButton: BlocBuilder<LocationBloc, LocationState>(
        buildWhen: (prev, curr) => prev.position != curr.position,
        builder: (context, state) {
          if (state.position == null) return const SizedBox.shrink();
          return FloatingActionButton(
            onPressed: () {
              _mapController.move(state.position!, 15);
            },
            child: const Icon(Icons.my_location),
          );
        },
      ),
    );
  }
}
