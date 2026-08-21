import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  FileText, 
  Terminal,
  Calendar
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs, t } = useApp();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'All' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            Central Regulatory Audit Trail & Governance Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, timestamped ledger of every clinical record, veterinary validation, AI override, and regulatory rule amendment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user, action, entity ID, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-medium"
            >
              <option value="All">All Action Types</option>
              <option value="TREATMENT_CREATED">TREATMENT_CREATED</option>
              <option value="TREATMENT_CO_SIGNED">TREATMENT_CO_SIGNED</option>
              <option value="RISK_OVERRIDE">RISK_OVERRIDE</option>
              <option value="RULE_CREATED">RULE_CREATED</option>
              <option value="RULE_UPDATED">RULE_UPDATED</option>
              <option value="VET_VERIFIED">VET_VERIFIED</option>
              <option value="RESIDUE_LOGGED">RESIDUE_LOGGED</option>
              <option value="ANIMAL_REGISTERED">ANIMAL_REGISTERED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp & IP</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action & Target</th>
                <th className="py-3.5 px-4">Modification Details</th>
                <th className="py-3.5 px-4">Diff / Value State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition font-mono">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block text-xs">{log.timestamp}</span>
                    <span className="text-[10px] text-slate-400">{log.ipAddress || '103.48.192.14'}</span>
                  </td>

                  <td className="py-3 px-4 font-sans">
                    <span className="font-bold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] uppercase font-bold text-teal-800">{log.userRole}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {log.entityType} • {log.entityId}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-sans text-xs text-slate-700 max-w-xs">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-[11px]">
                    {log.afterValue && (
                      <span className="text-teal-900 bg-teal-50 px-2 py-1 rounded border border-teal-200 block truncate max-w-xs">
                        {log.afterValue}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
