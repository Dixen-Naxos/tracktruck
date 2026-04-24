import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import 'package:truck_map/blocs/delivery_bloc/delivery_bloc.dart';
import 'package:truck_map/blocs/itinerary_bloc/itinerary_bloc.dart';
import 'package:truck_map/models/delivery.dart';
import 'package:truck_map/screens/map/map_screen.dart';

class DeliveriesScreen extends StatelessWidget {
  final DeliveryStatus filter;
  final String title;

  const DeliveriesScreen({
    super.key,
    required this.filter,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DeliveryBloc, DeliveryState>(
      builder: (context, state) {
        if (state.status == DeliveryLoadStatus.loading &&
            state.deliveries.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (state.status == DeliveryLoadStatus.error &&
            state.deliveries.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 56, color: Colors.red),
                const SizedBox(height: 12),
                Text(state.errorMessage ?? 'Erreur de chargement'),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () =>
                      context.read<DeliveryBloc>().add(LoadDeliveries()),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Réessayer'),
                ),
              ],
            ),
          );
        }

        final filtered =
            state.deliveries.where((d) => d.status == filter).toList();

        if (filtered.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.local_shipping_outlined,
                    size: 64, color: Colors.grey),
                SizedBox(height: 12),
                Text('Aucune livraison',
                    style: TextStyle(color: Colors.grey, fontSize: 16)),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async =>
              context.read<DeliveryBloc>().add(LoadDeliveries()),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: filtered.map((d) => _DeliveryCard(delivery: d)).toList(),
          ),
        );
      },
    );
  }
}

class _DeliveryCard extends StatelessWidget {
  final Delivery delivery;
  const _DeliveryCard({required this.delivery});

  @override
  Widget build(BuildContext context) {
    final (statusColor, statusIcon) = switch (delivery.status) {
      DeliveryStatus.started => (const Color(0xFFFF6B35), Icons.local_shipping),
      DeliveryStatus.planned => (const Color(0xFF3B82F6), Icons.schedule),
      DeliveryStatus.done    => (const Color(0xFF22C55E), Icons.check_circle),
    };

    final dateLabel = switch (delivery.status) {
      DeliveryStatus.done    => 'Terminée le',
      DeliveryStatus.started => 'Démarrée le',
      DeliveryStatus.planned => 'Prévue le',
    };

    final date = delivery.actualStartAt ?? delivery.plannedStartAt;
    final formattedDate = DateFormat('dd MMM · HH:mm', 'fr_FR').format(date);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      color: Colors.white,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _openMap(context),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 14, color: statusColor),
                        const SizedBox(width: 4),
                        Text(
                          delivery.status.label,
                          style: TextStyle(
                            color: statusColor,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.chevron_right, color: Colors.grey.shade400),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _StatChip(
                    icon: Icons.store,
                    label:
                        '${delivery.storeIds.length} arrêt${delivery.storeIds.length > 1 ? 's' : ''}',
                  ),
                  _StatChip(
                    icon: Icons.route,
                    label: '${delivery.totalDistanceKm.toStringAsFixed(1)} km',
                  ),
                  _StatChip(
                    icon: Icons.timer_outlined,
                    label: delivery.formattedDuration,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(Icons.calendar_today_outlined,
                      size: 13, color: Colors.grey.shade500),
                  const SizedBox(width: 4),
                  Text(
                    '$dateLabel $formattedDate',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openMap(BuildContext context) {
    debugPrint('[_openMap] deliveryId=${delivery.id}');
    context.read<ItineraryBloc>().add(ComputeItinerary(
          deliveryId: delivery.id,
        ));
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => MapScreen(deliveryId: delivery.id)),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _StatChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F7FA),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: Colors.black54),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(fontSize: 12, color: Colors.black54)),
        ],
      ),
    );
  }
}
