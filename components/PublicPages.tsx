import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle2, Globe, Zap, 
  Users, Building2, Menu, X, Rocket,
  Play, Shield, Search, MapPin,
  Linkedin, Twitter, Facebook, Sparkles, Check
} from 'lucide-react';
import { PageView, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

// --- BRANDING COMPONENT ---
export const LeadiumLogo = ({ className = "w-8 h-8", light = false }: { className?: string, light?: boolean }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 20 V75 H80" stroke="#D4AF37" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M55 45 L80 20 M80 20 L68 20 M80 20 L80 32" stroke={light ? "#60A5FA" : "#1B3B6F"} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="25" cy="20" r="6" fill="#D4AF37" />
  </svg>
);

// --- SHARED COMPONENTS ---

const Navbar: React.FC<{ currentPage: PageView, onNavigate: (page: PageView) => void }> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: PageView; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Platform' },
    { id: 'about', label: 'Company' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-brand-900/95 backdrop-blur-xl border-white/10 py-3 shadow-lg' : 'bg-transparent border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <LeadiumLogo className="w-6 h-6" light />
            </div>
            <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-white' : 'text-slate-900'} transition-colors`}>
              Leadium<span className="text-gold-500">.app</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === item.id 
                    ? 'text-brand-900 bg-white shadow-sm' 
                    : scrolled ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => onNavigate('login')}
              className={`font-semibold text-sm transition-colors px-4 ${scrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="group bg-gold-500 hover:bg-gold-600 text-brand-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2 transform active:scale-95 hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`${scrolled ? 'text-white' : 'text-slate-900'} p-2`}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-900 border-t border-white/10 p-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 z-50">
           {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 rounded-lg"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} className="w-full py-3 text-center text-white font-semibold border border-white/20 rounded-lg">Log In</button>
              <button onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }} className="w-full py-3 text-center bg-gold-500 text-brand-900 font-bold rounded-lg shadow-sm">Get Started</button>
            </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-brand-950 text-slate-400 py-20 border-t border-brand-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2 space-y-6">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center border border-white/10">
              <LeadiumLogo className="w-6 h-6" light />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Leadium<span className="text-gold-500">.app</span></span>
          </div>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-medium">
            The intelligent engine for modern sales teams. Automate your prospecting, enrich your CRM, and 10x your pipeline with Gemini AI 3.0.
          </p>
          <div className="flex gap-3 pt-2">
             {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-brand-900 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-gold-500 hover:text-brand-900 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/20">
                   <Icon className="w-4 h-4" />
                </a>
             ))}
          </div>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-widest">Product</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><a href="#" className="hover:text-gold-400 transition-colors">Features</a></li>
          <li><a href="#" className="hover:text-gold-400 transition-colors">Pricing</a></li>
          <li><a href="#" className="hover:text-gold-400 transition-colors">API</a></li>
          <li><a href="#" className="hover:text-gold-400 transition-colors">Integrations</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-widest">Company</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><a href="#" className="hover:text-gold-400 transition-colors">About Us</a></li>
          <li><a href="#" className="hover:text-gold-400 transition-colors flex items-center gap-2">Careers <span className="text-[10px] bg-gold-500/10 text-gold-500 border border-gold-500/20 px-2 py-0.5 rounded-full font-bold">Hiring</span></a></li>
          <li><a href="#" className="hover:text-gold-400 transition-colors">Blog</a></li>
          <li><a href="#" className="hover:text-gold-400 transition-colors">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-brand-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500">
      <p>&copy; {new Date().getFullYear()} Leadium.app Inc. All rights reserved.</p>
      <div className="flex gap-8">
         <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
         <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
         <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
      </div>
    </div>
  </footer>
);

export const PublicLayout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => (
  <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col selection:bg-gold-500 selection:text-brand-900">
    <Navbar currentPage={currentPage} onNavigate={onNavigate} />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

// --- PAGES ---

export const HomePage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => (
  <>
    {/* Hero Section */}
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-40 bg-slate-50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] bg-gradient-to-b from-brand-100 via-white to-white rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-200 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 cursor-default hover:border-gold-400 hover:shadow-md transition-all shadow-sm group">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
          </span>
          <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wide group-hover:text-brand-600 transition-colors">Gemini 3.0 Engine Live</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-brand-950 mb-8 max-w-5xl mx-auto leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Scale your revenue, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-600 via-brand-500 to-gold-600">not your headcount.</span>
        </h1>
        
        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
          The first AI sales representative that works 24/7. Scout, verify, and enrich B2B contacts at scale with Leadium's human-like reasoning.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button 
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto px-8 py-4 bg-brand-900 hover:bg-brand-800 text-white rounded-xl font-bold text-base shadow-xl shadow-brand-900/20 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onNavigate('services')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 hover:border-slate-300 shadow-sm hover:shadow-md"
          >
            <Play className="w-4 h-4 fill-slate-400 text-slate-400" /> Watch Demo
          </button>
        </div>

        {/* Dashboard Preview - The User's Image */}
        <div className="mt-24 relative mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 group">
           {/* Glow Effect */}
           <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-gold-500/20 to-brand-500/20 rounded-[20px] blur-3xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
           
           <div className="relative bg-brand-950 rounded-[20px] shadow-2xl overflow-hidden border border-brand-900 ring-1 ring-white/10">
              {/* Browser Window Controls */}
              <div className="h-10 bg-brand-950/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-20 relative">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                 </div>
                 <div className="px-3 py-1 bg-brand-900/50 rounded-lg border border-white/5 text-[10px] text-slate-400 font-medium flex items-center gap-2 shadow-inner min-w-[240px] justify-center tracking-wide">
                    <span className="opacity-60">https://</span>
                    <span className="text-slate-300">app.leadium.app</span>
                    <span className="opacity-60">/dashboard</span>
                 </div>
                 <div className="flex items-center gap-3 opacity-0"> {/* Spacer */}
                    <div className="w-3 h-3"></div>
                 </div>
              </div>
              
              {/* Dashboard Image - User Provided */}
              <div className="relative aspect-[16/10] bg-brand-900 group">
                  <img 
                    src="/Screenshot 2025-12-14 011721.png"
                    alt="Leadium.app Dashboard" 
                    className="w-full h-full object-cover object-top opacity-95 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.01]"
                  />
                  {/* Subtle overlay to blend if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/10 to-transparent pointer-events-none" />
              </div>
           </div>
        </div>

        {/* Social Proof */}
        <div className="mt-32 pt-16 border-t border-brand-200/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Powering next-gen sales teams at</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 grayscale opacity-50 hover:opacity-100 transition-all duration-500">
             {['Acme Corp', 'GlobalTech', 'Nebula', 'FoxRun', 'Circle', 'Vertex', 'Echo'].map((logo, i) => (
               <div key={i} className="flex items-center gap-2 group cursor-default">
                 <div className="w-6 h-6 bg-slate-300 rounded-full group-hover:bg-brand-600 transition-colors" /> 
                 <span className="text-lg font-bold text-slate-800">{logo}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </section>

    {/* Features Bento Grid */}
    <section className="py-32 bg-white relative border-t border-slate-100">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-gold-600 uppercase tracking-widest mb-4">Why Leadium.app?</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-brand-950 mb-6 tracking-tight">Don't just find leads.<br/>Understand them.</h3>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">Most tools give you a list. We give you a strategy. Our AI agents read website content to determine compatibility before you even pitch.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
             {/* Large Item */}
             <div className="md:col-span-2 bg-brand-50 rounded-3xl p-10 border border-brand-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-600 mb-8 border border-brand-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                     <Globe className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold text-brand-900 mb-4">Global Real-Time Search</h3>
                   <p className="text-brand-700 text-base leading-relaxed max-w-lg">Access verified data from 140+ countries. We don't rely on stale databases that are updated quarterly. We search the live web the moment you click "Start".</p>
                </div>
                <div className="absolute right-0 bottom-0 w-2/3 h-full bg-gradient-to-l from-white via-white/40 to-transparent"></div>
                <Globe className="absolute -bottom-10 -right-10 w-96 h-96 text-brand-200 group-hover:text-brand-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
             </div>

             {/* Dark Tall Item */}
             <div className="bg-brand-950 rounded-3xl p-10 border border-brand-900 text-white relative overflow-hidden group shadow-2xl hover:shadow-brand-900/50 hover:-translate-y-1 transition-all">
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-gold-400 mb-8 border border-white/10 backdrop-blur-sm group-hover:bg-gold-500 group-hover:text-brand-950 transition-colors duration-500">
                     <Zap className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4">Instant Enrichment</h3>
                   <p className="text-slate-400 text-base leading-relaxed">Find decision maker emails, verify them, and generate personalized opening lines in seconds.</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-900/50"></div>
                <Zap className="absolute -top-6 -right-6 w-56 h-56 text-brand-900 group-hover:text-brand-800 group-hover:rotate-12 transition-all duration-500" />
             </div>

             {/* Standard Item */}
             <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1 hover:border-brand-200">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Role Targeting</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Identify the exact person to pitch. CEO, CTO, or HR Director - we find them.</p>
             </div>

             {/* Standard Item */}
             <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1 hover:border-purple-200">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verify & Validate</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Automatic email verification and bounce detection built-in. No more bad data.</p>
             </div>
             
              {/* Standard Item */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1 hover:border-emerald-200">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Copywriting</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Generate personalized cold emails that actually get opened, based on prospect data.</p>
             </div>
          </div>
       </div>
    </section>
  </>
);

export const AboutPage: React.FC = () => (
  <div className="pt-32 pb-20">
    <div className="max-w-4xl mx-auto px-6 text-center">
       <h2 className="text-4xl font-bold text-brand-900 mb-6">Our Mission</h2>
       <p className="text-xl text-slate-500 leading-relaxed mb-12">
         We believe that B2B sales shouldn't be about spamming thousands of people. 
         It should be about finding the <span className="text-brand-600 font-bold">perfect fit</span>.
         Our AI agents work tirelessly to match your solution with companies that actually need it right now.
       </p>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-20">
          <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
             <div className="text-3xl font-bold text-brand-900 mb-2">1M+</div>
             <div className="text-sm font-bold text-brand-600 uppercase tracking-wide">Leads Generated</div>
          </div>
          <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
             <div className="text-3xl font-bold text-brand-900 mb-2">98%</div>
             <div className="text-sm font-bold text-brand-600 uppercase tracking-wide">Data Accuracy</div>
          </div>
           <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
             <div className="text-3xl font-bold text-brand-900 mb-2">24/7</div>
             <div className="text-sm font-bold text-brand-600 uppercase tracking-wide">Agent Uptime</div>
          </div>
       </div>
    </div>
  </div>
);

export const ServicesPage: React.FC = () => (
  <div className="pt-32 pb-20 bg-slate-50">
     <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-4xl font-bold text-brand-900 mb-6">The Platform</h2>
           <p className="text-slate-500 text-lg">Everything you need to build a high-converting pipeline.</p>
        </div>

        <div className="space-y-20">
           {/* Service 1 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-brand-600 mb-6">
                    <Search className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-bold text-slate-900 mb-4">Deep Web Scraping</h3>
                 <p className="text-slate-500 text-lg leading-relaxed mb-6">
                    Our agents don't just look at LinkedIn. They scan company blogs, news articles, and financial reports to find intent signals that others miss.
                 </p>
                 <ul className="space-y-3">
                    {['Real-time verification', 'Tech stack analysis', 'Funding alerts'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-gold-500" /> {item}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="order-1 md:order-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-200/50 transform rotate-1">
                 <div className="bg-slate-50 rounded-xl p-8 h-80 flex items-center justify-center border border-slate-100 border-dashed">
                    <div className="text-center">
                       <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm text-slate-300">
                          <Search className="w-8 h-8" />
                       </div>
                       <div className="h-2 w-32 bg-slate-200 rounded-full mx-auto mb-2"></div>
                       <div className="h-2 w-20 bg-slate-200 rounded-full mx-auto"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
               <h3 className="text-lg font-bold text-slate-900">Starter</h3>
               <div className="text-3xl font-bold text-slate-900 mt-2 mb-6">$49<span className="text-sm font-normal text-slate-500">/mo</span></div>
               <button className="w-full py-2.5 bg-slate-50 text-slate-900 font-bold rounded-lg border border-slate-200 hover:bg-slate-100 mb-6">Get Started</button>
               <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500" /> 500 Credits</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500" /> Basic Enrichment</li>
               </ul>
            </div>
            
            <div className="bg-brand-900 p-8 rounded-2xl border border-brand-800 text-white relative overflow-hidden transform md:-translate-y-4 shadow-xl">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
               <h3 className="text-lg font-bold text-white">Pro</h3>
               <div className="text-3xl font-bold text-white mt-2 mb-6">$149<span className="text-sm font-normal text-slate-400">/mo</span></div>
               <button className="w-full py-2.5 bg-gold-500 text-brand-900 font-bold rounded-lg hover:bg-gold-400 mb-6 shadow-lg shadow-gold-500/20">Get Started</button>
               <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-gold-500" /> 2,500 Credits</li>
                  <li className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-gold-500" /> Deep Enrichment</li>
                  <li className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-gold-500" /> API Access</li>
               </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
               <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
               <div className="text-3xl font-bold text-slate-900 mt-2 mb-6">Custom</div>
               <button className="w-full py-2.5 bg-slate-50 text-slate-900 font-bold rounded-lg border border-slate-200 hover:bg-slate-100 mb-6">Contact Sales</button>
               <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500" /> Unlimited Credits</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500" /> Dedicated Manager</li>
               </ul>
            </div>
        </div>
     </div>
  </div>
);

export const ContactPage: React.FC = () => (
  <div className="pt-32 pb-20">
     <div className="max-w-xl mx-auto px-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Get in touch</h2>
        <p className="text-slate-500 mb-8">Ready to scale? Our team is here to help.</p>
        
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
              <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="you@company.com" />
           </div>
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
              <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all h-32" placeholder="Tell us about your needs..." />
           </div>
           <button className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20">
              Send Message
           </button>
        </form>
     </div>
  </div>
);

export const AuthPage: React.FC<{ type: 'login' | 'signup', onAuth: (user: User) => void }> = ({ type, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onAuth({
        id: 'user-' + Date.now(),
        name: name || (email.split('@')[0]),
        email: email,
        companyName: 'My Company'
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
             <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/30">
                <LeadiumLogo className="w-6 h-6" light />
             </div>
             <h2 className="text-2xl font-bold text-slate-900">{type === 'login' ? 'Welcome back' : 'Create your account'}</h2>
             <p className="text-slate-500 text-sm mt-1">
               {type === 'login' ? 'Enter your credentials to access the dashboard' : 'Start your 14-day free trial today'}
             </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
             {type === 'signup' && (
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium" 
                    placeholder="John Doe"
                  />
               </div>
             )}
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Work Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium" 
                  placeholder="name@company.com"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium" 
                  placeholder="••••••••"
                />
             </div>
             
             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full py-4 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {type === 'login' ? 'Sign In' : 'Get Started'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
             </button>
          </form>
       </div>
    </div>
  );
};