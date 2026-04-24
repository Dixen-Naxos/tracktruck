import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:truck_map/blocs/auth_bloc/auth_bloc.dart';
import 'package:truck_map/blocs/itinerary_bloc/itinerary_bloc.dart';
import 'package:truck_map/models/location_point.dart';
import 'package:truck_map/repositories/locations_repository.dart';
import 'package:truck_map/screens/map/map_screen.dart';
import 'package:truck_map/services/auth_http_client.dart';

class CreateDeliveryScreen extends StatefulWidget {
  const CreateDeliveryScreen({super.key});

  @override
  State<CreateDeliveryScreen> createState() => _CreateDeliveryScreenState();
}

class _CreateDeliveryScreenState extends State<CreateDeliveryScreen> {
  late final LocationsRepository _repo;

  late Future<({List<LocationPoint> warehouses, List<LocationPoint> stores})> _future;
  String? _warehouseId;
  final Set<String> _storeIds = {};

  @override
  void initState() {
    super.initState();
    _repo = LocationsRepository(client: context.read<AuthHttpClient>());
    _future = _load();
  }

  Future<({List<LocationPoint> warehouses, List<LocationPoint> stores})> _load() async {
    final results = await Future.wait([_repo.listWarehouses(), _repo.listStores()]);
    return (warehouses: results[0], stores: results[1]);
  }

  void _compute() {
    if (_warehouseId == null || _storeIds.isEmpty) return;
    context.read<ItineraryBloc>().add(ComputeItinerary(
          startPointId: _warehouseId!,
          toVisitIds: _storeIds.toList(),
        ));
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const MapScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit = _warehouseId != null && _storeIds.isNotEmpty;
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Calcul d\'itinéraire',
            style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Déconnexion',
            onPressed: () =>
                context.read<AuthBloc>().add(AuthSignOutRequested()),
          ),
        ],
      ),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Erreur: ${snapshot.error}'));
          }
          final data = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const _SectionTitle('Entrepôt de départ'),
              ...data.warehouses.map((w) => RadioListTile<String>(
                    value: w.id,
                    groupValue: _warehouseId,
                    onChanged: (v) => setState(() => _warehouseId = v),
                    title: Text(w.name),
                    subtitle: Text(w.address,
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    tileColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: Colors.grey.shade200),
                    ),
                  )),
              const SizedBox(height: 16),
              _SectionTitle('Magasins à visiter (${_storeIds.length})'),
              ...data.stores.map((s) => CheckboxListTile(
                    value: _storeIds.contains(s.id),
                    onChanged: (v) => setState(() {
                      if (v == true) {
                        _storeIds.add(s.id);
                      } else {
                        _storeIds.remove(s.id);
                      }
                    }),
                    title: Text(s.name),
                    subtitle: Text(s.address,
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    tileColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: Colors.grey.shade200),
                    ),
                  )),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: canSubmit ? _compute : null,
                icon: const Icon(Icons.route),
                label: const Text('Calculer l\'itinéraire'),
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 8, top: 4),
        child: Text(text,
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: Colors.black54)),
      );
}
