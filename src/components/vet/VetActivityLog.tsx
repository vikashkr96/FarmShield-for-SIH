import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  CheckCircle2, 
  FileCheck, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Clock 
} from 'lucide-react';

export const VetActivityLog: React.FC = () => {
  const { auditLogs, currentUser, t } = useApp();

  const vetLogs = auditLogs.filter(l => l.userRole === 'vet' || l.userId === currentUser.id);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-700" />
            Veterinary Clinical Accountability & Activity Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all treatment co-signatures, ML risk overrides, and clinical validations performed.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300 self-start sm:self-auto">
          {vetLogs.length} Logged Actions
        </span>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 divide-y divide-slate-100">
        {vetLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No clinical activities logged yet in this session.
          </div>
        ) : (
          vetLogs.map(log => (
            <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    {log.action.replace(/_/g, ' ')} • <span className="font-mono text-teal-800">{log.entityId}</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {log.details}
                </p>
                {log.afterValue && (
                  <div className="mt-1.5 p-2 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-700 border border-slate-200">
                    Result: {log.afterValue}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
