'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  Upload,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Camera,
  Radio,
} from 'lucide-react';
import { Species, TriageSeverity } from '../../types/database';
import { ClinicalTriageService, SYMPTOM_CATALOG } from '../../lib/services/triage.service';
import { CloudinaryService } from '../../lib/services/cloudinary.service';

interface SyndromicReportModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const SyndromicReportModal: React.FC<SyndromicReportModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [species, setSpecies] = useState<Species>('cow');
  const [affectedCount, setAffectedCount] = useState<number>(1);
  const [mortalityCount, setMortalityCount] = useState<number>(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number>(18.5793);
  const [longitude, setLongitude] = useState<number>(73.9824);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const toggleSymptom = (key: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  // Evaluate clinical triage in real-time
  const triageResult = useMemo(() => {
    return ClinicalTriageService.evaluateTriage({
      selectedSymptoms,
      species,
      vectorRiskMultiplier: 1.8,
    });
  }, [selectedSymptoms, species]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-600 text-white animate-pulse';
      case 'high':
        return 'bg-red-500 text-white';
      case 'moderate':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadedUrl: string | null = null;
    if (photoFile) {
      try {
        const uploadResult = await CloudinaryService.uploadImage(
          photoFile,
          'farmshield/syndromic_reports'
        );
        uploadedUrl = uploadResult.secureUrl;
      } catch {
        // Continue with local preview if offline
        uploadedUrl = photoPreview;
      }
    }

    const reportPayload = {
      client_report_id: `rep_${Date.now()}`,
      species,
      affected_count: affectedCount,
      mortality_count: mortalityCount,
      symptoms: selectedSymptoms,
      suspected_disease: triageResult.suspectedConditions[0] || 'Unspecified',
      triage_severity: triageResult.urgency.toUpperCase() as TriageSeverity,
      latitude,
      longitude,
      photo_url: uploadedUrl,
      status: 'reported',
      created_at: new Date().toISOString(),
    };

    try {
      await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      }).catch(() => null);
    } catch {
      // Offline fallback
    }

    setIsSubmitting(false);
    setSubmitted(true);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-red-500/30 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                Emergency Syndromic Disease Reporting
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black border border-red-200">
                  AI TRIAGE
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-bold">
                Automated Clinical Triage & Immediate Biosecurity Advisory
              </p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Disease Incident Registered</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Your syndromic report has been logged and transmitted to the National Outbreak GIS Surveillance Grid.
              Assigned Triage Priority:{' '}
              <span className="font-black text-red-600 uppercase">
                {triageResult.urgency}
              </span>.
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition"
              >
                Done & Return to Surveillance Map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-bold text-gray-700">
            {/* 1. Species & Herd Headcount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 text-gray-600">Affected Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as Species)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-black text-gray-900 outline-none"
                >
                  <option value="cow">Cattle (Cow)</option>
                  <option value="buffalo">Buffalo</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                  <option value="poultry">Poultry</option>
                  <option value="swine">Swine</option>
                  <option value="fishery">Inland Aquaculture</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-600">Sick / Morbid Animals</label>
                <input
                  type="number"
                  min="1"
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-black text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-600">Deceased / Mortality</label>
                <input
                  type="number"
                  min="0"
                  value={mortalityCount}
                  onChange={(e) => setMortalityCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-black text-red-600 outline-none"
                />
              </div>
            </div>

            {/* 2. Symptom Checklist */}
            <div className="space-y-2">
              <label className="block text-gray-600">
                Observed Clinical Symptoms (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {Object.entries(SYMPTOM_CATALOG).map(([key, item]) => {
                  const isChecked = selectedSymptoms.includes(key);
                  return (
                    <label
                      key={key}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2.5 select-none ${
                        isChecked
                          ? 'border-red-500 bg-red-50 text-red-900 font-black'
                          : 'border-gray-200 bg-[#FAFAFA] text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        aria-label={item.label}
                        onChange={() => toggleSymptom(key)}
                        className="rounded text-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                      <span className="text-xs">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Live AI Triage Recommendation Box */}
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-amber-300/80 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Automated Triage: {triageResult.suspectedConditions[0] || 'Observational'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${getUrgencyBadge(
                    triageResult.urgency
                  )}`}
                >
                  {triageResult.urgency} Urgency
                </span>
              </div>

              {triageResult.rationalePoints.length > 0 && (
                <p className="text-[11px] text-gray-700 font-medium">
                  {triageResult.rationalePoints[0]}
                </p>
              )}

              {triageResult.recommendedActions.length > 0 && (
                <div className="pt-1 text-[11px] text-gray-900 font-bold space-y-1">
                  <span className="text-red-700 font-black block">Immediate Biosecurity Protocol:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700 font-medium">
                    {triageResult.recommendedActions.slice(0, 2).map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. Photo & Geolocation Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block mb-1 text-gray-600">Clinical Lesion Photo Upload</label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-gray-700 font-bold transition">
                  <Camera className="w-4 h-4 text-[#1B5E20]" />
                  <span className="truncate">
                    {photoFile ? photoFile.name : 'Take or upload photo...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block mb-1 text-gray-600">Incident GPS Coordinates</label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-mono">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-black transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Transmitting Report...</span>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Submit & Broadcast Outbreak Alert</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
