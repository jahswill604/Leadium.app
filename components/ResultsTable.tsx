import React, { useState } from 'react';
import { 
  ExternalLink, Mail, User, Globe, 
  ChevronDown, Building2, MapPin, MessageCircle, 
  Send, Sparkles, Facebook, Linkedin, Instagram, Twitter, 
  Lightbulb, Zap, Target, Layers, Phone, Youtube, Video, Link2,
  LayoutGrid, List, MoreHorizontal
} from 'lucide-react';
import { Lead } from '../types';

interface ResultsTableProps {
  leads: Lead[];
  onEnrich?: (leadId: string) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ leads, onEnrich }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('linkedin')) return <Linkedin className="w-3.5 h-3.5" />;
    if (p.includes('twitter') || p.includes('x.com') || p === 'x') return <Twitter className="w-3.5 h-3.5" />;
    if (p.includes('facebook')) return <Facebook className="w-3.5 h-3.5" />;
    if (p.includes('instagram')) return <Instagram className="w-3.5 h-3.5" />;
    if (p.includes('youtube')) return <Youtube className="w-3.5 h-3.5" />;
    if (p.includes('tiktok')) return <Video className="w-3.5 h-3.5" />;
    return <Link2 className="w-3.5 h-3.5" />;
  };

  const getSocialColor = (platform: string) => {
     const p = platform.toLowerCase();
     if (p.includes('linkedin')) return 'text-blue-700 border-blue-100 hover:bg-blue-50';
     if (p.includes('twitter') || p.includes('x.com')) return 'text-slate-900 border-slate-200 hover:bg-slate-50';
     if (p.includes('facebook')) return 'text-blue-600 border-blue-100 hover:bg-blue-50';
     if (p.includes('instagram')) return 'text-pink-600 border-pink-100 hover:bg-pink-50';
     if (p.includes('youtube')) return 'text-red-600 border-red-100 hover:bg-red-50';
     return 'text-slate-500 border-slate-200 hover:bg-slate-50';
  };

  const getSafeHostname = (url: string) => {
    if (!url) return 'No URL';
    try {
      // If protocol is missing, new URL() might fail or interpret as relative.
      // We assume external links here.
      const urlToParse = url.startsWith('http') ? url : `https://${url}`;
      return new URL(urlToParse).hostname.replace('www.', '');
    } catch (e) {
      return url; // Fallback to raw string if parsing fails
    }
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <User className="w-10 h-10 text-slate-300" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
          </div>
        </div>
        <h4 className="text-slate-900 font-bold text-lg mb-2">No Data Yet</h4>
        <p className="text-sm font-medium text-slate-500">Launch a campaign to start extracting leads.</p>
      </div>
    );
  }

  // Determine mode based on first lead (batch is homogenous)
  const isB2C = leads[0]?.leadType === 'b2c';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
         <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">View Mode:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
         </div>
         <div className="text-xs text-slate-400 font-medium">
            Showing {leads.length} results
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-6">
        
        {/* GRID VIEW */}
        {viewMode === 'grid' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leads.map((lead, index) => (
                <div 
                  key={lead.id}
                  onClick={() => toggleExpand(lead.id)}
                  className={`
                    group bg-white rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col h-full
                    ${lead.status === 'enriching' ? 'ring-2 ring-indigo-400 border-indigo-200' : 'border-slate-200 hover:border-brand-200'}
                  `}
                >
                   {/* Grid Header */}
                   <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${isB2C ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-brand-50 text-brand-600 border-brand-100'}`}>
                         {isB2C ? <MessageCircle className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 ${
                           lead.qualityScore > 75 
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                             : 'bg-amber-50 text-amber-700 border-amber-100'
                         }`}>
                           {lead.qualityScore}% Match
                         </span>
                         {lead.status === 'complete' && lead.enrichedData && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                         )}
                      </div>
                   </div>

                   {/* Grid Content */}
                   <div className="mb-4 flex-1">
                      <h4 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {lead.companyName}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-3">
                        {lead.summary}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {lead.country && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                             <MapPin className="w-3 h-3" /> {lead.country}
                          </span>
                        )}
                        {lead.decisionMakers.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                             <User className="w-3 h-3" /> {lead.decisionMakers.length} Found
                          </span>
                        )}
                      </div>
                   </div>

                   {/* Grid Footer */}
                   <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex -space-x-2">
                         {lead.decisionMakers.slice(0,3).map((dm, i) => (
                           <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500" title={dm.name}>
                              {dm.name.charAt(0)}
                           </div>
                         ))}
                      </div>
                      
                      {!lead.enrichedData ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEnrich?.(lead.id);
                          }}
                          disabled={lead.status === 'enriching'}
                          className={`
                            p-2 rounded-lg transition-all border
                            ${lead.status === 'enriching' 
                              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-wait' 
                              : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:shadow-md'
                            }
                          `}
                          title="Quick Enrich"
                        >
                           {lead.status === 'enriching' ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                      ) : (
                         <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                            <Zap className="w-4 h-4 fill-current" />
                         </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-3">
            {leads.map((lead, index) => {
                const isExpanded = expandedId === lead.id;
                
                return (
                  <div 
                    key={lead.id} 
                    className={`
                      bg-white rounded-xl border transition-all duration-300 relative
                      ${isExpanded 
                        ? 'border-brand-200 shadow-md ring-1 ring-brand-100 z-10' 
                        : 'border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5'
                      }
                    `}
                  >
                      {/* Summary Row (Clickable) */}
                      <div 
                        onClick={() => toggleExpand(lead.id)}
                        className="flex items-center justify-between p-5 cursor-pointer select-none"
                      >
                        {/* Basic Info to Identify */}
                        <div className="flex items-center gap-6">
                            <span className="text-slate-300 font-mono text-xs font-bold w-6">#{index + 1}</span>
                            <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm border ${isExpanded ? 'bg-brand-50 border-brand-100 text-brand-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                  {isB2C ? <MessageCircle className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                              </div>
                              <div className="max-w-[180px] md:max-w-md">
                                  <h4 className={`font-bold text-base transition-colors truncate ${isExpanded ? 'text-brand-700' : 'text-slate-900'}`}>
                                    {lead.companyName}
                                  </h4>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                                    {isB2C ? (
                                        <>
                                            <span className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                                              <User className="w-3 h-3" />
                                              {lead.decisionMakers[0]?.name || 'Anonymous User'}
                                            </span>
                                            <span className="truncate max-w-[150px] opacity-70">{lead.summary.substring(0, 40)}...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex items-center gap-1 hover:text-brand-600 transition-colors"><Globe className="w-3.5 h-3.5 text-slate-400" /> {getSafeHostname(lead.websiteUrl)}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.country}</span>
                                        </>
                                    )}
                                  </div>
                              </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 md:gap-10">
                            {/* Quality/Sentiment Score */}
                            <div className="flex flex-col items-end min-w-[100px]">
                              <span className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${lead.qualityScore > 75 ? 'text-emerald-600' : lead.qualityScore > 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                                {isB2C ? 'High Intent' : `${lead.qualityScore}% Match`}
                              </span>
                              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full ${lead.qualityScore > 75 ? 'bg-emerald-500' : lead.qualityScore > 50 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{width: `${lead.qualityScore}%`}}></div>
                              </div>
                            </div>
                            
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-brand-100 text-brand-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                              <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                      </div>

                      {/* Expanded Dropdown Content */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 px-5 py-6 sm:pl-[6.5rem] bg-slate-50/30 rounded-b-xl animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="space-y-6">
                              
                              {/* Action Bar */}
                              {!lead.enrichedData && (
                                <div className="flex justify-end mb-2">
                                  <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEnrich?.(lead.id);
                                    }}
                                    disabled={lead.status === 'enriching'}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border group transform hover:-translate-y-0.5
                                        ${lead.status === 'enriching' 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' 
                                            : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-200 shadow-indigo-100'
                                        }
                                    `}
                                  >
                                    {lead.status === 'enriching' ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin" />
                                            <span>Analyzing Business...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600" />
                                            <span>Enrich Data & Generate Pitch</span>
                                        </>
                                    )}
                                  </button>
                                </div>
                              )}

                              {isB2C ? (
                                // --- B2C EXPANDED VIEW ---
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200/60">
                                      <div>
                                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Discussion Platform</label>
                                          <div className="text-lg font-bold text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-lg inline-block shadow-sm">{lead.companyName}</div>
                                      </div>
                                      <div>
                                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Source Link</label>
                                          <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-2 font-bold text-sm w-fit bg-pink-50 px-3 py-2 rounded-lg border border-pink-100 transition-colors">
                                            View Original Post <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5 block">Post Context</label>
                                      <div className="text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-xl border border-slate-200 relative shadow-sm">
                                        <span className="absolute top-3 left-3 text-4xl text-slate-100 font-serif leading-none select-none">“</span>
                                        <p className="relative z-10 px-2 italic font-medium">{lead.summary}</p>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 block">Actionable Lead Contact</label>
                                      <div className="flex items-center gap-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                          <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold border border-pink-100">
                                              <User className="w-6 h-6" />
                                          </div>
                                          <div>
                                              <div className="font-bold text-slate-900 text-lg">{lead.decisionMakers[0]?.name || 'Anonymous'}</div>
                                              <div className="text-xs text-slate-500 mb-2 font-medium">
                                                  Posted: <span className="text-slate-700">{lead.size || 'Recently'}</span>
                                              </div>
                                              {lead.decisionMakers[0]?.email && (
                                                <a href={lead.decisionMakers[0].email} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg">
                                                    <Send className="w-3 h-3" />
                                                    Inbox / Message User
                                                </a>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                </>
                              ) : (
                                // --- B2B EXPANDED VIEW ---
                                <>
                                  {/* Basic Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-slate-200/60">
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Company Name</label>
                                        <div className="text-lg font-bold text-slate-900">{lead.companyName}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Website</label>
                                        <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-2 font-bold text-base w-fit">
                                          {lead.websiteUrl} <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                  </div>

                                  {/* Deep Enrichment Data (If Available) */}
                                  {lead.enrichedData && (
                                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-8">
                                        
                                        {/* Insights Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 shadow-sm">
                                              <div className="flex items-center gap-2 mb-4 text-amber-800 font-extrabold text-xs uppercase tracking-wide">
                                                  <Lightbulb className="w-4 h-4" /> Key Insights
                                              </div>
                                              <ul className="list-disc list-outside ml-4 space-y-2">
                                                  {lead.enrichedData.keyInsights.map((insight, i) => (
                                                      <li key={i} className="text-xs text-slate-700 font-medium leading-relaxed">{insight}</li>
                                                  ))}
                                              </ul>
                                          </div>
                                          
                                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center gap-2 mb-4 text-slate-600 font-extrabold text-xs uppercase tracking-wide">
                                                  <Layers className="w-4 h-4" /> Products & Tech
                                              </div>
                                              <div className="space-y-4">
                                                  <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Offerings</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {lead.enrichedData.productsServices.slice(0,5).map((p, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] text-slate-600 font-semibold">{p}</span>
                                                        ))}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Tech Stack</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {lead.enrichedData.technologies.slice(0,5).map((t, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-slate-100 rounded-md text-[10px] text-slate-700 font-semibold border border-transparent">{t}</span>
                                                        ))}
                                                    </div>
                                                  </div>
                                              </div>
                                          </div>
                                        </div>

                                        {/* Strategic Fit */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Competitive Advantage</label>
                                              <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 font-medium">
                                                  {lead.enrichedData.competitiveAdvantage}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Target Market</label>
                                              <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 font-medium">
                                                  {lead.enrichedData.targetMarket}
                                              </p>
                                            </div>
                                        </div>

                                        {/* Sales Intelligence - PITCH & EMAIL */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-500/5 relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Zap className="w-32 h-32 text-indigo-600" />
                                            </div>
                                            
                                            <div className="relative z-10">
                                                <h5 className="font-extrabold text-indigo-900 text-sm flex items-center gap-2 mb-6 uppercase tracking-wide">
                                                    <Target className="w-4 h-4 text-indigo-600" /> AI Sales Intelligence
                                                </h5>

                                                <div className="space-y-6">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Pitch Strategy</span>
                                                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                                            {lead.enrichedData.pitchStrategy}
                                                        </p>
                                                    </div>

                                                    <div className="pt-6 border-t border-indigo-100/50">
                                                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-3">Personalized Outreach Draft</span>
                                                          <div className="bg-white p-5 rounded-xl border border-indigo-100 text-sm text-slate-600 font-mono whitespace-pre-wrap shadow-sm">
                                                            {lead.enrichedData.outreachEmail}
                                                          </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                  )}

                                  {/* Contact Info (Always Visible) */}
                                  <div>
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 block">Decision Makers & Contacts</label>
                                    
                                    {/* Enriched Socials in Contact List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                                              <Mail className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">General Email</div>
                                                <div className="text-sm text-slate-900 font-bold select-all truncate">{lead.generalEmail || 'Not Found'}</div>
                                                
                                                {/* Social Icons Inline */}
                                                {lead.enrichedData?.socialLinks && (
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        {Object.entries(lead.enrichedData.socialLinks).map(([platform, url]) => (
                                                            <a 
                                                              key={platform} 
                                                              href={url} 
                                                              target="_blank" 
                                                              rel="noreferrer" 
                                                              title={platform}
                                                              className={`transition-colors bg-white p-1 rounded shadow-sm border ${getSocialColor(platform)}`}
                                                            >
                                                               {getSocialIcon(platform)}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {lead.phoneNumber && (
                                          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                                                <Phone className="w-5 h-5" />
                                              </div>
                                              <div className="flex-1 overflow-hidden">
                                                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phone</div>
                                                  <div className="text-sm text-slate-900 font-bold select-all truncate">{lead.phoneNumber}</div>
                                              </div>
                                          </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {lead.decisionMakers.map((dm, i) => (
                                          <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all group">
                                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shadow-inner group-hover:from-brand-50 group-hover:to-brand-100 group-hover:text-brand-600 transition-colors border-2 border-white">
                                                {dm.name ? dm.name.substring(0,2).toUpperCase() : '??'}
                                              </div>
                                              <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="font-bold text-slate-900 truncate">{dm.name}</div>
                                                <div className="text-xs text-brand-600 font-bold mb-2 uppercase tracking-tight">{dm.title}</div>
                                                {dm.email ? (
                                                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 group-hover:bg-brand-50/50 group-hover:border-brand-100/50 transition-colors">
                                                      <Mail className="w-3 h-3 text-slate-400" />
                                                      <span className="select-all truncate font-medium">{dm.email}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic font-medium">Email not verified</div>
                                                )}
                                              </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </>
                              )}

                            </div>
                        </div>
                      )}
                  </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;