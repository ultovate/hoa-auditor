/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, User, LogOut } from 'lucide-react';
import { useTheme } from '../theme';
import { Tab } from '../domain';
import { supabase } from '../services/supabase';

interface HeaderProps {
  setActiveTab: (tab: Tab) => void;
  currentUserEmail: string;
  onLogoClick?: () => void;
}

const Header = ({ setActiveTab, currentUserEmail, onLogoClick }: HeaderProps) => {
  const theme = useTheme();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Get first 2 letters of email for user initials avatar
  const getInitials = (emailStr: string) => {
    if (!emailStr) return 'US';
    const parts = emailStr.split('@')[0];
    return parts.substring(0, 2).toUpperCase();
  };

  return (
    <header style={{ backgroundColor: theme.darkHeader }} className="text-white px-8 py-3 flex justify-between items-center w-full sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 group cursor-pointer select-none" onClick={() => onLogoClick ? onLogoClick() : setActiveTab('Summary')}>
          <span className="font-bold text-lg tracking-tight text-white">HOA Auditor</span>
        </div>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search findings, clauses, or financials..."
            className="bg-white/10 border-none rounded-md py-1.5 pl-10 pr-4 text-sm w-80 focus:ring-1 focus:ring-accent outline-none text-white placeholder-slate-400 transition-all focus:bg-white/15"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div 
            tabIndex={0} 
            role="button" 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg cursor-pointer transition-all text-white/80 select-none"
          >
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">{currentUserEmail} ▾</span>
          </div>
          
          <ul 
            tabIndex={0} 
            className="dropdown-content menu p-2 shadow-2xl bg-slate-800 rounded-lg w-56 border border-white/10 mt-2 z-50 text-slate-200"
          >
            <li className="px-3 py-2 border-b border-white/5 pointer-events-none select-text">
              <span className="text-xs text-slate-400 block truncate max-w-[190px]">
                {currentUserEmail}
              </span>
            </li>
            <li className="mt-1">
              <button 
                onClick={handleSignOut}
                className="w-full text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 px-3 rounded-md transition-all flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
        
        {/* User Initials Avatar */}
        <div style={{ backgroundColor: theme.brand }} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer shadow-lg hover:brightness-110">
          <span className="text-white font-bold text-xs uppercase">{getInitials(currentUserEmail)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
