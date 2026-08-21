import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Animal,
  Medicine,
  MedicineStock,
  Treatment,
  LabSample,
  RegulatoryRule,
  AuditLog,
  NotificationItem,
  Language,
  WithdrawalStatus,
  MLRiskLevel
} from '../types';
import {
  mockUsers,
  mockAnimals,
  mockMedicines,
  mockMedicineStocks,
  mockTreatments,
  mockLabSamples,
  mockRegulatoryRules,
  mockAuditLogs,
  mockNotifications
} from '../data/mockData';
import { translations } from '../i18n/translations';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  
  // Data entities
  users: User[];
  animals: Animal[];
  medicines: Medicine[];
  medicineStocks: MedicineStock[];
  treatments: Treatment[];
  labSamples: LabSample[];
  regulatoryRules: RegulatoryRule[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  
  // Quick Actions & Handlers
  switchRole: (role: UserRole) => void;
  addAnimal: (animal: Omit<Animal, 'id' | 'qrCodeData' | 'registeredAt' | 'daysRemainingInWithdrawal'>) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  
  recordTreatment: (newTrt: {
    animalId: string;
    medicineId: string;
    route: string;
    dose: string;
    frequency: 'Once Daily (QD)' | 'Twice Daily (BID)' | 'Single Dose' | 'Every 48 Hours';
    startDate: string;
    durationDays: number;
    reasonForTreatment: string;
    affectedProducts: ('Milk' | 'Meat' | 'Eggs')[];
  }) => Treatment;
  
  coSignTreatment: (treatmentId: string, notes: string) => void;
  overrideMLRisk: (treatmentId: string, reason: string) => void;
  
  // Stock Actions
  updateStockQuantity: (stockId: string, delta: number) => void;
  addStockItem: (item: Omit<MedicineStock, 'id' | 'isLowStock' | 'isExpiringSoon'>) => void;
  
  // Admin CRUD
  addRegulatoryRule: (rule: Omit<RegulatoryRule, 'id' | 'lastUpdated'>) => void;
  updateRegulatoryRule: (id: string, rule: Partial<RegulatoryRule>) => void;
  deleteRegulatoryRule: (id: string) => void;
  
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  
  // Vet Verification
  approveVetRegistration: (userId: string) => void;
  rejectVetRegistration: (userId: string, reason: string) => void;
  
  // Lab Samples
  recordLabSample: (sample: Omit<LabSample, 'id'>) => void;
  
  // Notifications
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Modals & Navigation
  selectedAnimalForPassport: Animal | null;
  setSelectedAnimalForPassport: (animal: Animal | null) => void;
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (isOpen: boolean) => void;
  isRoleSwitcherOpen: boolean;
  setIsRoleSwitcherOpen: (isOpen: boolean) => void;
  
  // Toasts
  toastMessage: { title: string; desc?: string; type?: 'success' | 'error' | 'info' } | null;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('agritrace_current_user');
    return saved ? JSON.parse(saved) : mockUsers[0];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('agritrace_users');
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [animals, setAnimals] = useState<Animal[]>(() => {
    const saved = localStorage.getItem('agritrace_animals');
    return saved ? JSON.parse(saved) : mockAnimals;
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('agritrace_medicines');
    return saved ? JSON.parse(saved) : mockMedicines;
  });

  const [medicineStocks, setMedicineStocks] = useState<MedicineStock[]>(() => {
    const saved = localStorage.getItem('agritrace_stocks');
    return saved ? JSON.parse(saved) : mockMedicineStocks;
  });

  const [treatments, setTreatments] = useState<Treatment[]>(() => {
    const saved = localStorage.getItem('agritrace_treatments');
    return saved ? JSON.parse(saved) : mockTreatments;
  });

  const [labSamples, setLabSamples] = useState<LabSample[]>(() => {
    const saved = localStorage.getItem('agritrace_lab_samples');
    return saved ? JSON.parse(saved) : mockLabSamples;
  });

  const [regulatoryRules, setRegulatoryRules] = useState<RegulatoryRule[]>(() => {
    const saved = localStorage.getItem('agritrace_rules');
    return saved ? JSON.parse(saved) : mockRegulatoryRules;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('agritrace_audits');
    return saved ? JSON.parse(saved) : mockAuditLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('agritrace_notifs');
    return saved ? JSON.parse(saved) : mockNotifications;
  });

  // UI state
  const [selectedAnimalForPassport, setSelectedAnimalForPassport] = useState<Animal | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'error' | 'info' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('agritrace_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('agritrace_animals', JSON.stringify(animals));
  }, [animals]);

  useEffect(() => {
    localStorage.setItem('agritrace_treatments', JSON.stringify(treatments));
  }, [treatments]);

  useEffect(() => {
    localStorage.setItem('agritrace_rules', JSON.stringify(regulatoryRules));
  }, [regulatoryRules]);

  useEffect(() => {
    localStorage.setItem('agritrace_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('agritrace_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('agritrace_stocks', JSON.stringify(medicineStocks));
  }, [medicineStocks]);

  const showToast = (title: string, desc?: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const addAuditLog = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string,
    beforeValue?: string,
    afterValue?: string
  ) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: formattedDate,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      beforeValue,
      afterValue,
      ipAddress: '103.48.192.14'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = users.find(u => u.role === newRole && u.status === 'active') || mockUsers.find(u => u.role === newRole) || mockUsers[0];
    setCurrentUser(targetUser);
    showToast(
      language === 'en' ? `Switched to ${newRole.toUpperCase()} mode` : `भूमिका बदलकर ${newRole.toUpperCase()} कर दी गई है`,
      `Active account: ${targetUser.name}`,
      'info'
    );
  };

  const addAnimal = (animalData: Omit<Animal, 'id' | 'qrCodeData' | 'registeredAt' | 'daysRemainingInWithdrawal'>) => {
    const id = `anim-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const newAnimal: Animal = {
      ...animalData,
      id,
      registeredAt: now,
      daysRemainingInWithdrawal: 0,
      qrCodeData: `https://agritrace.gov.in/passport/${animalData.tagId}`
    };

    setAnimals(prev => [newAnimal, ...prev]);
    addAuditLog('ANIMAL_REGISTERED', 'Animal', newAnimal.tagId, `Registered new ${newAnimal.species} (${newAnimal.breed}) with Tag ID ${newAnimal.tagId}`);
    showToast(
      language === 'en' ? 'Livestock Registered Successfully' : 'पशु सफलतापूर्वक पंजीकृत किया गया',
      `Tag ID: ${newAnimal.tagId} has been indexed.`,
      'success'
    );
  };

  const updateAnimal = (id: string, updates: Partial<Animal>) => {
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const recordTreatment = (newTrt: {
    animalId: string;
    medicineId: string;
    route: string;
    dose: string;
    frequency: 'Once Daily (QD)' | 'Twice Daily (BID)' | 'Single Dose' | 'Every 48 Hours';
    startDate: string;
    durationDays: number;
    reasonForTreatment: string;
    affectedProducts: ('Milk' | 'Meat' | 'Eggs')[];
  }): Treatment => {
    const targetAnimal = animals.find(a => a.id === newTrt.animalId);
    const targetMedicine = medicines.find(m => m.id === newTrt.medicineId);

    if (!targetAnimal || !targetMedicine) {
      throw new Error('Invalid Animal or Medicine ID');
    }

    // Resolve statutory withdrawal rule from master data
    const speciesRule = targetMedicine.defaultWithdrawalDays.find(s => s.species === targetAnimal.species) || {
      species: targetAnimal.species,
      milkDays: 4,
      meatDays: 14,
      eggsDays: 7
    };

    let maxWithdrawalDays = 0;
    if (newTrt.affectedProducts.includes('Milk')) maxWithdrawalDays = Math.max(maxWithdrawalDays, speciesRule.milkDays);
    if (newTrt.affectedProducts.includes('Meat')) maxWithdrawalDays = Math.max(maxWithdrawalDays, speciesRule.meatDays);
    if (newTrt.affectedProducts.includes('Eggs')) maxWithdrawalDays = Math.max(maxWithdrawalDays, speciesRule.eggsDays);
    if (maxWithdrawalDays === 0) maxWithdrawalDays = speciesRule.milkDays || speciesRule.meatDays || 3;

    // Calculate clearance date = startDate + durationDays + maxWithdrawalDays
    const start = new Date(newTrt.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + newTrt.durationDays);
    const clearance = new Date(end);
    clearance.setDate(clearance.getDate() + maxWithdrawalDays);

    const clearanceStr = clearance.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // ML Risk Evaluation Simulation
    let overuseRisk: MLRiskLevel = 'LOW';
    let complianceRisk: MLRiskLevel = 'LOW';
    const factors: string[] = [];

    if (targetMedicine.isCIA) {
      overuseRisk = 'HIGH';
      factors.push('Highest Priority Critically Important Antimicrobial (CIA)');
      factors.push('Regulatory watch substance under NAP-AMR guidelines');
    } else if (targetMedicine.antimicrobialClass.includes('Important')) {
      overuseRisk = 'MEDIUM';
      factors.push('First-line antimicrobial usage recorded');
    }

    if (newTrt.durationDays > 5) {
      complianceRisk = 'MEDIUM';
      factors.push('Treatment duration exceeds standard 5-day cycle');
    }

    const trtId = `trt-${Date.now()}`;
    const treatmentNumber = `TRT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const treatmentRecord: Treatment = {
      id: trtId,
      treatmentNumber,
      farmId: targetAnimal.farmId,
      farmName: targetAnimal.farmName,
      animalId: targetAnimal.id,
      animalTagId: targetAnimal.tagId,
      animalSpecies: targetAnimal.species,
      medicineId: targetMedicine.id,
      medicineName: targetMedicine.brandName,
      activeIngredient: targetMedicine.activeIngredient,
      antimicrobialClass: targetMedicine.antimicrobialClass,
      route: newTrt.route,
      dose: newTrt.dose,
      frequency: newTrt.frequency,
      startDate: newTrt.startDate,
      endDate: endStr,
      durationDays: newTrt.durationDays,
      reasonForTreatment: newTrt.reasonForTreatment,
      statutoryWithdrawalDays: maxWithdrawalDays,
      calculatedClearanceDate: clearanceStr,
      affectedProducts: newTrt.affectedProducts,
      status: targetMedicine.isCIA ? 'PENDING_VET_REVIEW' : 'APPROVED_BY_VET',
      overuseRisk,
      complianceRisk,
      mlConfidenceScore: 0.91,
      mlContributingFactors: factors.length ? factors : ['Standard dosage adheres to national MRL guidelines'],
      mlEvaluatedAt: new Date().toISOString(),
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.name,
      createdAt: new Date().toISOString()
    };

    setTreatments(prev => [treatmentRecord, ...prev]);

    // Update Animal status
    const today = new Date();
    const daysRemaining = Math.ceil((clearance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    updateAnimal(targetAnimal.id, {
      currentStatus: maxWithdrawalDays > 0 ? 'WITHDRAWAL_ACTIVE' : 'CLEARED',
      activeTreatmentId: trtId,
      earliestClearanceDate: clearanceStr,
      activeWithdrawalType: newTrt.affectedProducts.join(' & ') as any,
      daysRemainingInWithdrawal: Math.max(0, daysRemaining),
      healthNotes: `Under treatment with ${targetMedicine.brandName} for ${newTrt.reasonForTreatment}`
    });

    // Add Audit Log
    addAuditLog(
      'TREATMENT_CREATED',
      'Treatment',
      treatmentNumber,
      `Recorded treatment of ${targetAnimal.tagId} with ${targetMedicine.brandName}. Withdrawal clearance: ${clearanceStr}`,
      undefined,
      `Clearance Date: ${clearanceStr}, ML Risk: ${overuseRisk}`
    );

    // Deduct stock if exists
    setMedicineStocks(prev => prev.map(stk => {
      if (stk.medicineId === targetMedicine.id && stk.quantity > 0) {
        const nextQty = Math.max(0, stk.quantity - 1);
        return {
          ...stk,
          quantity: nextQty,
          isLowStock: nextQty <= stk.minThreshold
        };
      }
      return stk;
    }));

    // Add notification for Vet if CIA
    if (targetMedicine.isCIA) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          targetRole: 'vet',
          type: 'VET_APPROVAL_REQ',
          title: 'High-Risk Treatment Co-Signature Required',
          message: `Farmer recorded ${targetMedicine.brandName} (CIA) for ${targetAnimal.tagId}. Review & co-sign.`,
          timestamp: 'Just now',
          isRead: false,
          severity: 'warning'
        },
        ...prev
      ]);
    }

    showToast(
      language === 'en' ? 'Treatment Recorded & Withdrawal Calculated' : 'उपचार दर्ज किया गया और निकासी अवधि की गणना हुई',
      `Food clearance date computed: ${clearanceStr} (${maxWithdrawalDays} days statutory withholding)`,
      'success'
    );

    return treatmentRecord;
  };

  const coSignTreatment = (treatmentId: string, notes: string) => {
    setTreatments(prev => prev.map(t => {
      if (t.id === treatmentId) {
        return {
          ...t,
          status: 'APPROVED_BY_VET',
          prescribedByVetId: currentUser.id,
          prescribedByVetName: currentUser.name,
          vetCoSignedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          vetClinicalNotes: notes
        };
      }
      return t;
    }));

    const targetTrt = treatments.find(t => t.id === treatmentId);
    if (targetTrt) {
      addAuditLog(
        'TREATMENT_CO_SIGNED',
        'Treatment',
        targetTrt.treatmentNumber,
        `Vet ${currentUser.name} co-signed treatment with note: "${notes}"`,
        'PENDING_VET_REVIEW',
        'APPROVED_BY_VET'
      );
    }

    showToast(
      language === 'en' ? 'Treatment Co-Signed & Validated' : 'उपचार सह-हस्ताक्षरित एवं सत्यापित किया गया',
      'Clinical validation logged to statutory audit ledger.',
      'success'
    );
  };

  const overrideMLRisk = (treatmentId: string, reason: string) => {
    setTreatments(prev => prev.map(t => {
      if (t.id === treatmentId) {
        return {
          ...t,
          vetOverrideReason: reason,
          status: 'APPROVED_BY_VET'
        };
      }
      return t;
    }));

    const targetTrt = treatments.find(t => t.id === treatmentId);
    if (targetTrt) {
      addAuditLog(
        'RISK_OVERRIDE',
        'Treatment',
        targetTrt.treatmentNumber,
        `Vet override logged for ML risk on ${targetTrt.treatmentNumber}. Reason: "${reason}"`,
        `ML Risk: ${targetTrt.overuseRisk}`,
        `Overridden by Vet with justification: ${reason}`
      );
    }

    showToast(
      language === 'en' ? 'ML Risk Override Logged' : 'एआई जोखिम ओवरराइड दर्ज किया गया',
      'Clinical justification submitted to compliance records.',
      'info'
    );
  };

  const updateStockQuantity = (stockId: string, delta: number) => {
    setMedicineStocks(prev => prev.map(stk => {
      if (stk.id === stockId) {
        const newQty = Math.max(0, stk.quantity + delta);
        return {
          ...stk,
          quantity: newQty,
          isLowStock: newQty <= stk.minThreshold
        };
      }
      return stk;
    }));
    showToast(
      language === 'en' ? 'Stock Quantity Updated' : 'स्टॉक मात्रा अपडेट की गई',
      undefined,
      'info'
    );
  };

  const addStockItem = (item: Omit<MedicineStock, 'id' | 'isLowStock' | 'isExpiringSoon'>) => {
    const newItem: MedicineStock = {
      ...item,
      id: `stk-${Date.now()}`,
      isLowStock: item.quantity <= item.minThreshold,
      isExpiringSoon: new Date(item.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    };
    setMedicineStocks(prev => [newItem, ...prev]);
    showToast(
      language === 'en' ? 'New Stock Batch Added' : 'नया स्टॉक बैच जोड़ा गया',
      `Batch: ${item.batchNumber}`,
      'success'
    );
  };

  const addRegulatoryRule = (rule: Omit<RegulatoryRule, 'id' | 'lastUpdated'>) => {
    const newRule: RegulatoryRule = {
      ...rule,
      id: `rul-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setRegulatoryRules(prev => [newRule, ...prev]);
    addAuditLog(
      'RULE_CREATED',
      'MedicineRule',
      newRule.ruleCode,
      `Created new MRL & statutory withdrawal rule ${newRule.ruleCode} for ${newRule.activeIngredient} (${newRule.species} - ${newRule.productType})`
    );
    showToast(
      language === 'en' ? 'Regulatory Rule Created' : 'नियामक नियम सफलतापूर्वक बनाया गया',
      `Rule Code: ${newRule.ruleCode}`,
      'success'
    );
  };

  const updateRegulatoryRule = (id: string, updates: Partial<RegulatoryRule>) => {
    setRegulatoryRules(prev => prev.map(r => r.id === id ? { ...r, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : r));
    addAuditLog(
      'RULE_UPDATED',
      'MedicineRule',
      id,
      `Updated regulatory parameters for Rule ID ${id}`
    );
    showToast(
      language === 'en' ? 'Regulatory Rule Updated' : 'नियामक नियम अद्यतन किया गया',
      undefined,
      'info'
    );
  };

  const deleteRegulatoryRule = (id: string) => {
    setRegulatoryRules(prev => prev.filter(r => r.id !== id));
    showToast(
      language === 'en' ? 'Rule Archived' : 'नियम हटाया गया',
      undefined,
      'info'
    );
  };

  const addMedicine = (med: Omit<Medicine, 'id'>) => {
    const newMed: Medicine = {
      ...med,
      id: `med-${Date.now()}`
    };
    setMedicines(prev => [newMed, ...prev]);
    showToast(
      language === 'en' ? 'Medicine Added to National Master' : 'दवा राष्ट्रीय मास्टर में जोड़ी गई',
      newMed.brandName,
      'success'
    );
  };

  const approveVetRegistration = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'active',
          verifiedAt: new Date().toISOString().split('T')[0],
          verifiedBy: currentUser.name
        };
      }
      return u;
    }));
    addAuditLog(
      'VET_VERIFIED',
      'Veterinarian',
      userId,
      `Admin approved veterinary license credentials for User ID ${userId}`,
      'Status: pending_verification',
      'Status: active'
    );
    showToast(
      language === 'en' ? 'Veterinarian Approved' : 'पशुचिकित्सक पंजीकरण स्वीकृत',
      'Account has been granted full clinical co-sign privileges.',
      'success'
    );
  };

  const rejectVetRegistration = (userId: string, reason: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'suspended'
        };
      }
      return u;
    }));
    addAuditLog(
      'VET_VERIFIED',
      'Veterinarian',
      userId,
      `Admin rejected veterinary registration. Reason: ${reason}`,
      'Status: pending_verification',
      'Status: suspended'
    );
    showToast(
      language === 'en' ? 'Registration Rejected' : 'पंजीकरण अस्वीकृत',
      reason,
      'error'
    );
  };

  const recordLabSample = (sample: Omit<LabSample, 'id'>) => {
    const newSample: LabSample = {
      ...sample,
      id: `lab-${Date.now()}`
    };
    setLabSamples(prev => [newSample, ...prev]);
    addAuditLog(
      'RESIDUE_LOGGED',
      'LabSample',
      newSample.sampleCode,
      `Recorded ${newSample.verdict} for Sample ${newSample.sampleCode} from Farm ${newSample.farmName}`
    );

    if (newSample.verdict.includes('VIOLATION')) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          targetRole: 'all',
          type: 'COMPLIANCE_VIOLATION',
          title: '🚨 Statutory MRL Violation Detected',
          message: `Sample ${newSample.sampleCode} failed MRL threshold (${newSample.residueLevel_ug_kg} µg/kg vs limit ${newSample.statutoryMRL_ug_kg} µg/kg). Immediate compliance audit initiated.`,
          timestamp: 'Just now',
          isRead: false,
          severity: 'error'
        },
        ...prev
      ]);
    }

    showToast(
      language === 'en' ? 'Residue Test Sample Logged' : 'अवशेष परीक्षण नमूना दर्ज किया गया',
      `Verdict: ${newSample.verdict}`,
      newSample.verdict.includes('VIOLATION') ? 'error' : 'success'
    );
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast(language === 'en' ? 'All notifications marked as read' : 'सभी सूचनाएं पढ़ी गईं', undefined, 'info');
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        language,
        setLanguage,
        t,
        users,
        animals,
        medicines,
        medicineStocks,
        treatments,
        labSamples,
        regulatoryRules,
        auditLogs,
        notifications,
        switchRole,
        addAnimal,
        updateAnimal,
        recordTreatment,
        coSignTreatment,
        overrideMLRisk,
        updateStockQuantity,
        addStockItem,
        addRegulatoryRule,
        updateRegulatoryRule,
        deleteRegulatoryRule,
        addMedicine,
        approveVetRegistration,
        rejectVetRegistration,
        recordLabSample,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        selectedAnimalForPassport,
        setSelectedAnimalForPassport,
        isQRScannerOpen,
        setIsQRScannerOpen,
        isRoleSwitcherOpen,
        setIsRoleSwitcherOpen,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
