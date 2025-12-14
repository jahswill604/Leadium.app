import React, { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle2, AlertCircle, Database, Server, 
  RotateCcw, Download, Clock, BarChart3, 
  LayoutDashboard, ScrollText, Activity, ChevronRight, PlusCircle, Settings2,
  MessageSquare, Menu, X, LogOut, Star, ThumbsUp, Bell, Search, Sparkles, StopCircle, PlayCircle
} from 'lucide-react';
import { Lead, LogEntry, SearchParams, User } from '../types';
import { exportToCSV } from '../utils/exportUtils';
import ResultsTable from './ResultsTable';
import LeadForm from './LeadForm';
import ChatView from './ChatView';

// Inline Logo
const LeadiumLogoSmall = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 20 V75 H80" stroke="#D4AF37" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M55 45 L80 20 M80 20 L68 20 M80 20 L68 20 M80 20 L80 32" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="25" cy="20" r="6" fill="#D4AF37" />
  </svg>
);

interface ProcessingViewProps {
  user: User;
  leads: Lead[];
  logs: LogEntry[];
  totalTarget: number;
  isComplete: boolean;
  isLoading: boolean;
  scannedCount: number; // New prop for real data
  onSearch: (params: SearchParams) => void;
  onReset: () => void;
  onEnrich?: (leadId: string) => void;
  onFeedback?: (rating: number) => void;
  onCancel?: () => void;
  error?: string;
  onLogout?: () => void;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ 
  user,
  leads, 
  logs, 
  totalTarget, 
  isComplete,
  isLoading,
  scannedCount, // Received from parent
  onSearch,
  onReset,
  onEnrich,
  onFeedback,
  onCancel,
  error,
  onLogout
}) => {
  const [activeView, setActiveView] = useState<'config' | 'overview' | 'data' | 'logs' | 'chat'>('config');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Feedback State
  const [rating, setRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current && activeView === 'logs') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeView]);

  // Switch to overview on start
  useEffect(() => {
    if (isLoading && activeView === 'config') {
      setActiveView('overview');
      setRating(0);
      setFeedbackSubmitted(false);
    }
  }, [isLoading]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeView]);

  const handleRate = (r: number) => {
    setRating(r);
    setFeedbackSubmitted(true);
    if (onFeedback) onFeedback(r);
  };

  const progress = totalTarget > 0 ? Math.min(100, Math.round((leads.length / totalTarget) * 100)) : 0;
  const emailsFound = leads.filter(l => l.decisionMakers.some(dm => dm.email) || l.generalEmail).length;
  const successRate = leads.length > 0 ? Math.round((emailsFound / leads.length) * 100) : 0;

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative font-sans text-slate-900">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-brand-950 flex flex-col shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-out text-slate-300 border-r border-brand-900
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
         {/* Sidebar Header */}
         <div className="h-20 px-6 flex items-center justify-between border-b border-brand-900/50 bg-brand-950/50">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-lg shadow-black/20 border border-white/5 ring-1 ring-white/5">
                  <LeadiumLogoSmall className="w-5 h-5" />
               </div>
               <div>
                  <div className="font-bold text-white text-base tracking-tight leading-none">Leadium<span className="text-gold-500">.app</span></div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1 tracking-wide uppercase">Enterprise AI</div>
               </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
         </div>

         {/* Nav Links */}
         <nav className="flex-1 px-3 space-y-8 overflow-y-auto custom-scrollbar py-8">
            <div className="space-y-1">
              <NavItem 
                 active={activeView === 'config'} 
                 onClick={() => setActiveView('config')} 
                 icon={<PlusCircle className="w-5 h-5" />} 
                 label="New Discovery" 
                 highlight
              />
            </div>

            <div className="space-y-1">
              <div className="px-4 mb-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                Campaign Monitor
              </div>
              <NavItem 
                 active={activeView === 'overview'} 
                 onClick={() => setActiveView('overview')} 
                 icon={<LayoutDashboard className="w-5 h-5" />} 
                 label="Overview" 
              />
              <NavItem 
                 active={activeView === 'data'} 
                 onClick={() => setActiveView('data')} 
                 icon={<Database className="w-5 h-5" />} 
                 label="Data Warehouse" 
                 badge={leads.length}
              />
              <NavItem 
                 active={activeView === 'logs'} 
                 onClick={() => setActiveView('logs')} 
                 icon={<ScrollText className="w-5 h-5" />} 
                 label="Pipeline Logs" 
              />
            </div>

            <div className="space-y-1">
              <div className="px-4 mb-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                Agents
              </div>
              <NavItem 
                 active={activeView === 'chat'} 
                 onClick={() => {}} 
                 icon={<MessageSquare className="w-5 h-5" />} 
                 label="Agent Swarm" 
                 comingSoon
              />
            </div>
         </nav>

         {/* Sidebar Footer */}
         <div className="p-4 border-t border-brand-900 bg-brand-950/50">
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 mb-4 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5 group"
              >
                <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center text-xs font-bold text-gold-500 border border-brand-800 group-hover:border-gold-500/50 transition-colors">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="truncate text-slate-200">{user.name}</div>
                  <div className="text-[10px] text-slate-600">Sign Out</div>
                </div>
                <LogOut className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <div className="bg-brand-900/30 rounded-xl border border-brand-800 p-4 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 relative z-10">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      System Status
                   </span>
                   {isLoading ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gold-400">
                         <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" /> Processing
                      </span>
                   ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                      </span>
                   )}
                </div>
                
                {/* Mini Progress */}
                <div className="h-1.5 w-full bg-brand-950 rounded-full overflow-hidden mb-2 relative z-10">
                   <div 
                      className={`h-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : error ? 'bg-red-500' : 'bg-gold-500'}`} 
                      style={{width: `${Math.max(5, progress)}%`}} 
                   />
                </div>
                
                {/* Stop Button in Sidebar (Persistent) */}
                {isLoading && onCancel && (
                    <button 
                        onClick={onCancel}
                        className="mt-3 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 group animate-in fade-in slide-in-from-bottom-1"
                    >
                        <StopCircle className="w-3.5 h-3.5 group-hover:text-red-300" />
                        Stop Agents
                    </button>
                )}
            </div>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col w-full overflow-hidden bg-slate-50 relative">
         {/* Top Header */}
         <header className="h-20 px-6 md:px-8 flex items-center justify-between shrink-0 z-20 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all">
            <div className="flex items-center gap-4">
               {/* Mobile Hamburger */}
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors"
               >
                 <Menu className="w-6 h-6" />
               </button>

               <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span>Workspace</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-900 font-semibold">{user.companyName || 'My Team'}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {activeView === 'config' && 'New Discovery Campaign'}
                    {activeView === 'overview' && 'Campaign Overview'}
                    {activeView === 'data' && 'Live Data Warehouse'}
                    {activeView === 'logs' && 'System Activity Logs'}
                    {activeView === 'chat' && 'AI Agent Collaboration'}
                  </h2>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {/* Quick Action Buttons */}
               <div className="flex items-center gap-3">
                   
                   {isComplete && (
                     <>
                       <button 
                         onClick={onReset}
                         className="px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm font-bold flex items-center gap-2 text-xs transition-all"
                       >
                         <RotateCcw className="w-3.5 h-3.5" />
                         <span className="hidden md:inline">Reset</span>
                       </button>
                       <button 
                         onClick={() => exportToCSV(leads)}
                         className="px-4 py-2 text-white bg-brand-600 hover:bg-brand-700 border border-transparent rounded-lg shadow-md shadow-brand-600/20 font-bold flex items-center gap-2 text-xs transition-all transform active:scale-95"
                       >
                         <Download className="w-3.5 h-3.5" />
                         <span className="hidden md:inline">Export CSV</span>
                       </button>
                     </>
                   )}

                   {!isLoading && !isComplete && activeView !== 'config' && (
                     <button 
                       onClick={() => setActiveView('config')}
                       className="px-4 py-2 text-white bg-gold-500 hover:bg-gold-600 border border-transparent rounded-lg shadow-md shadow-gold-500/20 font-bold flex items-center gap-2 text-xs transition-all"
                     >
                       <PlusCircle className="w-3.5 h-3.5" />
                       New Campaign
                     </button>
                   )}
               </div>

               <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
               
               <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                 <Bell className="w-5 h-5" />
                 {isComplete && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
               </button>
            </div>
         </header>

         {/* Content Viewport */}
         <div className="flex-1 overflow-hidden relative">
            
            {/* ERROR OVERLAY */}
            {error && (
               <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                 <div className="bg-white border border-red-100 shadow-2xl rounded-2xl p-8 max-w-md text-center ring-1 ring-slate-200">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Pipeline Interrupted</h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">{error}</p>
                    <button onClick={onReset} className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-bold shadow-lg shadow-red-500/30 transition-all">
                      Reset System
                    </button>
                 </div>
               </div>
            )}
            
            <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-8 scroll-smooth">
                {activeView === 'config' && (
                  <div className="max-w-5xl mx-auto py-4">
                      <LeadForm onSubmit={onSearch} isLoading={isLoading} />
                  </div>
                )}

                {activeView === 'chat' && (
                  <div className="h-[calc(100vh-140px)] max-w-6xl mx-auto flex flex-col">
                      <ChatView />
                  </div>
                )}

                {activeView === 'overview' && (
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">
                        {/* Welcome Banner */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                           <div>
                              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good afternoon, {user.name.split(' ')[0]}.</h1>
                              <p className="text-slate-500 font-medium mt-1">Here's what's happening with your lead generation pipeline.</p>
                           </div>
                           <div className="text-right hidden md:block">
                              <div className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                              <div className="text-xs text-slate-500 font-medium">System Version v2.4.0</div>
                           </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <StatCard 
                              label="Total Leads Found" 
                              value={leads.length.toString()} 
                              subValue={`Target: ${totalTarget}`}
                              icon={<Database className="w-5 h-5" />}
                              trend={leads.length > 0 ? 12 : 0}
                              color="brand"
                            />
                            <StatCard 
                              label="Data Enrichment" 
                              value={`${successRate}%`} 
                              subValue="Contact Info Verified"
                              icon={<BarChart3 className="w-5 h-5" />}
                              trend={5}
                              color="emerald"
                            />
                            <StatCard 
                              label="Sources Scanned" 
                              value={scannedCount.toLocaleString()} 
                              subValue="Real-time Grounding"
                              icon={<Server className="w-5 h-5" />}
                              color="amber"
                            />
                            <StatCard 
                              label="Est. Time Remaining" 
                              value={isComplete ? '0s' : isLoading ? `${Math.max(0, (totalTarget - leads.length) * 1.5).toFixed(0)}s` : '--'}
                              subValue="Gemini 3.0 Processing"
                              icon={<Clock className="w-5 h-5" />}
                              color="slate"
                            />
                        </div>

                        {/* Main Bento Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left Col: Progress & Activity */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Progress Card */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                  <div className="flex justify-between items-center mb-6 relative z-10">
                                      <div>
                                        <h4 className="font-bold text-slate-900 text-lg">Extraction Velocity</h4>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">Real-time scraping status</p>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                         {/* Central Stop Button inside the active card */}
                                         {isLoading && onCancel && (
                                            <button 
                                                onClick={onCancel}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors animate-in fade-in"
                                            >
                                                <StopCircle className="w-3.5 h-3.5" /> Stop
                                            </button>
                                         )}
                                         <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border transition-colors ${isComplete ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                                            {isComplete ? 'Completed' : `${Math.round(progress)}% Processed`}
                                         </span>
                                      </div>
                                  </div>
                                  
                                  <div className="relative z-10">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                      <span>0</span>
                                      <span>{totalTarget} Leads</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-700 ease-out relative ${isComplete ? 'bg-emerald-500' : 'bg-brand-600'}`} 
                                          style={{ width: `${progress}%` }}
                                        >
                                          {isLoading && !isComplete && (
                                              <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '50% 100%', backgroundRepeat: 'no-repeat' }}></div>
                                          )}
                                        </div>
                                    </div>
                                  </div>

                                  {/* Decor */}
                                  <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-slate-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700 opacity-50"></div>
                                </div>

                                {/* Log Terminal */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        <h4 className="font-bold text-slate-900 text-sm">System Events</h4>
                                      </div>
                                      <button onClick={() => setActiveView('logs')} className="text-xs text-brand-600 font-bold hover:text-brand-700 hover:underline">View Full Log</button>
                                    </div>
                                    <div className="p-0 flex-1 bg-slate-50/30 overflow-hidden relative group">
                                      <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 space-y-2 font-mono text-xs">
                                        {logs.slice(-12).reverse().map((log) => (
                                            <div key={log.id} className="flex gap-3 items-start p-1.5 rounded hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                                              <span className="text-slate-400 font-medium min-w-[60px] select-none text-[10px] pt-0.5">{log.timestamp.toLocaleTimeString().split(' ')[0]}</span>
                                              <span className={`font-medium leading-relaxed ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                {log.message}
                                              </span>
                                            </div>
                                        ))}
                                        {logs.length === 0 && <div className="text-slate-400 italic p-10 text-center">System initialized. Waiting for input...</div>}
                                      </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Col: Feedback & AI Upsell */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Feedback Widget */}
                                {leads.length > 0 && (
                                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-right-4 duration-500">
                                    {!feedbackSubmitted ? (
                                      <>
                                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-500 shadow-sm border border-amber-100">
                                           <Star className="w-6 h-6 fill-current" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-2">Rate Quality</h4>
                                        <p className="text-sm text-slate-500 mb-6 px-4 leading-relaxed">How relevant were the companies found in this batch?</p>
                                        <div className="flex items-center justify-center gap-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              onClick={() => handleRate(star)}
                                              onMouseEnter={() => setRating(star)}
                                              onMouseLeave={() => setRating(0)}
                                              className="p-1 transition-all hover:scale-110 focus:outline-none"
                                            >
                                              <Star 
                                                className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-50'}`} 
                                              />
                                            </button>
                                          ))}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center animate-in zoom-in duration-300 py-4">
                                         <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500 shadow-sm border border-green-100">
                                           <ThumbsUp className="w-7 h-7 fill-current" />
                                         </div>
                                         <h4 className="font-bold text-slate-900 text-lg mb-1">Feedback Sent</h4>
                                         <p className="text-sm text-slate-500">Agents updated.</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* AI Context Card */}
                                <div className="bg-brand-900 rounded-2xl border border-brand-800 p-6 text-white relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                      <Sparkles className="w-24 h-24" />
                                   </div>
                                   <div className="relative z-10">
                                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 border border-white/10">
                                        <MessageSquare className="w-5 h-5 text-gold-400" />
                                      </div>
                                      <h4 className="font-bold text-lg mb-2">Refine Strategy?</h4>
                                      <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                        Talk to the AI Agent Swarm to adjust parameters or pivot your search strategy in real-time.
                                      </p>
                                      <button 
                                        disabled
                                        className="w-full py-3 bg-white/10 text-slate-400 font-bold rounded-xl border border-white/5 cursor-not-allowed"
                                      >
                                        Coming Soon
                                      </button>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'data' && (
                    <div className="min-h-[600px] bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2">
                      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                            <Database className="w-4 h-4 text-slate-400" /> Lead Repository
                          </h3>
                          <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{leads.length} records</span>
                          </div>
                      </div>
                      <ResultsTable leads={leads} onEnrich={onEnrich} />
                    </div>
                )}
                
                {activeView === 'logs' && (
                    <div className="h-full bg-brand-950 rounded-2xl border border-brand-900 shadow-2xl overflow-hidden flex flex-col max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                      <div className="px-6 py-3 border-b border-brand-900 bg-brand-950 flex justify-between items-center shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                          </div>
                          <span className="text-xs font-mono text-slate-500 font-bold">term://genkit-pipeline-logs</span>
                      </div>
                      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-xs custom-scrollbar">
                        {logs.map((log) => (
                          <div key={log.id} className="flex gap-4 items-start hover:bg-white/5 p-1 rounded px-2 transition-colors border-l-2 border-transparent hover:border-slate-700">
                            <span className="text-slate-500 min-w-[85px] select-none font-medium">
                              {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}.{log.timestamp.getMilliseconds().toString().padStart(3, '0')}
                            </span>
                            <span className={`break-all ${
                                log.type === 'info' ? 'text-slate-300' :
                                log.type === 'success' ? 'text-emerald-400 font-bold' :
                                log.type === 'warning' ? 'text-gold-400 font-bold' :
                                'text-red-400 font-bold bg-red-900/10 px-1 rounded'
                            }`}>
                              {log.type === 'success' && '✓ '}
                              {log.type === 'error' && '✗ '}
                              {log.message}
                            </span>
                          </div>
                        ))}
                        {logs.length === 0 && (
                          <div className="text-slate-600 italic text-center mt-10">Waiting for pipeline to start...</div>
                        )}
                      </div>
                    </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

// Refined Nav Item
const NavItem = ({ active, onClick, icon, label, badge, highlight, comingSoon }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number, highlight?: boolean, comingSoon?: boolean }) => (
  <button
    onClick={comingSoon ? undefined : onClick}
    disabled={comingSoon}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
      comingSoon
        ? 'opacity-50 cursor-not-allowed' 
        : active 
           ? highlight 
              ? 'bg-gold-500 text-brand-950 shadow-lg shadow-gold-500/20'
              : 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
           : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3.5">
      <span className={`transition-colors ${
        active 
          ? highlight ? 'text-brand-950' : 'text-gold-400'
          : highlight ? 'text-gold-500 group-hover:text-gold-400' : 'text-slate-500 group-hover:text-slate-300'
      }`}>
        {icon}
      </span>
      {label}
    </div>
    {comingSoon && (
       <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] uppercase tracking-wide rounded font-extrabold border border-slate-700">Soon</span>
    )}
    {badge !== undefined && badge > 0 && !comingSoon && (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
        active 
           ? highlight ? 'bg-brand-900 text-gold-500' : 'bg-gold-500 text-brand-900'
           : highlight ? 'bg-brand-950 text-slate-300' : 'bg-brand-900 text-slate-400 group-hover:text-white'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

// Refined Stat Card
const StatCard = ({ label, value, subValue, icon, trend, color }: any) => {
  const styles = {
    brand: { iconBg: 'bg-brand-50', iconText: 'text-brand-600' },
    emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
    slate: { iconBg: 'bg-slate-50', iconText: 'text-slate-600' }
  };
  // @ts-ignore
  const s = styles[color] || styles.slate;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors duration-300 ${s.iconBg} ${s.iconText} group-hover:scale-110`}>
          {icon}
        </div>
        {trend !== undefined && trend > 0 && (
           <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +{trend}%
           </span>
        )}
      </div>
      <div className="space-y-1">
        <h4 className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">{label}</h4>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        <p className="text-xs text-slate-400 font-medium">{subValue}</p>
      </div>
    </div>
  );
};

export default ProcessingView;