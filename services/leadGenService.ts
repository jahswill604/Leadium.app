import { GoogleGenAI } from "@google/genai";
import { Lead, SearchParams, EnrichedData } from "../types";

export const generateLeads = async (
  params: SearchParams, 
  apiKey: string
): Promise<Lead[]> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey });

  // Use Gemini 3.0 Pro (Preview) for advanced reasoning and search capabilities
  const model = 'gemini-3-pro-preview';

  let prompt = '';
  let systemInstruction = '';

  if (params.searchType === 'b2c') {
    // --- B2C SOCIAL LISTENING LOGIC ---
    systemInstruction = `
      You are an expert Social Media Growth Hacker and Consumer Researcher.
      
      YOUR MISSION:
      1. Analyze the user's business: "${params.niche}".
      2. Identify POTENTIAL CUSTOMERS by finding recent discussions on **Instagram, Facebook, X (Twitter), and TikTok**.
      3. CRITICAL: Only return results that are **LESS THAN 1 WEEK OLD**.
      4. Look for "intent keywords" like: "looking for", "recommendation", "problem with", "alternative to", "how to".
      5. **ACTIONABLE CONTACT**: You MUST return a URL that allows the user to click and Inbox/Message the lead (e.g. User Profile URL).
      6. Return the data in a strict JSON array format inside a markdown code block.
    `;

    const keywordFocus = params.targetRole 
      ? `Focus specifically on these intent keywords: "${params.targetRole}"` 
      : `Generate your own high-intent search queries based on the business description.`;

    const excluded = params.keywords 
      ? `Exclude posts containing: "${params.keywords}"` 
      : '';

    prompt = `
      Perform a deep social listening scan to find ${params.count} potential customers for a business described as: "${params.niche}".
      Target Location: "${params.location}".
      Language: "${params.language || 'English'}".
      
      TARGET PLATFORMS: Instagram, Facebook, X (Twitter), TikTok.
      
      ${keywordFocus}
      ${excluded}
      
      EXECUTION STEPS:
      1. Use Google Search to find specific threads, comments, or posts on the target platforms.
      2. **VERIFY DATES**: You MUST strictly filter for content created in the LAST 7 DAYS. 
      3. For each result, extract:
         - Platform Name (e.g., Instagram, TikTok)
         - Link to the specific post/comment
         - User's handle/name (if visible)
         - **Inbox/Profile Link**: The URL to the user's profile where they can be messaged.
         - Content Summary (What are they asking/saying?)
         - Sentiment (e.g., High Intent, Competitor Complaint)
      
      OUTPUT FORMAT:
      Return the result as a JSON Array wrapped in a code block. Map the social data to this structure:
      \`\`\`json
      [
        {
          "companyName": "Platform Name (e.g. TikTok)",
          "websiteUrl": "Link to the specific post",
          "summary": "The content of their post/comment",
          "generalEmail": "", 
          "industry": "Sentiment (e.g. High Intent)",
          "linkedinUrl": "",
          "phoneNumber": "",
          "size": "Date of post (e.g. 2 days ago)",
          "decisionMakers": [
            { 
              "name": "User Handle", 
              "title": "Potential Customer", 
              "email": "URL to User Profile (for Inboxing)" 
            }
          ]
        }
      ]
      \`\`\`
    `;

  } else {
    // --- B2B COMPANY DISCOVERY LOGIC ---
    systemInstruction = `
      You are an expert B2B lead researcher with access to real-time Google Search.
      
      YOUR MISSION:
      1. Find REAL, active companies matching the user's criteria.
      2. For each company, you MUST perform a search to find and verify the Decision Maker's name and email pattern.
      3. Do NOT hallucinate contact info. If you can't find a specific email or phone number, LEAVE IT EMPTY STRING.
      4. Return the data in a strict JSON array format inside a markdown code block.
    `;

    // Infer decision maker role if product context is provided
    let roleInstruction = '';
    if (params.productContext) {
      roleInstruction = `
        CONTEXT: The user is selling "${params.productContext}".
        TASK: You must INFER the single best decision maker role who would buy this product (e.g. if selling 'HR Software', find the 'HR Director').
        Then, find that specific person's Name, Title, and verify their Email.
      `;
    } else {
      roleInstruction = params.targetRole 
        ? `Target Decision Maker Role: "${params.targetRole}".`
        : `Target Decision Maker Role: CEO, Founder, or Managing Director.`;
    }

    const keywordInstruction = params.keywords
      ? `Additional Criteria (Must Match): "${params.keywords}".`
      : '';
      
    const sizeInstruction = params.employeeRange
      ? `Target Company Size: strictly ${params.employeeRange} employees.`
      : '';

    prompt = `
      Perform a deep research task to find ${params.count} companies in the "${params.niche}" industry located in "${params.location}".
      ${keywordInstruction}
      ${sizeInstruction}
      Target language: "${params.language || 'English'}".
      
      EXECUTION STEPS:
      1. Use Google Search to identify a list of ${params.count} companies fitting the criteria.
      2. For each company, find:
         - Official Company Name
         - Website URL
         - 1-sentence summary
         - General email (e.g. info@, contact@)
         - LinkedIn URL
         - Phone Number (CRITICAL: Leave this field EMPTY string "" if a real number is not clearly visible. Do NOT make up a number.)
         - Est. Size
         - ${roleInstruction}
      
      OUTPUT FORMAT:
      Return the result as a JSON Array wrapped in a code block like this:
      \`\`\`json
      [
        {
          "companyName": "Exact Company Name",
          "websiteUrl": "https://...",
          "summary": "...",
          "generalEmail": "...",
          "industry": "...",
          "linkedinUrl": "...",
          "phoneNumber": "...",
          "size": "...",
          "decisionMakers": [
            { "name": "...", "title": "...", "email": "..." }
          ]
        }
      ]
      \`\`\`
    `;
  }

  // Note: When using googleSearch tool, we CANNOT use responseMimeType: 'application/json' or responseSchema.
  // We must parse the text manually.
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.1, // Low temperature for more deterministic data extraction
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  // Extract grounding sources (URLs) from the response metadata
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map(chunk => chunk.web?.uri)
    .filter((uri): uri is string => !!uri) || [];

  const uniqueSources = Array.from(new Set(sources));

  // Parse JSON from text response
  let rawData: any[] = [];
  try {
    const text = response.text || "";
    // Regex to extract JSON block which is more robust than simple replacement
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
       rawData = JSON.parse(jsonMatch[1]);
    } else {
       // Fallback: try to parse the whole text if it looks like JSON (e.g. model forgot code blocks)
       const cleanText = text.trim();
       if (cleanText.startsWith('[') && cleanText.endsWith(']')) {
         rawData = JSON.parse(cleanText);
       }
    }
  } catch (e) {
    console.warn("Failed to parse JSON from model response", e);
    // If parsing fails, we return an empty array or handle gracefully
    rawData = [];
  }
  
  // Transform to match our internal Lead type
  return rawData.map((item: any, index: number) => ({
    ...item,
    id: `lead-${Date.now()}-${index}`,
    country: params.location,
    status: 'complete',
    dateAdded: new Date().toISOString(),
    // Calculate a dynamic quality score
    qualityScore: calculateQualityScore(item, params.searchType),
    // Attach verification sources
    sources: uniqueSources.slice(0, 15),
    leadType: params.searchType // Store the type to adjust rendering
  }));
};

