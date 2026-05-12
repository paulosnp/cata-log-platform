import 'package:flutter_test/flutter_test.dart';
import 'package:cata_log_mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CataLogApp());
    expect(find.text('Bem-vindo, artesão'), findsOneWidget);
  });
}
