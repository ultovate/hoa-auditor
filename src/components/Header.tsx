/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, User } from 'lucide-react';
import { useTheme } from '../theme';
import { Tab } from '../domain';

interface HeaderProps {
  setActiveTab: (tab: Tab) => void;
  currentUserEmail: string;
}

const Header = ({ setActiveTab, currentUserEmail }: HeaderProps) => {
  const theme = useTheme();

  return (
    <header style={{ backgroundColor: theme.darkHeader }} className="text-white px-8 py-3 flex justify-between items-center w-full sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('Summary')}>
          <div style={{ backgroundColor: theme.brand }} className="w-7 h-7 rounded flex items-center justify-center font-bold text-sm text-white transition-transform group-hover:scale-110">U</div>
          <span className="font-bold text-lg tracking-tight">Ultovate</span>
        </div>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search findings, clauses, or financials..."
            className="bg-white/10 border-none rounded-md py-1.5 pl-10 pr-4 text-sm w-80 focus:ring-1 focus:ring-purple-400 outline-none text-white placeholder-slate-400 transition-all focus:bg-white/15"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors text-white/80">
          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">{currentUserEmail} ▾</span>
        </div>
        <div style={{ backgroundColor: theme.brand }} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer shadow-lg hover:brightness-110">
          <span className="text-white font-bold text-xs uppercase">LC</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
