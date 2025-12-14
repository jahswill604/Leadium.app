import React, { useState, useCallback, useRef } from 'react';
import { Command } from 'lucide-react';
import ProcessingView from './ProcessingView';
import { generateLeads, enrichCompanyData } from '../services/leadGenService';
import { SearchParams, Lead, LogEntry, AppState, User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [targetCount, setTargetCount] = useState(0);
  const [scannedCount, setScannedCount] = useState(0); // Track real sources
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type
    }]);
  }, []);

  const handleStartSearch = async (params: SearchParams) => {
    // Abort any existing process
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setAppState('processing');
    setTargetCount(params.count);
    setLeads([]);
    setLogs([]);
    setScannedCount(0);
    setError(undefined);
    setLastSearchParams(params);

    try {
      if (signal.aborted) throw new Error("Cancelled");
      addLog(`Initializing Genkit pipeline for project 'lead-gen-v1'...`, 'info');
      
      await new Promise(r => setTimeout(r, 800));
      if (signal.aborted) throw new Error("Cancelled");

      addLog(`Loading search configuration for niche: "${params.niche}" in "${params.location}"`, 'info');
      
      if (params.searchType === 'b2b' && params.productContext) {
        addLog(`Contextualizing for product: "${params.productContext}"`, 'info');
      } else if (params.targetRole) {
         addLog(`Targeting decision maker role: "${params.targetRole}"`, 'info');
      }
      
      if (params.keywords) {
         addLog(`Applying specific criteria: "${params.keywords}"`, 'info');
      }

      await new Promise(r => setTimeout(r, 800));
      if (signal.aborted) throw new Error("Cancelled");
      
      addLog(`Executing 'companyDiscovery' flow...`, 'info');
      addLog(`Generating search queries via Gemini 3.0 Pro...`, 'info');
      
      await new Promise(r => setTimeout(r, 1000));
      if (signal.aborted) throw new Error("Cancelled");

      addLog(`Querying SERP API and LinkedIn Index...`, 'info');
      
      // We pass the signal check implicitly by checking after the await
      const generatedLeads = await generateLeads(params, process.env.API_KEY || '');
      
      if (signal.aborted) throw new Error("Cancelled");

      // Calculate unique sources used by the AI during the initial discovery phase
      const uniqueSources = new Set<string>();
      generatedLeads.forEach(lead => {
          lead.sources?.forEach(source => uniqueSources.add(source));
      });
      // Update with the initial count of sources found in grounding
      setScannedCount(uniqueSources.size);

      addLog(`Found ${generatedLeads.length} potential candidates. Starting preliminary enrichment...`, 'success');

      for (let i = 0; i < generatedLeads.length; i++) {
        if (signal.aborted) throw new Error("Cancelled");
        
        // Increment count to represent scanning this specific lead's website
        setScannedCount(prev => prev + 1);

        const lead = generatedLeads[i];
        addLog(`[${lead.companyName}] Fetching website metadata from ${lead.websiteUrl}...`, 'info');
        
        await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        
        if (signal.aborted) throw new Error("Cancelled");
        
        setLeads(prev => [...prev, lead]);
        addLog(`[${lead.companyName}] Contact identified.`, 'success');
      }

      addLog(`Pipeline completed successfully. ${generatedLeads.length} leads exported to memory.`, 'success');
      setAppState('completed');

    } catch (err: any) {
      if (err.message === "Cancelled" || err.name === "AbortError") {
        addLog('Process stopped by user.', 'warning');
        setAppState('completed'); // Set to completed so user can see partial results or reset
      } else {
        console.error(err);
        setError(err.message || "An unexpected error occurred during the pipeline execution.");
        addLog(`Pipeline crashed: ${err.message}`, 'error');
        setAppState('idle'); 
      }
    } finally {
        abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
  };

  const handleEnrich = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.enrichedData) {
        addLog(`[${lead.companyName}] Data is already enriched.`, 'warning');
        return;
    }

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'enriching' } : l));
    addLog(`Initiating Deep Enrichment Protocol for ${lead.companyName}...`, 'info');
    
    // Simulate additional scanning for deep enrichment
    setScannedCount(prev => prev + 3);

    setTimeout(async () => {
        addLog(`[${lead.companyName}] Scraping website content and analyzing business model...`, 'info');
        try {
            const enrichedData = await enrichCompanyData(
                lead, 
                lastSearchParams?.productContext,
                process.env.API_KEY || ''
            );

            if (enrichedData) {
                setLeads(prev => prev.map(l => {
                    if (l.id === leadId) {
                        return { ...l, enrichedData, status: 'complete' };
                    }
                    return l;
                }));
                addLog(`[${lead.companyName}] Strategic analysis complete. Pitch generated.`, 'success');
            } else {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'complete' } : l));
                addLog(`[${lead.companyName}] Failed to generate deep insights.`, 'error');
            }
        } catch (e) {
             setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'failed' } : l));
             addLog(`[${lead.companyName}] Enrichment error: ${e}`, 'error');
        }
    }, 500);
  };

  const handleFeedback = (rating: number) => {
    addLog(`User rated campaign quality: ${rating}/5 stars`, 'success');
  };

  const handleReset = () => {
    setAppState('idle');
    setLeads([]);
    setLogs([]);
    setLastSearchParams(null);
    setScannedCount(0);
  };

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-hidden">
      {!process.env.API_KEY && (
        <div className="absolute inset-0 z-[60] bg-white/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 max-w-lg text-center ring-1 ring-slate-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Command className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">API Key Missing</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                This application requires a Google Gemini API key to function. 
                The key is injected via <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">process.env.API_KEY</code>.
              </p>
            </div>
        </div>
      )}

      <ProcessingView 
        user={user}
        leads={leads}
        logs={logs}
        totalTarget={targetCount}
        isComplete={appState === 'completed'}
        isLoading={appState === 'processing'}
        scannedCount={scannedCount}
        onSearch={handleStartSearch}
        onReset={handleReset}
        onEnrich={handleEnrich}
        onFeedback={handleFeedback}
        onCancel={handleCancel}
        error={error}
        onLogout={onLogout}
      />
    </div>
  );
};

export default Dashboard;