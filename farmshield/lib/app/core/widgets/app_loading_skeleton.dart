import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// Shimmer loading skeleton to replace raw spinners
class AppLoadingSkeleton extends StatefulWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;

  const AppLoadingSkeleton({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius,
  });

  factory AppLoadingSkeleton.card({double height = 120}) {
    return AppLoadingSkeleton(
      width: double.infinity,
      height: height,
      borderRadius: AppSpacing.roundedLg,
    );
  }

  factory AppLoadingSkeleton.line({double width = double.infinity, double height = 14}) {
    return AppLoadingSkeleton(
      width: width,
      height: height,
      borderRadius: AppSpacing.roundedSm,
    );
  }

  factory AppLoadingSkeleton.avatar({double size = 48}) {
    return AppLoadingSkeleton(
      width: size,
      height: size,
      borderRadius: BorderRadius.circular(size / 2),
    );
  }

  @override
  State<AppLoadingSkeleton> createState() => _AppLoadingSkeletonState();
}

class _AppLoadingSkeletonState extends State<AppLoadingSkeleton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _animation = Tween<double>(begin: 0.35, end: 0.85).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: AppColors.slate200.withValues(alpha: _animation.value),
            borderRadius: widget.borderRadius ?? AppSpacing.roundedMd,
          ),
        );
      },
    );
  }
}
