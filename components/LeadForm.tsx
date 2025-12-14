import React, { useState } from 'react';
import { Globe, Users, Briefcase, Filter, UserCheck, ArrowRight, Sparkles, Search, Languages, Building2, MessageCircle, ShoppingBag } from 'lucide-react';
import { SearchParams } from '../types';

interface LeadFormProps {
  onSubmit: (params: SearchParams) => void;
  isLoading: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, isLoading }) => {
  const [searchType, setSearchType] = useState<'b2b' | 'b2c'>('b2b');
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [count, setCount] = useState(20);
  const [language, setLanguage] = useState('English');
  const [targetRole, setTargetRole] = useState('');
  const [keywords, setKeywords] = useState('');
  const [productContext, setProductContext] = useState('');
  const [employeeRange, setEmployeeRange] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (niche && location) {
      onSubmit({ 
        searchType, 
        niche, 
        location, 
        count, 
        language, 
        targetRole: searchType === 'b2c' ? targetRole : undefined, 
        keywords: searchType === 'b2c' ? keywords : undefined,
        productContext: searchType === 'b2b' ? productContext : undefined,
        employeeRange: searchType === 'b2b' ? employeeRange : undefined
      });
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/80 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 tracking-tight">New Discovery Campaign</h3>
            </div>
            <p className="text-slate-600 text-sm max-w-lg leading-relaxed font-medium">
              Configure your AI agents to scout the web. 
              {searchType === 'b2b' 
                ? ' Identify active companies and enrich decision maker contact data.' 
                : ' Scan social platforms for potential customers showing intent.'}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide rounded-full border border-emerald-100 self-start shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             Agents Online
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {/* Campaign Type Toggle */}
          <div className="mb-10">
             <label className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-4 block">Select Campaign Type</label>
             <div className="flex p-1.5 bg-slate-100 rounded-xl w-fit border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSearchType('b2b')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    searchType === 'b2b' 
                      ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200 transform scale-[1.02]' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                   <Building2 className="w-4 h-4" />
                   B2B Company Search
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all text-slate-400 opacity-60 cursor-not-allowed"
                >
                   <MessageCircle className="w-4 h-4" />
                   B2C Social Listening
                   <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[9px] uppercase tracking-wide rounded font-extrabold">Soon</span>
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Core Search Params */}
            <div className="lg:col-span-8 space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                    <Search className="w-3.5 h-3.5" /> Core Criteria
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                     {/* Niche / Business Name Input */}
                     <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          {searchType === 'b2b' ? 'Target Industry' : 'Your Business / Product'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input
                            type="text"
                            required
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder={searchType === 'b2b' ? "e.g. Fintech Startups, Dental Clinics" : "e.g. Vegan Leather Shoes"}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 shadow-sm text-sm font-medium"
                          />
                        </div>
                     </div>

                     {/* Location Input */}
                     <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          {searchType === 'b2b' ? 'Location' : 'Target Market Location'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. San Francisco, CA"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 shadow-sm text-sm font-medium"
                          />
                        </div>
                     </div>

                     {/* Employee Range (B2B Only) */}
                     {searchType === 'b2b' && (
                       <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                             Company Size <span className="text-xs font-normal text-slate-400">(Employees)</span>
                          </label>
                          <div className="relative group">
                             <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                             <select
                                value={employeeRange}
                                onChange={(e) => setEmployeeRange(e.target.value)}
                                className="w-full pl-12 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 appearance-none cursor-pointer text-sm font-medium shadow-sm hover:border-slate-300"
                             >
                                <option value="">Any Size</option>
                                <option value="1-10">1-10 (Micro)</option>
                                <option value="11-50">11-50 (Small)</option>
                                <option value="51-200">51-200 (Medium)</option>
                                <option value="201-500">201-500 (Large)</option>
                                <option value="501-1000">501-1000 (Enterprise)</option>
                                <option value="1000+">1000+ (Corporate)</option>
                             </select>
                             <div className="absolute right-3.5 top-4 pointer-events-none">
                                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                             </div>
                          </div>
                       </div>
                     )}
                     
                     {/* B2B: Product/Service Context (Replaces Role & Keywords) */}
                     {searchType === 'b2b' ? (
                       <div className="col-span-1 md:col-span-2 space-y-3">
                          <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
                            What are you selling? (Product/Service)
                            <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Recommended</span>
                          </label>
                          <div className="relative group">
                            <ShoppingBag className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                              type="text"
                              value={productContext}
                              onChange={(e) => setProductContext(e.target.value)}
                              placeholder="e.g. Enterprise Payroll Software, Commercial Janitorial Services"
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 shadow-sm text-sm font-medium"
                            />
                          </div>
                          <p className="text-xs text-slate-500 ml-1">AI uses this to infer the correct decision maker role (e.g. HR Director vs. CTO).</p>
                       </div>
                     ) : (
                       /* B2C: Original Inputs */
                       <>
                         <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800">
                              Customer Intent Keywords
                            </label>
                            <div className="relative group">
                              <UserCheck className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                              <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. 'looking for', 'recommendations'"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 shadow-sm text-sm font-medium"
                              />
                            </div>
                         </div>

                         <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800">
                               Excluded Keywords
                            </label>
                            <div className="relative group">
                              <Filter className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                              <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="e.g. 'cheap', 'free', 'hiring'"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 shadow-sm text-sm font-medium"
                              />
                            </div>
                         </div>
                       </>
                     )}
                  </div>
                </div>
            </div>

            {/* Right Column: Configuration */}
            <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-slate-100 lg:pl-10">
               <div>
                 <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                    <Users className="w-3.5 h-3.5" /> Output Config
                  </div>
                 
                 <div className="space-y-8">
                    {/* Lead Volume */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-800 block">Lead Volume</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[10, 20, 50, 100].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setCount(v)}
                              className={`py-3 px-3 text-sm font-bold rounded-xl border transition-all duration-200 ${
                                count === v 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                              }`}
                            >
                              {v} Leads
                            </button>
                          ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 block">Language</label>
                        <div className="relative">
                          <Languages className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full pl-12 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 appearance-none cursor-pointer text-sm font-medium shadow-sm hover:border-slate-300"
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                          </select>
                          <div className="absolute right-3.5 top-4 pointer-events-none">
                            <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                    </div>
                 </div>
               </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
               <span>Powered by Google Gemini 3.0 Pro</span>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-base
                ${isLoading 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : searchType === 'b2c'
                    ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-500/25 hover:shadow-pink-500/40'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Configuring Agents...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-100" />
                  <span>
                    {searchType === 'b2b' ? 'Start Company Discovery' : 'Start Social Scan'}
                  </span>
                  <ArrowRight className="w-5 h-5 text-indigo-100" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper for select arrow
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

export default LeadForm;