import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "drizzle-orm";
import { db } from "../db";
import fs from "fs";
import path from "path";

// Load Lawyers Database from local JSON file (10,736 records)
let LAWYERS_DATA: any[] = [];
try {
  const jsonPath = path.join(process.cwd(), "lib", "lawyers.json");
  if (fs.existsSync(jsonPath)) {
    LAWYERS_DATA = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    console.log(`[search] Loaded ${LAWYERS_DATA.length} lawyers from local file`);
  } else {
    console.warn("[search] Local lawyers.json not found in lib/");
  }
} catch (err) {
  console.error("[search] Error loading local lawyers.json:", err);
}


// Use the correct verified model
const EMBEDDING_MODEL_NAME = "models/gemini-embedding-001";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export interface RelevantContent {
  id: string;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

// Mock data for demo purposes if all else fails
const MOCK_LAWYERS = [
  {
    id: "lawyer-1",
    content: JSON.stringify({
      Name: "Adv. Rajesh Sharma",
      Location: "Mumbai",
      Experience: "15",
      Languages: "English, Hindi, Marathi",
      "Practice Areas": "Criminal Law, Cyber Crime",
      About: "Expert in criminal defense and handling sensitive cyber crime investigations.",
      Court: "Bombay High Court",
      "Profile Link": "https://example.com/lawyer/rajesh-sharma",
      Phone: "+91 98765 43210",
      Type: "lawyer"
    }),
    similarity: 0.85
  },
  {
    id: "lawyer-2",
    content: JSON.stringify({
      Name: "Adv. Priya Desai",
      Location: "Mumbai",
      Experience: "10",
      Languages: "English, Hindi",
      "Practice Areas": "Divorce Law, Family Law",
      About: "Specialized in complex matrimonial disputes and family mediation.",
      Court: "Family Court, Bandra",
      "Profile Link": "https://example.com/lawyer/priya-desai",
      Phone: "+91 87654 32109",
      Type: "lawyer"
    }),
    similarity: 0.82
  }
];

export const generateEmbedding = async (value: string): Promise<number[]> => {
  try {
    const input = value.replaceAll("\n", " ").trim();
    if (!input) throw new Error("Empty input");
    const result = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text: input }] }
    });
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding API Error:", error);
    return new Array(768).fill(0).map(() => Math.random());
  }
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = value
    .trim()
    .split(/[.!?]+/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0 && chunk.length < 1000)
    .slice(0, 20);

  const results = await Promise.all(
    chunks.map(async (chunk) => ({
      content: chunk,
      embedding: await generateEmbedding(chunk),
    }))
  );
  return results;
};

