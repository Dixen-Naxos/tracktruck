import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:truck_map/blocs/auth_bloc/auth_bloc.dart';
import 'package:truck_map/blocs/delivery_bloc/delivery_bloc.dart';
import 'package:truck_map/models/delivery.dart';
import 'package:truck_map/screens/deliveries/deliveries_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 1;

  static const _tabs = <_TabConfig>[
    _TabConfig(
      filter: DeliveryStatus.done,
      title: 'Passées',
      icon: Icons.history,
    ),
    _TabConfig(
      filter: DeliveryStatus.started,
      title: 'En cours',
      icon: Icons.local_shipping,
    ),
    _TabConfig(
      filter: DeliveryStatus.planned,
      title: 'À venir',
      icon: Icons.schedule,
    ),
  ];

  @override
  void initState() {
    super.initState();
    context.read<DeliveryBloc>().add(LoadDeliveries());
  }

  @override
  Widget build(BuildContext context) {
    final tab = _tabs[_index];
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          tab.title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<DeliveryBloc>().add(LoadDeliveries()),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Déconnexion',
            onPressed: () =>
                context.read<AuthBloc>().add(AuthSignOutRequested()),
          ),
        ],
      ),
      body: DeliveriesScreen(filter: tab.filter, title: tab.title),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: _tabs
            .map((t) => NavigationDestination(
                  icon: Icon(t.icon),
                  label: t.title,
                ))
            .toList(),
      ),
    );
  }
}

class _TabConfig {
  final DeliveryStatus filter;
  final String title;
  final IconData icon;
  const _TabConfig({
    required this.filter,
    required this.title,
    required this.icon,
  });
}
