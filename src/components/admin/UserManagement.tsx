import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { 
  UserCheck, 
  Stethoscope, 
  Tractor, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Clock, 
  ShieldCheck,
  FileText
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, approveVetRegistration, rejectVetRegistration, t } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'vet' | 'farmer' | 'admin'>('all');

  const pendingVets = users.filter(u => u.role === 'vet' && u.status === 'pending_verification');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      (u.licenseNumber && u.licenseNumber.toLowerCase().includes(search.toLowerCase())) ||
      (u.farmName && u.farmName.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-700" />
            Stakeholder Identity & Veterinarian Credential Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authenticate Veterinary Council of India (VCI) license registries, manage farm operators, and enforce access controls.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
          {pendingVets.length} Pending Vet Registrations
        </span>
      </div>

      {/* PENDING VET VERIFICATION QUEUE */}
      {pendingVets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Pending Veterinarian Council Validations ({pendingVets.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {pendingVets.map(vet => (
              <div
                key={vet.id}
                className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 to-white border-2 border-amber-300 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={vet.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
                      alt={vet.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{vet.name}</h4>
                      <p className="text-xs text-slate-600">
                        VCI License: <strong className="font-mono text-amber-900">{vet.licenseNumber}</strong> • {vet.council}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Affiliation: {vet.clinicAffiliation} • Submitted on: {vet.verificationRequestedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => rejectVetRegistration(vet.id, 'License registration details not found in state veterinary registry.')}
                      className="px-3.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Reject Application
                    </button>

                    <button
                      onClick={() => approveVetRegistration(vet.id)}
                      className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Grant Access
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH & USER DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user name, phone, license, or farm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'farmer', 'vet', 'admin'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg transition capitalize ${
                  roleFilter === role ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Stakeholder</th>
                <th className="py-3 px-4">Role & Jurisdiction</th>
                <th className="py-3 px-4">Credentials / Farm Name</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Contact Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{user.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' :
                      user.role === 'vet' ? 'bg-teal-100 text-teal-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {user.district ? `${user.district}, ${user.state}` : user.jurisdiction || 'National'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {user.farmName || user.licenseNumber || user.designation}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {user.productionType ? `Type: ${user.productionType}` : user.council || user.department}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : user.status === 'pending_verification' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {user.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {user.status === 'pending_verification' && <Clock className="w-3 h-3 text-amber-600" />}
                      {user.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">
                    {user.phone}
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
