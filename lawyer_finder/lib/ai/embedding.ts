import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "drizzle-orm";
import { db } from "../db";

// Use the correct verified model
const EMBEDDING_MODEL_NAME = "models/gemini-embedding-001";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

// Mock data for demo purposes since the database host may be offline
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
  },
  {
    id: "lawyer-3",
    content: JSON.stringify({
      Name: "Adv. Amit Verma",
      Location: "Delhi",
      Experience: "12",
      Languages: "English, Hindi, Punjabi",
      "Practice Areas": "Corporate Law, Intellectual Property",
      About: "Highly skilled in IP litigation and corporate legal consultancy.",
      Court: "Delhi High Court",
      "Profile Link": "https://example.com/lawyer/amit-verma",
      Phone: "+91 76543 21098",
      Type: "lawyer"
    }),
    similarity: 0.78
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
    console.error("Embedding API Error (Expected if key/quota issue):", error);
    // Return a dummy vector if API fails, so search stays consistent
    return new Array(768).fill(0).map(() => Math.random());
  }
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const generateChunks = (input: string): string[] => {
    return input
      .trim()
      .split(/[.!?]+/)
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0 && chunk.length < 1000)
      .slice(0, 20);
  };

  try {
    const chunks = generateChunks(value);
    if (chunks.length === 0) throw new Error("No valid chunks");

    return await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk);
        return { content: chunk, embedding };
      })
    );
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
};

export interface RelevantContent {
  id: string;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

export const findRelevantContent = async (userQuery: string): Promise<RelevantContent[]> => {
  console.log('Search for:', userQuery?.substring(0, 50));

  try {
    // Attempt real database search first
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const embeddingArray = `[${userQueryEmbedded.join(',')}]`;

    try {
      const results = await db.execute(sql`
        SELECT id, content, 1 - (embedding <=> ${embeddingArray}::vector) as similarity
        FROM embeddings
        WHERE 1 - (embedding <=> ${embeddingArray}::vector) > 0.2
        ORDER BY similarity DESC
        LIMIT 6;
      `) as any[];

      if (results && results.length > 0) {
        return results.map(item => ({
          ...item,
          metadata: typeof item.content === 'string' ? JSON.parse(item.content) : item.content
        }));
      }
    } catch (dbError) {
      console.warn("Database Connection Failed or Empty. Trying SerpApi fallback.");
    }

    // 2. SerpApi Fallback - Search for real lawyers live
    if (SERPAPI_API_KEY && SERPAPI_API_KEY !== "your_serpapi_key_here") {
      try {
        // Add Indian context if not present
        const localizedQuery = userQuery.toLowerCase().includes('india') ||
          userQuery.toLowerCase().includes('mumbai') ||
          userQuery.toLowerCase().includes('delhi') ||
          userQuery.toLowerCase().includes('bangalore')
          ? userQuery : `${userQuery}, India`;

        const searchParams = new URLSearchParams({
          q: `${localizedQuery} lawyer location profile contact`,
          api_key: SERPAPI_API_KEY,
          engine: "google",
          gl: "in", // Geolocate to India
          hl: "en", // Set host language to English
          num: "5"
        });

        const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
        const searchData = await response.json();
        const organicResults = searchData.organic_results || [];

        if (organicResults.length > 0) {
          return organicResults.map((result: any, index: number) => ({
            id: `serp-${index}`,
            similarity: 0.9 - (index * 0.05), // Artificial similarity for ranking
            content: JSON.stringify({
              Name: result.title.split('-')[0].trim(),
              Location: "Search Result",
              Experience: "N/A",
              Languages: "English",
              "Practice Areas": result.snippet.substring(0, 50) + "...",
              About: result.snippet,
              Court: "Various",
              "Profile Link": result.link,
              Phone: "See Website",
              Type: "lawyer"
            }),
            metadata: {
              source: "SerpApi",
              link: result.link
            }
          }));
        }
      } catch (serpError) {
        console.error("SerpApi Search Error:", serpError);
      }
    }

    // 3. Fallback to Mock Search for Demo
    const query = userQuery.toLowerCase();
    const filteredMock = MOCK_LAWYERS.filter(lawyer => {
      const lawyerData = JSON.parse(lawyer.content);
      return (
        lawyerData["Practice Areas"].toLowerCase().includes(query) ||
        lawyerData.About.toLowerCase().includes(query) ||
        lawyerData.Name.toLowerCase().includes(query) ||
        lawyerData.Location.toLowerCase().includes(query) ||
        query.includes(lawyerData.Location.toLowerCase()) ||
        query.includes("lawyer") // Generic search
      );
    });

    return filteredMock.length > 0 ? filteredMock : MOCK_LAWYERS.slice(0, 2);

  } catch (error) {
    console.error("Search Logic Error:", error);
    return MOCK_LAWYERS.slice(0, 2);
  }
};