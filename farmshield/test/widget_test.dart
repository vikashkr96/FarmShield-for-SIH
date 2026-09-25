import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/core/theme/app_colors.dart';
import 'package:farmshield/app/core/theme/app_spacing.dart';

void main() {
  test('Design system tokens are properly configured', () {
    expect(AppColors.primary, isNotNull);
    expect(AppColors.primaryDark, isNotNull);
    expect(AppColors.accent, isNotNull);
    expect(AppSpacing.md, 12.0);
    expect(AppSpacing.lg, 16.0);
  });
}