export const enrichCompanyData = async (
  lead: Lead, 
  userProductContext: string | undefined, 
  apiKey: string
): Promise<EnrichedData | null> => {
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-preview';

  // Fallback if no specific product provided
  const productInfo = userProductContext || "B2B Solutions";

  const prompt = `
    Perform a comprehensive deep-dive analysis of the company: "${lead.companyName}" based on their website "${lead.websiteUrl}".
    
    THE USER IS SELLING: "${productInfo}".
    
    YOUR TASKS:
    1. **Scrape & Analyze**: Understand their business model, location, and operations.
    2. **Find Socials**: Search for ALL official social media handles found on their website or via search (e.g. LinkedIn, X/Twitter, Facebook, Instagram, YouTube, TikTok, Pinterest, etc). Do not limit to just the major ones if others are prominent.
    3. **Strategic Alignment**: Determine how the user's product ("${productInfo}") helps THIS specific company.
    4. **Generate Output**: Return a JSON object with the structure below.
    
    REQUIRED OUTPUT STRUCTURE (JSON Only):
    {
      "keyInsights": ["Insight 1 (e.g. operates regionally)", "Insight 2", "Insight 3"],
      "productsServices": ["Service A", "Product B", "Service C"],
      "technologies": ["Tech A (e.g. WordPress)", "Tech B", "Tech C"],
      "competitiveAdvantage": "A sentence describing their edge",
      "targetMarket": "Description of who they sell to",
      "socialLinks": {
        "linkedin": "url",
        "twitter": "url",
        "facebook": "url",
        "instagram": "url",
        "youtube": "url",
        "other": "url"
      },
      "pitchStrategy": "A strategic paragraph explaining HOW to pitch '${productInfo}' to them based on their specific needs found in the analysis.",
      "outreachEmail": "A short, personalized cold email draft to the decision maker (${lead.decisionMakers[0]?.name || 'the team'}) proposing '${productInfo}'."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as EnrichedData;
    } else {
      // Attempt to parse raw text if no code blocks
      return JSON.parse(text) as EnrichedData;
    }
  } catch (e) {
    console.error("Enrichment failed", e);
    return null;
  }
};

function calculateQualityScore(item: any, type: string): number {
  if (type === 'b2c') {
    // B2C Scoring
    let score = 50;
    if (item.summary && item.summary.length > 20) score += 20; // Good context
    if (item.websiteUrl && (item.websiteUrl.includes('instagram') || item.websiteUrl.includes('facebook') || item.websiteUrl.includes('twitter') || item.websiteUrl.includes('tiktok'))) score += 10;
    if (item.decisionMakers && item.decisionMakers[0]?.email) score += 20; // Found profile link
    return Math.min(100, score);
  } else {
    // B2B Scoring
    let score = 50; // Base score for being found
    if (item.websiteUrl && item.websiteUrl.includes('.')) score += 10;
    if (item.decisionMakers && item.decisionMakers.length > 0) {
       score += 20;
       if (item.decisionMakers[0].email) score += 10;
    }
    if (item.generalEmail && item.generalEmail.includes('@')) score += 10;
    if (item.linkedinUrl) score += 5;
    if (item.phoneNumber) score += 5;
    return Math.min(100, score);
  }
}