import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
  const result = await embeddingModel.embedContent("Hello world");
  console.log("Length:", result.embedding.values.length);
}
run();
