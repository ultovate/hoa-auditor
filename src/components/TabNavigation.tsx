/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useTheme } from '../theme';
import { Tab } from '../domain';

interface TabNavigationProps {
  tabs: readonly Tab[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabNavigation = ({ tabs, activeTab, setActiveTab }: TabNavigationProps) => {
  const theme = useTheme();

  return (
    <div className="bg-white rounded-t-xl overflow-hidden border-x border-t border-slate-200 shadow-sm max-w-7xl mx-auto">
      <div className="flex gap-0 overflow-x-auto px-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-sm font-bold transition-all relative whitespace-nowrap min-w-[120px] cursor-pointer ${
              activeTab === tab ? 'bg-slate-50' : 'bg-white hover:bg-slate-50 hover:text-purple-600'
            }`}
            style={{ color: activeTab === tab ? theme.brand : theme.textMuted }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                style={{ backgroundColor: theme.brand }}
                className="absolute bottom-0 left-0 right-0 h-[3px]"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
