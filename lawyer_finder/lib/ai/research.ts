import Groq from "groq-sdk";

export interface CaseStudy {
    title: string;
    summary: string;
    year: string;
    jurisdiction: string;
    sourceUrl: string;
    relevance: string;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

/**
 * Performs AI-driven research to find case studies related to a query.
 * In a real production app, this would call a Search API like Tavily or SerpApi.
 * For this implementation, we provide a structured way to fetch and categorize results.
 */
export async function performResearch(query: string): Promise<CaseStudy[]> {
    console.log(`Performing deep research for: ${query}`);

    if (!SERPAPI_API_KEY || SERPAPI_API_KEY === "your_serpapi_key_here") {
        console.warn("SerpApi Key not configured. Falling back to simulated research.");
        return performSimulatedResearch(query);
    }

    try {
        // 1. Search via SerpApi (targeting Indian legal sites for better relevance)
        const searchParams = new URLSearchParams({
            q: `legal case studies for "${query}" site:indiankanoon.org OR site:scconline.com`,
            api_key: SERPAPI_API_KEY,
            engine: "google",
            num: "5"
        });

        const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
        const searchResults = await response.json();

        const organicResults = searchResults.organic_results || [];
        if (organicResults.length === 0) {
            return performSimulatedResearch(query);
        }

        // 2. Use Groq to format the real search results into structured CaseStudy objects
        const resultsSnippet = organicResults.map((r: any) =>
            `TITLE: ${r.title}\nLINK: ${r.link}\nSNIPPET: ${r.snippet}`
        ).join("\n\n");

        const prompt = `You are a legal research assistant. Below are search results related to: "${query}"

${resultsSnippet}

Based on these results, extract 2-3 highly relevant legal case studies. 
For each case, MUST provide:
1. title: Exact Case Name
2. summary: 2-3 sentences based on the snippet
3. year: Extract if available, otherwise "N/A"
4. jurisdiction: Supreme Court of India, High Court, etc.
5. sourceUrl: The EXACT "LINK" provided in the search results for this case. DO NOT invented a URL.
6. relevance: Why this relates to the user's query

Format your response as a JSON array of objects with these keys.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional legal researcher. Always return valid JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || "{}";
        const data = JSON.parse(content);
        const cases = data.cases || data.case_studies || (Array.isArray(data) ? data : []);

        return cases.map((c: any) => ({
            title: c.title || c.CaseName || "Sample Case",
            summary: c.summary || c.Summary || "No summary available.",
            year: c.year || c.Year || "N/A",
            jurisdiction: c.jurisdiction || c.Jurisdiction || "N/A",
            sourceUrl: c.sourceUrl || c.SourceURL || "#",
            relevance: c.relevance || c.Relevance || "Directly relevant to your query."
        }));

    } catch (error) {
        console.error("SerpApi Research Error:", error);
        return performSimulatedResearch(query);
    }
}

/**
 * Fallback to AI-driven simulation if search fails or is unconfigured.
 */
async function performSimulatedResearch(query: string): Promise<CaseStudy[]> {
    const prompt = `You are a legal research assistant. The user wants case studies related to: "${query}"

Provide 2-3 highly relevant legal case studies (real-world cases). 
For each case, provide: Title, Summary, Year, Jurisdiction, Source URL (e.g. IndianKanoon), and Relevance.

Format your response as a JSON array of objects.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional legal researcher. Always return valid JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || "{}";
        const data = JSON.parse(content);
        const cases = data.cases || data.case_studies || (Array.isArray(data) ? data : []);

        return cases.map((c: any) => ({
            title: c.title || c.CaseName || "Sample Case",
            summary: c.summary || c.Summary || "No summary available.",
            year: c.year || c.Year || "N/A",
            jurisdiction: c.jurisdiction || c.Jurisdiction || "N/A",
            sourceUrl: c.sourceUrl || c.SourceURL || "#",
            relevance: c.relevance || c.Relevance || "Directly relevant to your query."
        }));
    } catch (error) {
        console.error("Simulation Error:", error);
        return [];
    }
}
