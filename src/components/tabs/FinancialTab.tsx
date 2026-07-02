/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Bot,
  Flag,
  Info,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../theme';
import { FindingId } from '../../domain';

interface FinancialTabProps {
  flaggedItems: Set<FindingId>;
  toggleFlag: (id: FindingId) => void;
  generateAiInsight: (id: FindingId, title: string, context: string) => Promise<void> | void;
  explainingIds: Set<FindingId>;
  aiInsight: Partial<Record<FindingId, string>>;
}

const FinancialTab = ({ flaggedItems, toggleFlag, generateAiInsight, explainingIds, aiInsight }: FinancialTabProps) => {
  const theme = useTheme();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* --- PRIMARY FINANCIAL POINTS --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h3 className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Points to Verify with Professionals</h3>
        </div>

        {/* 1. TOP SUMMARY: Total Financial Exposure */}
        <section className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 relative group">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-slate-800 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" /> Potential Asset Adjustments
            </h2>
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${flaggedItems.has('total-exposure') ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                onClick={() => toggleFlag('total-exposure')}
              >
                <Flag className={`w-3 h-3 ${flaggedItems.has('total-exposure') ? 'fill-white' : 'text-red-400'}`} /> {flaggedItems.has('total-exposure') ? 'Flagged for Agent' : 'Flag for Agent'}
              </button>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-slate-600">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs uppercase tracking-wider">Identified Reserve Shortfall</span>
                      <span className="text-slate-500 text-xs mt-1">Based on last available assessment study</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right text-slate-800 font-bold">$43,022</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-slate-600">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs uppercase tracking-wider">Estimated Special Assessment</span>
                      <span className="text-slate-500 text-xs mt-1">Projected per unit to bridge savings gap</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right text-slate-800 font-bold">$2,531</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-6 py-6 text-slate-500 font-bold text-xs uppercase tracking-wider">Total Visible Exposure</td>
                  <td className="px-6 py-6 text-right text-slate-800 text-3xl font-bold">$73,163</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-6 py-3 bg-blue-50/50 border-t border-blue-100/50">
            <p className="text-[10px] text-blue-700/70 leading-relaxed italic">
              <span className="font-bold">Suggestion:</span> Documents show these figures as of 2013/2014. Ask your agent if the association has successfully funded these needs or if a new assessment plan has been started.
            </p>
          </div>
        </section>

        {/* --- OPERATIONAL COSTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-300" />
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Monthly Dues</h3>
            </div>
            <p className="text-slate-800 font-bold text-2xl">$531</p>
            <p className="text-slate-400 text-[10px] mt-1">Paid to Association</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight className="w-4 h-4 text-slate-300" />
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Closing Fee</h3>
            </div>
            <p className="text-slate-800 font-bold text-2xl">$250</p>
            <p className="text-slate-400 text-[10px] mt-1 italic">Transfer cost</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Legal Trend</h3>
              <TrendingUp className="w-3 h-3 text-slate-300" />
            </div>
            <p className="text-slate-800 font-bold text-2xl">$6,000 <span className="text-xs text-slate-400 font-normal">total</span></p>
            <p className="text-slate-500 text-[11px] font-bold uppercase mt-1">Variance Noted</p>
          </div>
        </div>

        {/* 6. Insurance Update (High Impact but Neutral Wording) */}
        <section className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${flaggedItems.has('insurance') ? 'border-red-500 bg-red-50/10' : 'border-slate-200'}`}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-800 font-bold text-xs uppercase tracking-widest">Insurance Coverage Status</h3>
            </div>
            <button
              onClick={() => toggleFlag('insurance')}
              className={`p-2 rounded-full transition-colors ${flaggedItems.has('insurance') ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-slate-50'}`}
            >
              <Flag className={`w-3.5 h-3.5 ${flaggedItems.has('insurance') ? 'fill-red-500' : ''}`} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-700 text-sm font-bold">Earthquake coverage not reflected in last audit.</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Associations often opt out of earthquake insurance due to high costs. This increases the owner's potential responsibility if an earthquake occurs.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Bot className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-[11px] text-blue-700 leading-snug">
                  <span className="font-bold">Next Step:</span> Request the <span className="font-bold underline cursor-help">current</span> master policy proof of insurance to see if coverage has been updated.
                </p>
              </div>

              <button
                onClick={() => generateAiInsight('insurance', 'Insurance Detail', 'How does an insurance lapse affect your mortgage and safety?')}
                className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-purple-600 transition-colors uppercase tracking-widest pl-1"
              >
                <Sparkles className="w-3 h-3" /> {explainingIds.has('insurance') ? 'Thinking…' : 'Learn why this matters'}
              </button>
              {aiInsight.insurance && (
                <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 font-medium leading-relaxed italic border-l-2 border-purple-500">
                  {aiInsight.insurance}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* --- TRENDS & MAINTENANCE --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <h3 className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Historical Trends & Maintenance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3. Repair Savings (Reserve Fund) */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">HOA Savings Profile</h3>
                <button
                  onClick={() => toggleFlag('savings')}
                  className={`transition-colors ${flaggedItems.has('savings') ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                >
                  <Flag className={`w-4 h-4 ${flaggedItems.has('savings') ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-slate-800 font-bold text-2xl tracking-tight">76.3%</span>
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Target Met</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                <div style={{ backgroundColor: theme.warning }} className="w-[76.3%] h-full"></div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-slate-600 text-xs leading-relaxed">
                While the association has a moderate level of savings, the age of the document (2013) is the primary factor to discuss with your professional team.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Expert Tip</p>
                <p className="text-xs text-slate-600 leading-relaxed italic">"Ask for the 2024 operating budget to see how much they are setting aside for reserves today."</p>
              </div>
            </div>
          </section>

          {/* 5. Delayed Maintenance (Repairs Put Off) */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Planned Maintenance Items</h3>
              <TrendingDown className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-700">Exterior Repairs</span>
                <span className="text-xs font-bold text-slate-800">$27,610</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-700">Specific Unit Mold Audit</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">In Review</span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed italic opacity-70">
                Maintenance lists are common in HOAs. These items were identified in 2013 and should be checked for completion.
              </p>
            </div>
            <button
              disabled
              title="Coming soon"
              className="mt-4 w-full py-2 bg-slate-50 text-slate-300 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-slate-100 cursor-not-allowed"
            >
              See Historical Log
            </button>
          </section>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="pt-20 pb-10 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-[11px] italic max-w-2xl mx-auto leading-relaxed">
          <span className="font-bold underline block mb-2 text-slate-500 not-italic">Professional Review Recommended</span>
          This summary is designed to help you organize your questions for a real estate attorney, financial advisor, or qualified professional. Information is based on archived documents and may not reflect current conditions. Do not rely solely on this report for purchase decisions.
        </p>
      </div>
    </motion.div>
  );
};

export default FinancialTab;
