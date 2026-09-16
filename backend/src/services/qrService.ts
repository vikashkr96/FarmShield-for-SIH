import QRCode from 'qrcode';
import { db, Animal } from './dbService';

export interface AnimalQRCodeData {
  animal_id: string;
  animal_code: string;
  qr_token: string;
  verification_url: string;
  qr_data_url: string;
  species: string;
  breed: string;
  purpose: string;
  farm_id: string;
}

const BASE_APP_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generates permanent verification URL for an animal
 */
export const getAnimalVerificationUrl = (qrToken: string): string => {
  return `${BASE_APP_URL}/qr/${encodeURIComponent(qrToken)}`;
};

/**
 * Generates a Base64 PNG Data URL for an animal's permanent QR code
 */
export const generateAnimalQRDataUrl = async (animal: Animal): Promise<string> => {
  const url = getAnimalVerificationUrl(animal.qr_token || `QR-${animal.animal_code}`);
  
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: 320,
    color: {
      dark: '#1B5E20', // Forest Green theme for Agricultural Food Safety
      light: '#FFFFFF',
    },
  });

  return qrDataUrl;
};

/**
 * Generates binary PNG Buffer for direct download / ear-tag printing
 */
export const generateAnimalQRPngBuffer = async (animal: Animal): Promise<Buffer> => {
  const url = getAnimalVerificationUrl(animal.qr_token || `QR-${animal.animal_code}`);
  
  return await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    width: 512,
    color: {
      dark: '#1B5E20',
      light: '#FFFFFF',
    },
  });
};

/**
 * Retrieves complete QR Passport payload for an animal
 */
export const getAnimalQRDetails = async (animalId: string): Promise<AnimalQRCodeData | null> => {
  const animal = db.animals.find(
    (a) => a.id === animalId || a.animal_code.toLowerCase() === animalId.toLowerCase()
  );

  if (!animal) return null;

  const qrDataUrl = await generateAnimalQRDataUrl(animal);
  const verification_url = getAnimalVerificationUrl(animal.qr_token);

  return {
    animal_id: animal.id,
    animal_code: animal.animal_code,
    qr_token: animal.qr_token,
    verification_url,
    qr_data_url: qrDataUrl,
    species: animal.species,
    breed: animal.breed,
    purpose: animal.purpose,
    farm_id: animal.farm_id,
  };
};
