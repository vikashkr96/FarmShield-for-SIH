import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:farmshield/app/core/services/cloudinary_service.dart';
import 'package:farmshield/app/data/models/farm_models.dart';
import 'package:farmshield/app/data/repositories/farm_repository.dart';

void main() {
  group('QR Code Resolution & Parsing Tests', () {
    test('Correctly extracts token from localhost verification URL', () {
      const url = 'http://localhost:3000/qr/QR-COW-101';
      final token = FarmRepository.parseQrCode(url);
      expect(token, 'QR-COW-101');
    });

    test('Correctly extracts token from production HTTPS verification URL', () {
      const url = 'https://farmshield.in/qr/QR-BUF-201';
      final token = FarmRepository.parseQrCode(url);
      expect(token, 'QR-BUF-201');
    });

    test('Correctly extracts token from URL with query parameters', () {
      const url = 'https://farmshield.in/verify?token=QR-GT-301';
      final token = FarmRepository.parseQrCode(url);
      expect(token, 'QR-GT-301');
    });

    test('Correctly handles direct QR token string', () {
      const raw = 'QR-COW-101';
      final token = FarmRepository.parseQrCode(raw);
      expect(token, 'QR-COW-101');
    });

    test('Correctly handles raw tag code with whitespace or quotes', () {
      const raw = '  "COW-102"  ';
      final token = FarmRepository.parseQrCode(raw);
      expect(token, 'COW-102');
    });

    test('Correctly handles UUID format', () {
      const raw = 'a0000000-0000-0000-0000-000000000101';
      final token = FarmRepository.parseQrCode(raw);
      expect(token, 'a0000000-0000-0000-0000-000000000101');
    });
  });

  group('Animal Model Serialization & Persistence Tests', () {
    test('Animal model correctly serializes and deserializes with Cloudinary fields', () {
      final json = {
        'id': 'a0000000-0000-0000-0000-000000000101',
        'farm_id': 'farm-01',
        'animal_code': 'COW-101',
        'species': 'cow',
        'breed': 'Gir Purebred',
        'dob': '2022-03-15',
        'sex': 'female',
        'weight': 390.5,
        'purpose': 'milk',
        'health_status': 'healthy',
        'qr_token': 'QR-COW-101',
        'image_url': 'https://res.cloudinary.com/dwfowhzwn/image/upload/v1234/cow.jpg',
        'cloudinary_public_id': 'animals/cow_101_abc',
      };

      final animal = Animal.fromJson(json);

      expect(animal.id, 'a0000000-0000-0000-0000-000000000101');
      expect(animal.animalCode, 'COW-101');
      expect(animal.weightKg, 390.5);
      expect(animal.imageUrl, 'https://res.cloudinary.com/dwfowhzwn/image/upload/v1234/cow.jpg');
      expect(animal.cloudinaryPublicId, 'animals/cow_101_abc');

      final serialized = animal.toJson();
      expect(serialized['image_url'], 'https://res.cloudinary.com/dwfowhzwn/image/upload/v1234/cow.jpg');
      expect(serialized['cloudinary_public_id'], 'animals/cow_101_abc');
      expect(serialized['weight'], 390.5);
    });

    test('Animal copyWith properly updates fields immutably', () {
      final animal = Animal(
        id: '1',
        animalCode: 'COW-1',
        weightKg: 300,
        healthStatus: 'healthy',
      );

      final updated = animal.copyWith(
        weightKg: 350.5,
        healthStatus: 'sick',
        imageUrl: 'https://new-url.com/img.jpg',
      );

      expect(updated.weightKg, 350.5);
      expect(updated.healthStatus, 'sick');
      expect(updated.imageUrl, 'https://new-url.com/img.jpg');
      expect(updated.animalCode, 'COW-1');
    });
  });

  group('Cloudinary Service Validation & Public ID Extraction Tests', () {
    final cloudinary = CloudinaryService();

    test('Validates file format correctly', () {
      final dummyBytes = Uint8List(100);

      expect(cloudinary.validateImage(bytes: dummyBytes, fileName: 'cow.jpg'), isNull);
      expect(cloudinary.validateImage(bytes: dummyBytes, fileName: 'buffalo.png'), isNull);
      expect(cloudinary.validateImage(bytes: dummyBytes, fileName: 'goat.webp'), isNull);

      final invalidErr = cloudinary.validateImage(bytes: dummyBytes, fileName: 'doc.pdf');
      expect(invalidErr, contains('Unsupported file format'));
    });

    test('Validates file size limit correctly', () {
      final emptyBytes = Uint8List(0);
      expect(cloudinary.validateImage(bytes: emptyBytes, fileName: 'cow.jpg'), contains('empty'));

      final oversizedBytes = Uint8List(11 * 1024 * 1024); // 11MB
      expect(cloudinary.validateImage(bytes: oversizedBytes, fileName: 'cow.jpg'), contains('exceeds'));
    });

    test('Extracts public ID reliably from standard Cloudinary URLs', () {
      const url1 = 'https://res.cloudinary.com/dwfowhzwn/image/upload/v1789055338/die3tskqg5g8vyyoqqjz.png';
      final id1 = cloudinary.extractPublicIdFromUrl(url1);
      expect(id1, 'die3tskqg5g8vyyoqqjz');

      const url2 = 'https://res.cloudinary.com/dwfowhzwn/image/upload/v1789055338/animals/cow_tag_101.jpg';
      final id2 = cloudinary.extractPublicIdFromUrl(url2);
      expect(id2, 'animals/cow_tag_101');
    });

    test('Returns null for non-Cloudinary URLs', () {
      const url = 'https://example.com/images/cow.jpg';
      expect(cloudinary.extractPublicIdFromUrl(url), isNull);
    });
  });
}
