/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Header from './components/Header';
import SummaryTab from './components/tabs/SummaryTab';
import FinancialTab from './components/tabs/FinancialTab';
import PropertyHero from './components/PropertyHero';
import TabNavigation from './components/TabNavigation';
import SidebarChat from './components/SidebarChat';
import DocumentsTab from './components/tabs/DocumentsTab';
import PlaceholderTab from './components/tabs/PlaceholderTab';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeContext, theme } from './theme';
import { TABS, Tab, FindingId, CURRENT_USER_EMAIL } from './domain';
import { useForensicChat } from './hooks/useForensicChat';
import { useAiInsight } from './hooks/useAiInsight';
import Auth from './components/Auth';
import PropertiesReview from './components/PropertiesReview';

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Summary');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [flaggedItems, setFlaggedItems] = useState<Set<FindingId>>(new Set());

  const chat = useForensicChat();
  const { aiInsight, explainingIds, generateAiInsight } = useAiInsight();

  const toggleFlag = (id: FindingId) => {
    setFlaggedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Summary':
        return (
          <SummaryTab
            setActiveTab={setActiveTab}
            generateAiInsight={generateAiInsight}
            explainingIds={explainingIds}
            aiInsight={aiInsight}
          />
        );
      case 'Financial':
        return (
          <FinancialTab
            flaggedItems={flaggedItems}
            toggleFlag={toggleFlag}
            generateAiInsight={generateAiInsight}
            explainingIds={explainingIds}
            aiInsight={aiInsight}
          />
        );
      case 'Documents':
        return <DocumentsTab />;
      default:
        return <PlaceholderTab activeTab={activeTab} />;
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ backgroundColor: theme.pageBg }} className="min-h-screen font-sans antialiased text-slate-900 pb-20 flex flex-col">
        {/* 1. TOP NAVBAR */}
        {session && (
          <Header 
            setActiveTab={setActiveTab} 
            currentUserEmail={session?.user?.email || CURRENT_USER_EMAIL} 
            onLogoClick={() => setActiveAuditId(null)}
          />
        )}

        {!session ? (
          <Auth onAuthSuccess={(newSession) => setSession(newSession)} />
        ) : !activeAuditId ? (
          <PropertiesReview
            userId={session.user.id}
            userEmail={session.user.email || CURRENT_USER_EMAIL}
            onSelectProperty={(auditId) => setActiveAuditId(auditId)}
            onSignOut={() => supabase.auth.signOut()}
          />
        ) : (
          <>
            {/* 2. PROPERTY HERO SECTION */}
            <section style={{ backgroundColor: theme.heroBg }} className="text-white px-8 pt-8 pb-0">
              <PropertyHero />

              {/* 3. TAB NAVIGATION */}
              <TabNavigation tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </section>

            {/* 4. MAIN CONTENT AREA */}
            <main className="w-full px-8 py-8 flex-1">
              <div className="max-w-7xl mx-auto">
                <ErrorBoundary>{renderTabContent()}</ErrorBoundary>
              </div>
            </main>

            {/* AI CHAT PANEL & Floating Action Button */}
            <SidebarChat isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} {...chat} />
          </>
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
