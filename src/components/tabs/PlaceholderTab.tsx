/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lock } from 'lucide-react';
import { Tab } from '../../domain';

interface PlaceholderTabProps {
  activeTab: Tab;
}

const PlaceholderTab = ({ activeTab }: PlaceholderTabProps) => {
  return (
    <div className="bg-white p-24 rounded-xl border border-slate-200 text-center flex flex-col items-center">
      <Lock className="w-12 h-12 text-slate-200 mb-4" />
      <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest">Detail View for {activeTab}</h3>
      <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">Forensic analysis is currently drilling down into this data.</p>
    </div>
  );
};

export default PlaceholderTab;
