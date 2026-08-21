import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { X, CheckCircle, ShieldCheck, Stethoscope, Tractor, Building2, Sparkles } from 'lucide-react';

export const RoleSwitcherModal: React.FC = () => {
  const { isRoleSwitcherOpen, setIsRoleSwitcherOpen, currentUser, switchRole, users, setCurrentUser, t } = useApp();

  if (!isRoleSwitcherOpen) return null;

  const roles = [
    {
      id: 'farmer' as UserRole,
      title: t.roleFarmer,
      desc: 'Log treatments, calculate live withdrawal periods, track medicine stock, view withdrawal calendar, and access QR food passports.',
      icon: Tractor,
      badge: 'Mobile-First Producer UI',
      accentColor: 'from-emerald-700 to-teal-800',
      user: users.find(u => u.role === 'farmer')
    },
    {
      id: 'vet' as UserRole,
      title: t.roleVet,
      desc: 'Review farmer prescriptions, co-sign treatments, inspect ML overuse risk models, monitor repeat treatments, and log overrides.',
      icon: Stethoscope,
      badge: 'Clinical Stewardship UI',
      accentColor: 'from-teal-700 to-cyan-800',
      user: users.find(u => u.role === 'vet' && u.status === 'active')
    },
    {
      id: 'admin' as UserRole,
      title: t.roleAdmin,
      desc: 'National & regional surveillance, MRL/medicine master data CRUD, vet registration approvals, lab residue testing, and geospatial risk heatmaps.',
      icon: Building2,
      badge: 'Regulatory & Governance UI',
      accentColor: 'from-sky-800 to-blue-900',
      user: users.find(u => u.role === 'admin')
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.switchRole}</h3>
              <p className="text-xs text-slate-300">Seamlessly preview any stakeholder's customized workspace</p>
            </div>
          </div>
          <button
            onClick={() => setIsRoleSwitcherOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-6 space-y-4">
          {roles.map(r => {
            const isSelected = currentUser.role === r.id;
            const Icon = r.icon;

            return (
              <div
                key={r.id}
                onClick={() => {
                  if (r.user) {
                    setCurrentUser(r.user);
                  } else {
                    switchRole(r.id);
                  }
                  setIsRoleSwitcherOpen(false);
                }}
                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.accentColor} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{r.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {r.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          Active
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{r.desc}</p>
                    
                    {r.user && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Demo Profile: <strong className="text-slate-800">{r.user.name}</strong> ({r.user.phone})
                        </span>
                        <span className="text-teal-700 font-bold hover:underline">
                          Select & Launch →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            * All data interactions, calculations, and audits persist locally in your browser.
          </p>
          <button
            onClick={() => setIsRoleSwitcherOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
