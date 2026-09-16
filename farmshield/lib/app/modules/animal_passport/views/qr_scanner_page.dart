import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../routes/app_pages.dart';

class QRScannerPage extends StatefulWidget {
  const QRScannerPage({super.key});

  @override
  State<QRScannerPage> createState() => _QRScannerPageState();
}

class _QRScannerPageState extends State<QRScannerPage> with SingleTickerProviderStateMixin {
  late final MobileScannerController _cameraController;
  final FarmRepository _repository = Get.find<FarmRepository>();

  bool _isProcessing = false;
  bool _isResolving = false;
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _cameraController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
    );

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    _cameraController.dispose();
    super.dispose();
  }

  Future<void> _handleScannedCode(String rawCode) async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
      _isResolving = true;
    });

    HapticFeedback.mediumImpact();
    await _cameraController.stop();

    try {
      final animal = await _repository.resolveAnimalByQr(rawCode);

      if (!mounted) return;

      if (animal != null) {
        // Successfully resolved animal -> Navigate to Animal Profile
        Get.offNamed(
          Routes.ANIMAL_DETAIL,
          arguments: animal,
        );
      } else {
        setState(() => _isResolving = false);
        _showAnimalNotFoundDialog(rawCode);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isResolving = false);
      _showAnimalNotFoundDialog(rawCode, errorDetails: e.toString());
    }
  }

  void _showAnimalNotFoundDialog(String code, {String? errorDetails}) {
    final parsed = FarmRepository.parseQrCode(code);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedLg),
        backgroundColor: Colors.white,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.qr_code_2_rounded, color: AppColors.danger, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Animal Not Found',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "This QR code isn't linked to an active animal in your farm registry.",
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.slate50,
                borderRadius: AppSpacing.roundedSm,
                border: Border.all(color: AppColors.border),
              ),
              child: SelectableText(
                'Identifier: $parsed',
                style: AppTypography.codeTagSmall.copyWith(fontSize: 12),
              ),
            ),
          ],
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Go Home',
                  variant: AppButtonVariant.outline,
                  height: 44,
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    Get.back();
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppButton(
                  label: 'Scan Again',
                  variant: AppButtonVariant.primary,
                  height: 44,
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    setState(() {
                      _isProcessing = false;
                      _isResolving = false;
                    });
                    _cameraController.start();
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showManualEntryDialog() {
    final textController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedLg),
        backgroundColor: Colors.white,
        title: Text(
          'Enter Ear-Tag / QR Code',
          style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter the ear-tag code, animal identifier, or QR token (e.g. COW-101, QR-COW-101).',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: textController,
              autofocus: true,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                hintText: 'e.g. COW-101',
                prefixIcon: const Icon(Icons.tag_rounded, color: AppColors.primary, size: 20),
                filled: true,
                fillColor: AppColors.slate50,
                border: OutlineInputBorder(
                  borderRadius: AppSpacing.roundedMd,
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
            ),
          ],
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Cancel',
                  variant: AppButtonVariant.outline,
                  height: 44,
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppButton(
                  label: 'Lookup',
                  variant: AppButtonVariant.primary,
                  height: 44,
                  onPressed: () {
                    final val = textController.text.trim();
                    if (val.isNotEmpty) {
                      Navigator.of(ctx).pop();
                      _handleScannedCode(val);
                    }
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _pickImageQrFallback() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      // Analyze barcodes from image file
      final barcodes = await _cameraController.analyzeImage(picked.path);
      if (barcodes != null && barcodes.barcodes.isNotEmpty) {
        final code = barcodes.barcodes.first.rawValue;
        if (code != null && code.isNotEmpty) {
          _handleScannedCode(code);
          return;
        }
      }
      Get.snackbar(
        'QR Detection',
        'No valid QR code was detected in the chosen image.',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Camera Feed
          MobileScanner(
            controller: _cameraController,
            onDetect: (capture) {
              if (_isProcessing) return;
              for (final barcode in capture.barcodes) {
                final raw = barcode.rawValue;
                if (raw != null && raw.trim().isNotEmpty) {
                  _handleScannedCode(raw);
                  break;
                }
              }
            },
          ),

          // 2. Custom Dark Overlay with Target Reticle
          _buildScanningOverlay(context),

          // 3. Top Navigation & Action Bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.black.withValues(alpha: 0.55),
                    radius: 20,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                      onPressed: () => Get.back(),
                    ),
                  ),
                  Row(
                    children: [
                      ValueListenableBuilder<MobileScannerState>(
                        valueListenable: _cameraController,
                        builder: (context, state, child) {
                          final isTorchOn = state.torchState == TorchState.on;
                          return CircleAvatar(
                            backgroundColor: Colors.black.withValues(alpha: 0.55),
                            radius: 20,
                            child: IconButton(
                              icon: Icon(
                                isTorchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                                color: isTorchOn ? AppColors.accent : Colors.white,
                                size: 20,
                              ),
                              onPressed: () => _cameraController.toggleTorch(),
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 8),
                      CircleAvatar(
                        backgroundColor: Colors.black.withValues(alpha: 0.55),
                        radius: 20,
                        child: IconButton(
                          icon: const Icon(Icons.flip_camera_ios_rounded, color: Colors.white, size: 20),
                          onPressed: () => _cameraController.switchCamera(),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 4. Bottom Controls & Helper Text
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              top: false,
              child: Container(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.85),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Align Animal Ear-Tag QR within frame',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Instant lookup for Food Safety Passport & Medical Records',
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton.icon(
                          onPressed: _showManualEntryDialog,
                          icon: const Icon(Icons.keyboard_outlined, color: Colors.white, size: 18),
                          label: Text(
                            'Enter Code',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.white.withValues(alpha: 0.2),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedFull),
                          ),
                        ),
                        const SizedBox(width: 12),
                        TextButton.icon(
                          onPressed: _pickImageQrFallback,
                          icon: const Icon(Icons.image_search_rounded, color: Colors.white, size: 18),
                          label: Text(
                            'Upload QR',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.white.withValues(alpha: 0.2),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedFull),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 5. Resolving Animal Progress State
          if (_isResolving)
            Container(
              color: Colors.black.withValues(alpha: 0.75),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppSpacing.roundedLg,
                    boxShadow: AppSpacing.shadowElevated,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(
                        width: 44,
                        height: 44,
                        child: CircularProgressIndicator(
                          color: AppColors.primary,
                          strokeWidth: 3.5,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Resolving Animal...',
                        style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Checking Supabase animal passport',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildScanningOverlay(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final scanBoxSize = (size.width * 0.72).clamp(240.0, 320.0);

    return Stack(
      children: [
        // Darkened cutout
        ColorFiltered(
          colorFilter: ColorFilter.mode(
            Colors.black.withValues(alpha: 0.65),
            BlendMode.srcOut,
          ),
          child: Stack(
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.red,
                  backgroundBlendMode: BlendMode.dstOut,
                ),
              ),
              Align(
                alignment: const Alignment(0, -0.15),
                child: Container(
                  height: scanBoxSize,
                  width: scanBoxSize,
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: AppSpacing.roundedLg,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Corner Target Brackets
        Align(
          alignment: const Alignment(0, -0.15),
          child: SizedBox(
            width: scanBoxSize,
            height: scanBoxSize,
            child: Stack(
              children: [
                _buildCorner(top: 0, left: 0, isTop: true, isLeft: true),
                _buildCorner(top: 0, right: 0, isTop: true, isLeft: false),
                _buildCorner(bottom: 0, left: 0, isTop: false, isLeft: true),
                _buildCorner(bottom: 0, right: 0, isTop: false, isLeft: false),

                // Animated Scan Line
                AnimatedBuilder(
                  animation: _animController,
                  builder: (context, child) {
                    return Positioned(
                      top: _animController.value * (scanBoxSize - 20) + 10,
                      left: 12,
                      right: 12,
                      child: Container(
                        height: 2.5,
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.accent.withValues(alpha: 0.8),
                              blurRadius: 10,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCorner({
    double? top,
    double? bottom,
    double? left,
    double? right,
    required bool isTop,
    required bool isLeft,
  }) {
    const double length = 28.0;
    const double thickness = 4.0;
    const color = AppColors.accent;

    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: SizedBox(
        width: length,
        height: length,
        child: CustomPaint(
          painter: _CornerPainter(
            color: color,
            thickness: thickness,
            isTop: isTop,
            isLeft: isLeft,
          ),
        ),
      ),
    );
  }
}

class _CornerPainter extends CustomPainter {
  final Color color;
  final double thickness;
  final bool isTop;
  final bool isLeft;

  _CornerPainter({
    required this.color,
    required this.thickness,
    required this.isTop,
    required this.isLeft,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = thickness
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    if (isTop && isLeft) {
      path.moveTo(0, size.height);
      path.lineTo(0, 0);
      path.lineTo(size.width, 0);
    } else if (isTop && !isLeft) {
      path.moveTo(size.width, size.height);
      path.lineTo(size.width, 0);
      path.lineTo(0, 0);
    } else if (!isTop && isLeft) {
      path.moveTo(0, 0);
      path.lineTo(0, size.height);
      path.lineTo(size.width, size.height);
    } else {
      path.moveTo(size.width, 0);
      path.lineTo(size.width, size.height);
      path.lineTo(0, size.height);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