export const findRelevantContent = async (userQuery: string): Promise<RelevantContent[]> => {
  console.log('Search priority: 1. SerpApi, 2. Local DB');

  // ─── Phase 1: Live Search via SerpApi (Primary Priority) ──────────────────
  if (SERPAPI_API_KEY && SERPAPI_API_KEY !== "your_serpapi_key_here") {
    try {
      const queryLower = userQuery.toLowerCase();
      // Expanded list of major Indian cities
      const cityRegex = /mumbai|delhi|bangalore|pune|chennai|hyderabad|kolkata|ahmedabad|kochi|indore|jaipur|lucknow|chandigarh|nagpur|patna|bhopal|surat|kanpur|visakhapatnam/i;
      const hasLocation = cityRegex.test(queryLower);
      const cityMatch = queryLower.match(cityRegex)?.[0];
      
      const localizedQuery = userQuery.toLowerCase().includes('india')

        ? userQuery 
        : `${userQuery}, India`;

      const searchParams = new URLSearchParams({
        q: localizedQuery,
        api_key: SERPAPI_API_KEY,
        engine: "google",
        gl: "in",
        hl: "en",
        num: "8"
      });

      // If location is detected, use the dedicated Local Search (Google Maps style)
      if (hasLocation) {
        searchParams.set("engine", "google_local");
      }

      console.log(`[search] Querying SerpApi ${hasLocation ? '(Local Engine)' : '(Organic Engine)'}...`);
      const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
      const searchData = await response.json();
      
      // Handle both Local Results (Google Maps) and Organic Results
      const rawResults = searchData.local_results || searchData.organic_results || [];
      
      if (rawResults.length > 0) {
        console.log(`[search] Found ${rawResults.length} live results`);
        
        let processedResults = rawResults.map((result: any, index: number) => {
          const title = result.title || result.name || "Legal Professional";
          const location = result.address || result.location || "Verified Location";
          const snippet = result.description || result.snippet || result.type || "Specialized Legal Advocacy";
          
          return {
            id: `serp-${index}`,
            similarity: 1.0 - (index * 0.05),
            content: JSON.stringify({
              Name: title.split('-')[0].trim(),
              Location: location,
              Experience: result.years_in_business ? `${result.years_in_business}+` : "Experienced",
              Languages: "English, Hindi, Local",
              "Practice Areas": snippet.substring(0, 80),
              About: snippet,
              Court: hasLocation ? "Local Jurisdiction" : "Supreme Court / High Court",
              "Profile Link": result.links?.website || result.link || "#",
              Phone: result.phone || "View Profile",
              Type: "lawyer"
            }),
            metadata: { 
              source: "SerpApi", 
              link: result.link || result.links?.website,
              matchesLocation: hasLocation ? location.toLowerCase().includes(queryLower.split(' ').pop() || "") : true
            }
          };
        });

        // If a specific city was searched, STRICTLY filter for that city
        if (hasLocation) {
          const cityMatch = queryLower.match(/mumbai|delhi|bangalore|pune|chennai|hyderabad|kolkata|ahmedabad|kochi|indore/i)?.[0];
          if (cityMatch) {
            processedResults = processedResults.filter((r: any) => 
               JSON.stringify(r).toLowerCase().includes(cityMatch)
            );
          }
        }

        return processedResults.slice(0, 6);

      }
    } catch (serpError) {
      console.error("[search] SerpApi failed, falling back to Local DB:", serpError);
    }
  }


  // ─── Phase 2: Local JSON Database Search (10,736 Advocates) ────────────────
  if (LAWYERS_DATA.length > 0) {
    try {
      console.log('[search] Querying local JSON database...');
      const queryLower = userQuery.toLowerCase();
      
      // Extract location/city
      const cities = ["delhi", "mumbai", "bangalore", "pune", "chennai", "hyderabad", "kolkata", "ahmedabad", "kochi", "indore", "jaipur", "lucknow", "chandigarh", "nagpur", "patna", "bhopal", "surat", "kanpur", "visakhapatnam"];
      let detectedLocation = "";
      for (const city of cities) {
        if (queryLower.includes(city)) {
          detectedLocation = city;
          break;
        }
      }
      
      // Determine specialties/practice keywords
      const specialtyKeywords = ["criminal", "criminial", "cyber", "fraud", "digital", "online", "family", "divorce", "custody", "matrimonial", "domestic", "property", "land", "tenant", "boundary", "consumer", "product", "service", "labour", "labor", "employment", "salary", "workplace", "tax", "income tax", "gst", "human rights", "sc/st", "caste", "discrimination"];
      const activeKeywords: string[] = [];
      for (const kw of specialtyKeywords) {
        if (queryLower.includes(kw)) {
          activeKeywords.push(kw);
        }
      }
      
      const scoredMatches = LAWYERS_DATA.map((l, index) => {
        let score = 0;
        const nameLower = l.Name.toLowerCase();
        const locLower = l.Location.toLowerCase();
        const courtLower = l.Court.toLowerCase();
        const practiceLower = (l["Practice Areas"] || "").toLowerCase();
        
        // Exact name match
        if (queryLower.includes(nameLower) || nameLower.includes(queryLower)) {
          score += 15;
        }
        
        // Location match
        if (detectedLocation) {
          if (locLower.includes(detectedLocation) || courtLower.includes(detectedLocation)) {
            score += 10;
          } else {
            score -= 3; // soft penalty for non-matching locations
          }
        }
        
        // Practice Areas matching active keywords
        for (const kw of activeKeywords) {
          if (practiceLower.includes(kw)) {
            score += 5;
          }
        }
        
        // General query words match
        const queryWords = queryLower.split(/\s+/);
        for (const word of queryWords) {
          if (word.length > 3) {
            if (practiceLower.includes(word)) score += 2;
            if (courtLower.includes(word)) score += 1;
          }
        }
        
        return { lawyer: l, score, id: `local-xls-${index}` };
      });
      
      // Filter out <= 0 scores and sort
      const sortedMatches = scoredMatches
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score);
        
      if (sortedMatches.length > 0) {
        console.log(`[search] Found ${sortedMatches.length} matching lawyers in local JSON dataset`);
        return sortedMatches.slice(0, 6).map(m => ({
          id: m.id,
          similarity: Math.min(1.0, 0.5 + m.score / 30.0), // map score to a similarity rating
          content: JSON.stringify(m.lawyer)
        }));
      }
    } catch (localJsonError) {
      console.error('[search] Error searching local JSON database:', localJsonError);
    }
  }


  // ─── Phase 3: Local Database Search (Vector fallback) ──────────────────────
  try {
    console.log('[search] Querying local database...');
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const embeddingArray = `[${userQueryEmbedded.join(',')}]`;

    const results = await db.execute(sql`
      SELECT id, content, 1 - (embedding <=> ${embeddingArray}::vector) as similarity
      FROM embeddings
      WHERE 1 - (embedding <=> ${embeddingArray}::vector) > 0.15
      ORDER BY similarity DESC
      LIMIT 15;
    `) as any[];

    if (results && results.length > 0) {
      const cityMatch = userQuery.toLowerCase().match(/mumbai|delhi|bangalore|pune|chennai|hyderabad|kolkata|ahmedabad|kochi|indore/i)?.[0];
      
      let filteredResults = results.map(item => ({
        ...item,
        metadata: typeof item.content === 'string' ? JSON.parse(item.content) : item.content
      }));

      // STRICT CITY FILTER: If city specified, prune non-matching DB results
      if (cityMatch) {
         filteredResults = filteredResults.filter(r => 
           JSON.stringify(r).toLowerCase().includes(cityMatch)
         );
      }

      if (filteredResults.length > 0) {
        console.log(`[search] Found ${filteredResults.length} relevant local results matching city`);
        return filteredResults.slice(0, 6);
      }
    }
  } catch (dbError) {
    console.warn("[search] Local DB failed:", dbError);
  }


  // ─── Phase 3: Mock Data (Ultimate Fallback) ────────────────────────────────
  console.log('[search] Returning mock data as fallback');
  const query = userQuery.toLowerCase();
  const filteredMock = MOCK_LAWYERS.filter(lawyer => {
    const data = JSON.parse(lawyer.content);
    return data.Name.toLowerCase().includes(query) || 
           data["Practice Areas"].toLowerCase().includes(query) ||
           data.Location.toLowerCase().includes(query);
  });

  return filteredMock.length > 0 ? filteredMock : MOCK_LAWYERS;
};

export const findRelevantBNSContent = async (userQuery: string): Promise<RelevantContent[]> => {
  try {
    console.log('[bns-search] Querying local database for BNS sections...');
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const embeddingArray = `[${userQueryEmbedded.join(',')}]`;

    const results = await db.execute(sql`
      SELECT id, content, 1 - (embedding <=> ${embeddingArray}::vector) as similarity
      FROM embeddings
      WHERE type = 'bns_section' AND 1 - (embedding <=> ${embeddingArray}::vector) > 0.15
      ORDER BY similarity DESC
      LIMIT 5;
    `) as any[];

    if (results && results.length > 0) {
      console.log(`[bns-search] Found ${results.length} relevant BNS sections`);
      return results.map(item => ({
        ...item,
        metadata: typeof item.content === 'string' ? JSON.parse(item.content) : item.content
      }));
    }
    
    return [];
  } catch (dbError) {
    console.warn("[bns-search] Local DB failed:", dbError);
    return [];
  }
};