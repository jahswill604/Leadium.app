import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, StopCircle, UserCog, TrendingUp, Database, Download } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Define Agent Types
type AgentRole = 'user' | 'manager' | 'strategist' | 'scraper';

interface ChatMessage {
  id: string;
  role: AgentRole;
  senderName: string;
  text: string;
  isStreaming?: boolean;
  hasAttachment?: boolean; // For Excel download
}

const ChatView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'init-1', 
      role: 'manager', 
      senderName: 'Sarah (Project Lead)', 
      text: "Hello! I'm Sarah, your Project Manager. I'm here to coordinate your lead generation campaign.\n\nI have **Marcus** (our Marketing Strategist with 10y+ exp) and **Alex** (our Lead & Outreach Specialist) on the line.\n\nTo get started, tell us about your business. Are you B2B or B2C, and what are you selling?" 
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Buffer to handle streaming parsing
  const streamBuffer = useRef('');

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateCSV = (content: string) => {
    // A simple parser to extract CSV-like data or just download the text plan
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'agent_collaboration_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add User Message
    const userMsgObj: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      senderName: 'You', 
      text: userMessage 
    };
    setMessages(prev => [...prev, userMsgObj]);
    setIsStreaming(true);
    streamBuffer.current = '';

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          temperature: 0.7, // Slightly creative for dialogue
          systemInstruction: `
            You are simulating a collaborative team of 3 AI Agents working for the user.
            You must output the dialogue for ALL three agents based on the context.
            
            THE AGENTS:
            1. AGENT_MANAGER (Name: Sarah): 
               - Role: Project Lead. Professional, organized, polite.
               - Task: Gathers requirements from the user. Delegates tasks to Marcus and Alex. 
               - CRITICAL RULE: Once Sarah has gathered enough info (business type and audience), she MUST explicitly command Alex to **"generate 20 quality leads"**.
            
            2. AGENT_STRATEGIST (Name: Marcus):
               - Role: Senior Marketing Strategist (10+ years exp).
               - Personality: Insightful, strategic, analytical. Uses terms like "funnel," "touchpoints," "conversion."
               - Task: Analyzes the business. Identifies the PERFECT target audience. Proposes a high-level marketing strategy.
            
            3. AGENT_SCRAPER (Name: Alex):
               - Role: Lead Specialist & Outreach.
               - Personality: Technical, direct, results-oriented.
               - Task: "Searches" for leads (Simulated). Drafts personalized email/DM copy.
               - RULE: When commanded by Sarah, Alex must confirm he is starting the extraction for 20 verified leads.
               - RULE FOR B2C: If the business is B2C, you MUST focus on social media comments, groups, and recent blog posts (< 1 week old).
               - Output: Eventually produces a list of leads with verified contacts (simulated data).

            WORKFLOW:
            1. Sarah asks the user for business details.
            2. Sarah asks Marcus to analyze. Marcus gives strategy.
            3. Sarah asks User for approval.
            4. If approved (or if info is sufficient), Sarah commands Alex: "Go find 20 real verified leads."
            5. Alex generates leads and outreach copy.
            6. Sarah presents the final data (Simulated Excel/CSV format).

            IMPORTANT FORMATTING INSTRUCTION:
            You must separate the speakers using strict tags.
            Example format:
            <<MANAGER>>
            Thank you. Marcus, what do you think?
            <<STRATEGIST>>
            This is an interesting niche. I suggest we target...
            <<SCRAPER>>
            I can scrape those sources.
            
            When providing the final data/excel, Scraper should output it as a CSV code block.
          `,
        },
        history: messages.map(m => {
          // Convert our internal message format back to Gemini history
          let role = 'model';
          if (m.role === 'user') role = 'user';
          return {
            role: role,
            parts: [{ text: m.text }] // We send the raw text, the model knows the context
          };
        })
      });

      const result = await chat.sendMessageStream({ message: userMessage });
      
      let currentRole: AgentRole = 'manager'; // Default start
      let currentSender = 'Sarah (Project Lead)';

      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (!chunkText) continue;

        streamBuffer.current += chunkText;

        // Check for agent tags
        const tagRegex = /<<(MANAGER|STRATEGIST|SCRAPER)>>/g;
        let match;
        
        // We process the buffer to split by tags
        // This is a simplified stream parser
        const parts = streamBuffer.current.split(/(<<(?:MANAGER|STRATEGIST|SCRAPER)>>)/);
        
        // If we have parts, it means we might need to update or create messages
        // The last part might be incomplete, so we only "commit" parts if we are sure
        
        // For simplicity in this React implementation, we will re-render the *entire* response 
        // from the current stream buffer as a set of messages, replacing the "loading" state.
        
        // Actually, a better approach for streaming multiple bubbles is:
        // 1. Maintain a list of "new" messages being generated in this turn.
        // 2. Parse the buffer.
        
        const newMessages: ChatMessage[] = [];
        let tempBuffer = streamBuffer.current;
        
        // Split by tags
        const split = tempBuffer.split(/<<(MANAGER|STRATEGIST|SCRAPER)>>/);
        
        // The split usually results in ["text before", "TAG", "text after", "TAG", ...]
        // If it starts with text before a tag, that belongs to the previous context or default manager.
        
        let activeRole: AgentRole = 'manager';
        let activeName = 'Sarah (Project Lead)';
        
        for (let i = 0; i < split.length; i++) {
          const segment = split[i];
          
          if (segment === 'MANAGER') {
            activeRole = 'manager';
            activeName = 'Sarah (Project Lead)';
          } else if (segment === 'STRATEGIST') {
            activeRole = 'strategist';
            activeName = 'Marcus (Marketing Guru)';
          } else if (segment === 'SCRAPER') {
            activeRole = 'scraper';
            activeName = 'Alex (Data & Outreach)';
          } else if (segment.trim().length > 0) {
            // It's content
            newMessages.push({
              id: `stream-${i}`,
              role: activeRole,
              senderName: activeName,
              text: segment.trim(),
              isStreaming: true,
              hasAttachment: segment.includes('Company,Website,') || segment.includes('Platform,Link,') || segment.includes('Name,Email,') // Simple detection for CSV
            });
          }
        }

        // Update state: Keep old messages + new streaming messages
        setMessages(prev => {
          // Filter out previous "stream" messages from this turn to avoid duplication during re-renders
          const old = prev.filter(m => !m.id.startsWith('stream-'));
          return [...old, ...newMessages];
        });
      }

      // Final pass to remove streaming flag
      setMessages(prev => prev.map(m => ({ ...m, isStreaming: false })));

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: 'error', 
        role: 'manager', 
        senderName: 'System', 
        text: "I lost connection with the team. Please try again." 
      }]);
    } finally {
      setIsStreaming(false);
      streamBuffer.current = '';
    }
  };

  // Helper to render distinct agent avatars
  const renderAvatar = (role: AgentRole) => {
    switch (role) {
      case 'manager':
        return <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20"><UserCog className="w-5 h-5" /></div>;
      case 'strategist':
        return <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20"><TrendingUp className="w-5 h-5" /></div>;
      case 'scraper':
        return <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20"><Database className="w-5 h-5" /></div>;
      default:
        return <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white"><User className="w-5 h-5" /></div>;
    }
  };

  const getBubbleStyle = (role: AgentRole) => {
    switch (role) {
      case 'user': return 'bg-slate-900 text-white rounded-tr-none shadow-md';
      case 'manager': return 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm';
      case 'strategist': return 'bg-purple-50 border border-purple-100 text-purple-900 rounded-tl-none shadow-sm';
      case 'scraper': return 'bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-tl-none shadow-sm';
      default: return 'bg-white border border-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
             <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm" title="Sarah (Manager)">S</div>
             <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm" title="Marcus (Strategist)">M</div>
             <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm" title="Alex (Scraper)">A</div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Agent Collaboration</h3>
            <p className="text-xs text-slate-500 font-medium">3 Agents Online • Active Session</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-100 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
              {renderAvatar(msg.role)}
            </div>

            {/* Bubble Container */}
            <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               {msg.role !== 'user' && (
                 <span className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${
                   msg.role === 'manager' ? 'text-blue-600' : 
                   msg.role === 'strategist' ? 'text-purple-600' : 
                   'text-emerald-600'
                 }`}>
                   {msg.senderName}
                 </span>
               )}
               
               <div className={`
                  rounded-2xl px-6 py-4 text-sm leading-relaxed whitespace-pre-wrap
                  ${getBubbleStyle(msg.role)}
               `}>
                  {msg.text}
                  
                  {/* Download Button if attachment detected */}
                  {msg.hasAttachment && !msg.isStreaming && (
                    <div className="mt-5 pt-4 border-t border-black/5">
                       <button 
                        onClick={() => generateCSV(msg.text)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800 text-xs font-bold transition-all shadow-sm w-full justify-center"
                       >
                         <Download className="w-4 h-4 text-emerald-600" />
                         Download Lead Sheet (.csv)
                       </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        ))}
        
        {isStreaming && messages.length > 0 && messages[messages.length-1].role === 'user' && (
           <div className="flex gap-4 animate-in fade-in duration-300">
             {renderAvatar('manager')}
             <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your strategy instructions here..."
            disabled={isStreaming}
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className={`
              absolute right-2.5 top-2.5 p-2 rounded-xl transition-all
              ${!input.trim() || isStreaming 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform active:scale-95'}
            `}
          >
            {isStreaming ? <StopCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Powered by Gemini 3.0 Agent Swarm</p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;