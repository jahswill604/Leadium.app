export interface DecisionMaker {
  name: string;
  title: string;
  email: string;
}

export interface EnrichedData {
  keyInsights: string[];
  productsServices: string[];
  technologies: string[];
  competitiveAdvantage: string;
  targetMarket: string;
  socialLinks: Record<string, string>;
  pitchStrategy: string;
  outreachEmail: string;
}

export interface Lead {
  id: string;
  companyName: string; // Used as "Platform/Source" for B2C
  websiteUrl: string;  // Used as "Link to Post" for B2C
  industry: string;
  country: string;
  summary: string;     // Used as "Post Content" for B2C
  generalEmail: string;
  decisionMakers: DecisionMaker[]; // Used for User/Handle info in B2C
  linkedinUrl: string;
  phoneNumber: string;
  size: string;
  qualityScore: number;
  sources?: string[];
  status: 'discovered' | 'enriching' | 'complete' | 'failed';
  leadType?: 'b2b' | 'b2c';
  enrichedData?: EnrichedData; // New field for deep analysis
}

export interface SearchParams {
  searchType: 'b2b' | 'b2c';
  niche: string; // Mapped to "Business Name/Description" for B2C
  location: string;
  count: number;
  language: string;
  targetRole?: string; // Mapped to "Customer Keywords" for B2C
  keywords?: string;
  productContext?: string; // What the user is selling (B2B only)
  employeeRange?: string; // Range of employees
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type AppState = 'idle' | 'processing' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  companyName?: string;
}

export type PageView = 'home' | 'about' | 'services' | 'contact' | 'login' | 'signup' | 'dashboard';