import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  ExternalLink, 
  Lock, 
  CheckCircle,
  HelpCircle,
  Building,
  HeartPulse
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Column 1: Ministry & Portal Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-800/80 flex items-center justify-center border border-teal-600">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">AgriTrace Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footerGovt}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footerMinistry}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/80 text-teal-300 border border-teal-800/60 text-xs">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>NIC Certified Secure Infrastructure</span>
            </div>
          </div>

          {/* Column 2: Emergency Pashu Seva Hotline */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              24x7 Helpdesk & Advisory
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="text-xs text-slate-400">{t.footerHelpline}</div>
              <div className="text-lg font-extrabold text-emerald-400 font-mono flex items-center gap-2">
                <span>{t.footerHelplineNo}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Available in 12 Indian regional languages for farmers & veterinarians.
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Technical Support: <span className="text-teal-400 font-mono">support-agritrace@gov.in</span>
            </div>
          </div>

          {/* Column 3: Regulatory Portals & Guidelines */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Regulatory Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="https://vasudha-dahd.app" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-teal-400" />
                  {t.footerLinks.vasudha} (DAHD)
                </a>
              </li>
              <li>
                <a 
                  href="https://dahd.nic.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-teal-400" />
                  {t.footerLinks.dahd}
                </a>
              </li>
              <li>
                <a 
                  href="https://fssai.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-teal-400" />
                  {t.footerLinks.fssaiMRL}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-teal-400" />
                  {t.footerLinks.inapAmr}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Food Safety & MRL Compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-amber-400" />
              Food Safety Mission
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footerCompliance}
            </p>
            <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Daily MRL Surveillance Active</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400"></span>
              <span>WOAH Terrestrial Standard Synchronized</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>{t.footerCopyright}</p>
          <div className="flex items-center space-x-4">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition">
              {t.footerLinks.privacy}
            </a>
            <span>•</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition">
              Accessibility
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
