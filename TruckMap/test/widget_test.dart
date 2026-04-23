import 'package:flutter_test/flutter_test.dart';

import 'package:truck_map/repositories/itinerary_data_source/mock_itinerary_data_source.dart';
import 'package:truck_map/repositories/itinerary_repository.dart';
import 'package:truck_map/main.dart';

void main() {
  testWidgets('App renders without errors', (WidgetTester tester) async {
    final repository = ItineraryRepository(
      dataSource: MockItineraryDataSource(),
    );
    await tester.pumpWidget(TruckMap(itineraryRepository: repository));
    expect(find.text('Itinerary Map'), findsOneWidget);
  });
}
