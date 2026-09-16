'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { AnimalItem } from './AnimalList';
import { Button } from '../ui/Button';
import { ArrowLeft, CheckCircle2, ShieldAlert, Pill } from 'lucide-react';

interface TreatmentModalProps {
  animals: AnimalItem[];
  preSelectedAnimalId?: string;
  onClose?: () => void;
  onBack?: () => void;
  onSuccess?: () => void;
  onTreatmentSuccess?: () => void;
}

export const TreatmentModal: React.FC<TreatmentModalProps> = ({
  animals,
  preSelectedAnimalId,
  onClose,
  onBack,
  onSuccess,
  onTreatmentSuccess,
}) => {
  const { t, language } = useLanguage();
  const handleClose = onClose || onBack || (() => {});
  const handleSuccess = onTreatmentSuccess || onSuccess;

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(preSelectedAnimalId || animals[0]?.id || 'a102');
  const [medicineId, setMedicineId] = useState<string>('m1'); // Default Amoxicillin
  const [dose, setDose] = useState<string>('10');
  const [doseUnit, setDoseUnit] = useState<string>('mg/kg');
  const [route, setRoute] = useState<string>('Injection');
  const [duration, setDuration] = useState<string>('3');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [indication, setIndication] = useState<string>(language === 'en' ? 'Mastitis' : 'थन में सूजन');
  const [productAffected, setProductAffected] = useState<string>('milk');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{
    success: boolean;
    safeDate?: string;
    withdrawalDays?: number;
    msg?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal_id: selectedAnimalId,
          medicine_id: medicineId,
          dose: Number(dose),
          dose_unit: doseUnit,
          route,
          duration: Number(duration),
          start_date: startDate,
          indication,
          product: productAffected,
        }),
      });

      const json = await response.json();

      if (json.status === 'success') {
        setResultMessage({
          success: true,
          safeDate: new Date(json.data.withdrawal.end_date).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          withdrawalDays: json.data.withdrawal.withdrawal_days,
          msg: json.data.withdrawal.withdrawal_days > 0
            ? (language === 'en'
                ? `Mandatory ${json.data.withdrawal.withdrawal_days} days withdrawal countdown initiated for ${productAffected}.`
                : `${productAffected === 'milk' ? 'दूध' : 'उत्पाद'} रोकने की ${json.data.withdrawal.withdrawal_days} दिन की अवधि लागू की गई है।`)
            : (language === 'en' ? 'No withdrawal wait required.' : 'कोई दवा निकासी अवधि आवश्यक नहीं है।'),
        });
        if (handleSuccess) handleSuccess();
      } else {
        setResultMessage({
          success: false,
          msg: json.message || (language === 'en' ? 'Failed to record treatment.' : 'दवा रिकॉर्ड करने में त्रुटि हुई।'),
        });
      }
    } catch {
      setResultMessage({
        success: false,
        msg: language === 'en' ? 'Server connection error.' : 'सर्वर से कनेक्ट करने में त्रुटि हुई।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const speciesName = (s: string) => {
    if (language === 'en') {
      return s === 'cow' ? 'Cattle (Cow)' : s === 'buffalo' ? 'Buffalo' : s === 'fishery' ? 'Fishery Pond' : s;
    }
    return s === 'cow' ? 'गाय' : s === 'buffalo' ? 'भैंस' : s === 'fishery' ? 'मत्स्य तालाब' : s;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-6 font-sans">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handleClose} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          {t('common.backToHome')}
        </Button>
      </div>

      <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#E8F5E9] border border-[#1B5E20]/30 rounded-2xl text-[#1B5E20]">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1B5E20]">{t('treatment.title')}</h1>
            <p className="text-xs text-gray-600 font-bold">{t('treatment.subtitle')}</p>
          </div>
        </div>

        {resultMessage?.success ? (
          <div className="p-6 bg-[#E8F5E9] border-2 border-[#1B5E20] rounded-2xl space-y-4 text-[#1B5E20]">
            <div className="flex items-center space-x-2 text-[#1B5E20] font-black text-lg">
              <CheckCircle2 className="w-6 h-6" />
              <span>{t('treatment.successMsg')}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/30 space-y-2 text-xs font-bold">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t('treatment.preview.withdrawalDays')}</span>
                <span className="font-black text-[#B78103]">
                  {resultMessage.withdrawalDays} {language === 'en' ? 'Days' : 'दिन'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-gray-900">{t('treatment.preview.calculatedSafeDate')}</span>
                <span className="text-[#1B5E20]">{resultMessage.safeDate}</span>
              </div>
            </div>

            <p className="text-xs text-[#1B5E20] font-black">{resultMessage.msg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-bold text-gray-800">
            {resultMessage?.success === false && (
              <div className="p-4 bg-[#FFEBEE] border border-[#D32F2F] rounded-xl text-[#D32F2F] flex items-center space-x-2 font-bold">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{resultMessage.msg}</span>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-1.5 font-bold">{t('treatment.selectAnimal')} *</label>
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-[#1B5E20] focus:outline-none"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.animal_code} ({speciesName(a.species)} - {a.breed})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1.5 font-bold">{t('treatment.selectMedicine')} *</label>
              <select
                value={medicineId}
                onChange={(e) => setMedicineId(e.target.value)}
                className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-[#1B5E20] focus:outline-none"
              >
                {language === 'en' ? (
                  <>
                    <option value="m1">Amoxicillin Inj (Penicillin - 5 Days Withdrawal)</option>
                    <option value="m2">Oxytetracycline LA (Tetracycline - 7 Days Withdrawal)</option>
                    <option value="m3">Tylosin 200 (Macrolide - 4 Days Withdrawal)</option>
                    <option value="m4">Enrofloxacin 10% (Fluoroquinolone)</option>
                  </>
                ) : (
                  <>
                    <option value="m1">Amoxicillin Inj (एमॉक्सिसिलिन - दूध रोको: 5 दिन)</option>
                    <option value="m2">Oxytetracycline LA (ऑक्सीटेट्रासाइक्लिन - दूध रोको: 7 दिन)</option>
                    <option value="m3">Tylosin 200 (टायलोसिन - दूध रोको: 4 दिन)</option>
                    <option value="m4">Enrofloxacin 10% (एनरोफ्लॉक्सासिन)</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1.5 font-bold">{t('treatment.dose')} *</label>
                <input
                  type="number"
                  required
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1.5 font-bold">{t('treatment.durationDays')} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1.5 font-bold">{t('treatment.startDate')} *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1.5 font-bold">{t('treatment.productAffected')}</label>
                <select
                  value={productAffected}
                  onChange={(e) => setProductAffected(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                >
                  {animals.find((a) => a.id === selectedAnimalId)?.species === 'fishery' ? (
                    <option value="all">{language === 'en' ? 'Aquaculture Biomass' : 'मत्स्य तालाब बायोमास'}</option>
                  ) : animals.find((a) => a.id === selectedAnimalId)?.species === 'poultry' ? (
                    <>
                      <option value="egg">{language === 'en' ? 'Eggs' : 'अंडे'}</option>
                      <option value="all">{language === 'en' ? 'Flock Clearance' : 'मुर्गी फार्म क्लीयरेंस'}</option>
                    </>
                  ) : (
                    <>
                      <option value="milk">{language === 'en' ? 'Dairy Milk' : 'डेयरी दूध'}</option>
                      <option value="all">{language === 'en' ? 'General Herd Food Safety' : 'पशुधन खाद्य सुरक्षा'}</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1.5 font-bold">{t('treatment.diseaseIndication')}</label>
              <input
                type="text"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Mastitis, Fever, Pneumonia' : 'उदा: Mastitis, बुखार, निमोनिया'}
                className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:border-[#1B5E20] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center text-base font-black shadow-xl bg-[#1B5E20]"
            >
              {t('treatment.submit')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
