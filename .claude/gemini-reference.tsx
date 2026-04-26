/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  AlertCircle, 
  Search, 
  User, 
  CheckCircle2,
  Users,
  LayoutDashboard,
  FileSearch,
  DollarSign,
  Heart,
  Mail,
  ChevronRight,
  FileText,
  Clock,
  ExternalLink,
  Lock,
  ArrowUpRight,
  Send,
  Loader2,
  Sparkles,
  X,
  Bot,
  BrainCircuit,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Welcome to Ultovate. I've finished scanning the 6 uploaded documents for the Bellevue property. There are a few critical liability risks regarding the reserve study and pet restrictions. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<Record<string, string>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // GEMINI API CONFIG
  const apiKey = process.env.GEMINI_API_KEY;
  
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [chatMessages, isTyping]);

  const callGemini = async (prompt: string, systemInstruction = "You are a forensic HOA document auditor.") => {
    let retries = 0;
    const maxRetries = 3;
    
    const attempt = async (): Promise<string> => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ 
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }] 
            }]
          })
        });
        
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      } catch (err) {
        if (retries < maxRetries) {
          retries++;
          const delay = Math.pow(2, retries) * 500;
          await new Promise(r => setTimeout(r, delay));
          return attempt();
        }
        throw err;
      }
    };
    return attempt();
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const text = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    try {
      const response = await callGemini(
        `User Question: ${text}\n\nProperty Context: 10398 NE 17th St., #302, Bellevue WA. Findings: 12-year-old reserve study (Major Risk), 40lb dog limit, STRs prohibited. WUCIOA Score: 9/26.`,
        "You are an expert real estate forensic auditor. Be direct, professional, and highlight financial or legal liability for the buyer."
      );
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "My analysis engine is currently busy. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAiInsight = async (id: string, title: string, context: string) => {
    setExplainingId(id);
    try {
      const response = await callGemini(
        `Explain the risk of "${title}": ${context}. How does this impact a buyer's resale value or daily life? What is the specific 'forensic' red flag here?`,
        "Provide a high-impact, professional analysis using 2-3 concise bullet points. Focus on risk mitigation."
      );
      setAiInsight(prev => ({ ...prev, [id]: response }));
    } catch (err) {
      setAiInsight(prev => ({ ...prev, [id]: "Unable to generate insight at this time." }));
    } finally {
      setExplainingId(null);
    }
  };

  // THEME COLORS (Ultovate Original)
  const theme = {
    brand: '#9333EA',       
    darkHeader: '#1F1224',  
    heroBg: '#2D1B33',      
    pageBg: '#F8F9FB',      
    textMain: '#1E293B',    
    textMuted: '#64748B',   
    success: '#10B981',     
    danger: '#EF4444',      
    warning: '#F59E0B',     
    border: '#E2E8F0'
  };

  const tabs = ['Summary', 'Financial', 'Risks', 'Restrictions', 'Timeline', 'Compliance', 'Documents'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Summary':
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
                <button style={{ color: theme.brand }} className="text-xs font-bold hover:underline">VIEW ALL FINDINGS →</button>
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
                      {explainingId === 'reserve-study' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
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
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-white/20">
                    ✨ Generate Email to Agent
                  </button>
                  <button style={{ backgroundColor: theme.brand }} className="text-white px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95">
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
      case 'Documents':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {[
              { name: 'Reserve Study', type: 'PDF', size: '2.4MB', date: 'May 2011', risk: 'Critical' },
              { name: 'CC&R Declaration', type: 'PDF', size: '15.1MB', date: 'Jan 2008', risk: 'Stable' },
              { name: 'Bylaws', type: 'PDF', size: '4.2MB', date: 'Jan 2008', risk: 'Review' },
              { name: 'House Rules', type: 'PDF', size: '1.1MB', date: 'Dec 2024', risk: 'Stable' },
            ].map((doc, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between hover:border-purple-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm">{doc.name}</h4>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{doc.type} • {doc.size} • {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-1">
                    ✨ Summarize
                  </button>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="bg-white p-24 rounded-xl border border-slate-200 text-center flex flex-col items-center">
            <Lock className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest">Detail View for {activeTab}</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">Forensic analysis is currently drilling down into this data.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ backgroundColor: theme.pageBg }} className="min-h-screen font-sans antialiased text-slate-900 pb-20">
      
      {/* 1. TOP NAVBAR */}
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
            <span className="text-sm font-medium hidden sm:inline">lay.clough@gmail.com ▾</span>
          </div>
          <div style={{ backgroundColor: theme.brand }} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer shadow-lg hover:brightness-110">
            <span className="text-white font-bold text-xs uppercase">LC</span>
          </div>
        </div>
      </header>

      {/* 2. PROPERTY HERO SECTION */}
      <section style={{ backgroundColor: theme.heroBg }} className="text-white px-8 pt-8 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="animate-in slide-in-from-left duration-500">
            <span className="text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-1 block">Chiavari Owners Association</span>
            <h1 className="text-3xl font-bold tracking-tight">10398 NE 17th St., #302, Bellevue WA 98004</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Analysis Date: April 26, 2026 • 6 documents analyzed
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-xl text-right animate-in slide-in-from-right duration-500">
            <span className="text-emerald-400 text-[10px] font-bold uppercase block tracking-widest mb-1">Risk Index</span>
            <span className="text-emerald-400 text-3xl font-bold">9 <span className="text-sm text-slate-500">/ 26</span></span>
          </div>
        </div>

        {/* 3. TAB NAVIGATION */}
        <div className="bg-white rounded-t-xl overflow-hidden border-x border-t border-slate-200 shadow-sm">
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
      </section>

      {/* 4. MAIN CONTENT AREA */}
      <main className="w-full px-8 py-8">
        {renderTabContent()}
      </main>

      {/* ✨ AI CHAT PANEL */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-[400px] h-[600px] bg-white rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-slate-200 flex flex-col overflow-hidden z-[100]"
          >
            <div style={{ backgroundColor: theme.darkHeader }} className="p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Forensic Assistant</h3>
                  <p className="text-[9px] text-purple-300 font-bold uppercase tracking-widest">Active Audit Mode</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 rounded-bl-none flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about pet rules, financials..." 
                  className="w-full bg-slate-100 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{ backgroundColor: theme.brand }} 
        className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-[100] group"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-purple-600 animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
