import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

enum AppButtonVariant { primary, secondary, outline, danger, ghost }

/// Standard high-polish button for FarmShield with subtle tactile micro-interaction
class AppButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final IconData? icon;
  final Widget? leadingWidget;
  final bool isLoading;
  final bool isFullWidth;
  final double? height;
  final EdgeInsetsGeometry? padding;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.icon,
    this.leadingWidget,
    this.isLoading = false,
    this.isFullWidth = false,
    this.height = 50.0,
    this.padding,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.colorScheme.primary;

    Color bg;
    Color fg;
    BorderSide border;

    switch (widget.variant) {
      case AppButtonVariant.primary:
        bg = primaryColor;
        fg = Colors.white;
        border = BorderSide.none;
        break;
      case AppButtonVariant.secondary:
        bg = AppColors.primaryContainer;
        fg = AppColors.primaryDark;
        border = BorderSide.none;
        break;
      case AppButtonVariant.outline:
        bg = Colors.transparent;
        fg = AppColors.primaryDark;
        border = const BorderSide(color: AppColors.border, width: 1.4);
        break;
      case AppButtonVariant.danger:
        bg = AppColors.danger;
        fg = Colors.white;
        border = BorderSide.none;
        break;
      case AppButtonVariant.ghost:
        bg = Colors.transparent;
        fg = AppColors.textSecondary;
        border = BorderSide.none;
        break;
    }

    final isEnabled = widget.onPressed != null && !widget.isLoading;

    Widget child = widget.isLoading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(fg),
            ),
          )
        : Row(
            mainAxisSize: widget.isFullWidth ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.leadingWidget != null) ...[
                widget.leadingWidget!,
                const SizedBox(width: 10),
              ] else if (widget.icon != null) ...[
                Icon(widget.icon, size: 18, color: fg),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Text(
                  widget.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: fg,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
            ],
          );

    final buttonStyle = ElevatedButton.styleFrom(
      backgroundColor: bg,
      foregroundColor: fg,
      disabledBackgroundColor: bg.withValues(alpha: 0.5),
      disabledForegroundColor: fg.withValues(alpha: 0.5),
      elevation: widget.variant == AppButtonVariant.primary ? 0.5 : 0,
      shadowColor: primaryColor.withValues(alpha: 0.25),
      padding: widget.padding ?? const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      shape: RoundedRectangleBorder(
        borderRadius: AppSpacing.roundedMd,
        side: border,
      ),
    );

    Widget result = SizedBox(
      height: widget.height,
      width: widget.isFullWidth ? double.infinity : null,
      child: Listener(
        onPointerDown: isEnabled ? (_) => setState(() => _isPressed = true) : null,
        onPointerUp: isEnabled ? (_) => setState(() => _isPressed = false) : null,
        onPointerCancel: isEnabled ? (_) => setState(() => _isPressed = false) : null,
        child: AnimatedScale(
          scale: _isPressed ? 0.982 : 1.0,
          duration: const Duration(milliseconds: 100),
          curve: Curves.easeOutCubic,
          child: ElevatedButton(
            onPressed: isEnabled ? widget.onPressed : null,
            style: buttonStyle,
            child: child,
          ),
        ),
      ),
    );

    return result;
  }
}
