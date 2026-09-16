import { en, TranslationKeys } from './en';
import { hi } from './hi';
import { pa } from './pa';
import { mr } from './mr';
import { gu } from './gu';
import { bn } from './bn';
import { ta } from './ta';
import { te } from './te';
import { kn } from './kn';
import { ml } from './ml';
import { or } from './or';
import { as } from './as';

export type SupportedLanguage =
  | 'en' // English
  | 'hi' // Hindi
  | 'pa' // Punjabi
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'bn' // Bengali
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'or' // Odia
  | 'as'; // Assamese

export const languagesList: { code: SupportedLanguage; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
];

export const translations: Record<SupportedLanguage, TranslationKeys> = {
  en,
  hi,
  pa,
  mr,
  gu,
  bn,
  ta,
  te,
  kn,
  ml,
  or,
  as,
};

/**
 * Gets a nested value from object by dot notation string path
 */
export function getTranslationValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Fallback to path if key not found
    }
  }

  return typeof current === 'string' ? current : path;
}
