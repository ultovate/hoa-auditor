/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  FileSearch,
  Loader2,
  Sparkles,
  Bot,
  DollarSign,
  Heart,
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle2,
  Mail,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../theme';
import { FindingId, Tab } from '../../domain';

interface SummaryTabProps {
  setActiveTab: (tab: Tab) => void;
  generateAiInsight: (id: FindingId, title: string, context: string) => Promise<void> | void;
  explainingIds: Set<FindingId>;
  aiInsight: Partial<Record<FindingId, string>>;
}

const SummaryTab = ({ setActiveTab, generateAiInsight, explainingIds, aiInsight }: SummaryTabProps) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-2">Total Findings</span>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-800 text-4xl font-bold">38</span>
            <span className="text-slate-500 text-sm font-medium">10 need attention</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-2 font-semibold">Verification Needed</span>
          <div className="flex items-baseline gap-2">
            <span style={{ color: theme.danger }} className="text-4xl font-bold">10</span>
            <span className="text-slate-500 text-sm font-medium">Review before closing</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-2">WUCIOA Compliance</span>
          <div className="flex items-baseline gap-2">
            <span style={{ color: theme.success }} className="text-4xl font-bold">9 <span className="text-xl opacity-30 text-slate-300">/ 26</span></span>
            <span className="text-slate-500 text-sm font-medium">Verified</span>
          </div>
        </div>
      </div>

      {/* Top Priority Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-slate-800 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <AlertCircle style={{ color: theme.danger }} className="w-4 h-4" /> Top Priority Verification
          </h2>
          <button onClick={() => setActiveTab('Risks')} style={{ color: theme.brand }} className="text-xs font-bold hover:underline">VIEW ALL FINDINGS →</button>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-6 flex flex-col gap-4 relative">
            <div style={{ backgroundColor: theme.danger }} className="absolute left-0 top-0 bottom-0 w-1"></div>
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-slate-800 font-bold">Outdated HOA Savings Study</h3>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-red-200">Action Needed</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-2 opacity-90">The study on file is over 12 years old. Without a current study, it is impossible to verify if the association has adequate funds for major repairs, creating a massive liability for the buyer.</p>
                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1 font-mono"><FileSearch className="w-3.5 h-3.5" /> Source: ReserveStudy.pdf • Page 4</span>
                </div>
              </div>
              <button
                onClick={() => generateAiInsight('reserve-study', 'Outdated Reserve Study', 'The document is from 2011, which is 15 years old.')}
                className="shrink-0 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
              >
                {explainingIds.has('reserve-study') ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                ✨ Forensic Insight
              </button>
            </div>

            <AnimatePresence>
              {aiInsight['reserve-study'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-900 text-slate-300 p-5 rounded-xl text-sm border-l-4 border-purple-500 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3 text-purple-400">
                    <Bot className="w-4 h-4" />
                    <span className="font-bold text-[10px] uppercase tracking-widest">AI Audit Perspective</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed opacity-90">{aiInsight['reserve-study']}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Financial Snapshot */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-slate-800 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <DollarSign style={{ color: theme.success }} className="w-4 h-4" /> Financial Snapshot
          </h2>
          <button onClick={() => setActiveTab('Financial')} style={{ color: theme.brand }} className="text-xs font-bold hover:underline">VIEW FULL FINANCIAL →</button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-slate-800">
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-medium uppercase tracking-tight">Monthly Fee</span>
            <span className="text-slate-800 text-2xl font-bold">$531</span>
            <div className="bg-slate-200 mt-2 w-full h-1.5 rounded-full overflow-hidden">
              <div style={{ backgroundColor: theme.success }} className="w-1/4 h-full"></div>
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-medium uppercase tracking-tight">HOA Savings</span>
            <span style={{ color: theme.success }} className="text-2xl font-bold">76.3%</span>
            <p className="text-slate-400 text-[10px] mt-1 italic tracking-tight">Current funding status.</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-medium uppercase tracking-tight">Assessments</span>
            <span style={{ color: theme.warning }} className="text-2xl font-bold">1</span>
            <p className="text-slate-400 text-[10px] mt-1 tracking-tight">Pending verification.</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-medium uppercase tracking-tight">Total Exposure</span>
            <span style={{ color: theme.danger }} className="text-2xl font-bold tracking-tight">$535,646.79</span>
          </div>
        </div>
      </section>

      {/* Lifestyle Impact */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-slate-800 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <Heart style={{ color: theme.brand }} className="w-4 h-4" /> Lifestyle Impact Restrictions
          </h2>
          <button onClick={() => setActiveTab('Restrictions')} style={{ color: theme.brand }} className="text-xs font-bold hover:underline">VIEW ALL RESTRICTIONS →</button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50/10 border border-red-100 p-6 rounded-xl group relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-600 font-bold text-xs uppercase flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-slate-400" /> Airbnb / STR
              </h3>
              <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-red-200">Restricted</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">Short-term rentals explicitly prohibited in bylaws. High enforcement history in board minutes.</p>
          </div>
          <div className="bg-amber-50/10 border border-amber-100 p-6 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-600 font-bold text-xs uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" /> Pet Weight
              </h3>
              <span className="bg-amber-100 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-amber-200">Limits</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">40lb weight limit strictly enforced. One variance was denied in 2024 for a 50lb Golden Retriever.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-600 font-bold text-xs uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> House Rules
              </h3>
              <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-slate-200">Standard</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">Standard quiet hours (10 PM) and balcony decor rules are maintained. No major red flags.</p>
          </div>
        </div>
      </section>

      {/* Buyer's Checklist */}
      <section className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div style={{ backgroundColor: theme.darkHeader }} className="p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="border-emerald-500 w-8 h-8 rounded-full border-2 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Buyer's Investigation Checklist</h2>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">Collaborate with your team to clear these items before closing.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled
              title="Coming soon"
              className="bg-white/5 text-white/40 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/10 cursor-not-allowed"
            >
              ✨ Generate Email to Agent
            </button>
            <button
              disabled
              title="Coming soon"
              style={{ backgroundColor: theme.brand, opacity: 0.5 }}
              className="text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-not-allowed"
            >
              <Mail className="w-4 h-4 text-white/80" /> Send Checklist
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Users style={{ color: theme.brand }} className="w-4 h-4" />
              <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Tasks for Agent</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 items-start cursor-pointer group">
                <div style={{ borderColor: theme.warning }} className="w-5 h-5 rounded border-2 bg-white shrink-0 mt-0.5 flex items-center justify-center transition-all group-hover:border-purple-400">
                  <div style={{ backgroundColor: theme.warning }} className="w-2.5 h-2.5 rounded-sm group-hover:bg-purple-400"></div>
                </div>
                <div>
                  <p className="text-slate-800 text-xs font-bold leading-tight group-hover:text-purple-700">Order Fresh Resale Cert</p>
                  <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">The 2013 certificate is legally expired.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <User style={{ color: theme.brand }} className="w-4 h-4" />
              <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Your Investigation</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 items-start cursor-pointer group">
                <div className="border-slate-300 w-5 h-5 rounded border-2 bg-white shrink-0 mt-0.5"></div>
                <div>
                  <p className="text-slate-800 text-xs font-bold leading-tight">Confirm Pet Suitability</p>
                  <p className="text-slate-500 text-[10px] mt-1">Review weight limit history for your specific pet.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck style={{ color: theme.brand }} className="w-4 h-4" />
              <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Lender Check</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 items-start cursor-pointer group">
                <div style={{ borderColor: theme.warning }} className="w-5 h-5 rounded border-2 bg-white shrink-0 mt-0.5 flex items-center justify-center">
                  <div style={{ backgroundColor: theme.warning }} className="w-2.5 h-2.5 rounded-sm"></div>
                </div>
                <div>
                  <p className="text-slate-800 text-xs font-bold leading-tight">Validate Master Insurance</p>
                  <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">Policy certificate must be dated for 2026.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default SummaryTab;
