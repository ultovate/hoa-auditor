import { Clock, AlertTriangle } from 'lucide-react';

interface PropertyHeroProps {
  coverImage?: string;
}

const PropertyHero = ({ coverImage = '/public/condos/placeholder.jpg' }: PropertyHeroProps) => {
  // Strip '/public' prefix if it exists to allow Vite to resolve from the public folder correctly at runtime
  const resolvedImage = coverImage.startsWith('/public/')
    ? coverImage.substring(7)
    : coverImage;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#2D1B33] p-6 md:p-8 mb-6 border border-white/10 shadow-xl">
      {/* Background Image layer with mix-blend-overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 pointer-events-none"
        style={{ backgroundImage: `url(${resolvedImage})` }}
      />
      {/* Dark purple/violet gradient overlay that complements theme.heroBg to keep text contrast high */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1F1224] via-[#2D1B33]/80 to-transparent pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 max-w-7xl mx-auto">
          <div className="animate-in slide-in-from-left duration-500">
            <span className="text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-1 block">Chiavari Owners Association</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">10398 NE 17th St., #302, Bellevue WA 98004</h1>
            <p className="text-white/90 text-sm mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-300" /> Analysis Date: April 26, 2026 • 6 documents analyzed
            </p>
          </div>
        </div>

        {/* Global Disclaimer */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-amber-50/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4 transition-all hover:bg-amber-50/15">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-amber-200 text-[10px] font-bold uppercase tracking-[0.1em]">Forensic Audit Disclaimer</p>
              <p className="text-slate-200 text-[11px] leading-relaxed opacity-95">
                This report is an automated forensic analysis of HOA documentation. It is intended for informational and preliminary investigation purposes only. These findings do not constitute legal or financial advice. We strongly recommend a professional review of all "Action Needed" items by a qualified attorney.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyHero;
