import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/modules/auth/controllers/auth_controller.dart';

void main() {
  group('Auth Controller & Session Management Tests', () {
    test('Role normalization maps veterinary variants to veterinarian', () {
      expect(AuthController.normalizeRole('vet'), 'veterinarian');
      expect(AuthController.normalizeRole('veterinarian'), 'veterinarian');
      expect(AuthController.normalizeRole('doctor'), 'veterinarian');
      expect(AuthController.normalizeRole('VET'), 'veterinarian');
    });

    test('Role normalization maps authority/admin variants to admin', () {
      expect(AuthController.normalizeRole('admin'), 'admin');
      expect(AuthController.normalizeRole('authority'), 'admin');
      expect(AuthController.normalizeRole('ADMIN'), 'admin');
    });

    test('Role normalization defaults to farmer for other inputs', () {
      expect(AuthController.normalizeRole('farmer'), 'farmer');
      expect(AuthController.normalizeRole('user'), 'farmer');
      expect(AuthController.normalizeRole(''), 'farmer');
    });

    test('Callback URL scheme is valid and formatted for deep link intent filter', () {
      const scheme = AuthController.callbackUrlScheme;
      expect(scheme, 'io.supabase.farmshield://login-callback');
      final uri = Uri.parse(scheme);
      expect(uri.scheme, 'io.supabase.farmshield');
      expect(uri.host, 'login-callback');
    });
  });
}
