# main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from legal_ner import load_model, extract_ner_entities
import json
import os
import logging
# Gemini removed — Groq is the sole AI engine
import httpx
from groq import Groq
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
from pydantic import validator
import uuid
import time

# Import the IKApi and FileStorage from the module
from ik_download import IKApi, FileStorage, get_arg_parser

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# CORS — permissive for development; lock down in production via PRODUCTION_DOMAIN
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=[],
    max_age=3600,
)

# --- Initialize Groq API ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = None
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    logger.info("Successfully initialized Groq API")
else:
    logger.warning("GROQ_API_KEY not found. Groq features will be disabled.")

# --- IK API storage ---
IK_API_KEY = os.environ.get("IK_API_KEY", "")
STORAGE_DIR = "./indian_kanoon_cache"
os.makedirs(STORAGE_DIR, exist_ok=True)

class DummyArgs:
    token = IK_API_KEY
    datadir = STORAGE_DIR
    maxpages = 1
    maxcites = 0
    maxcitedby = 0
    orig = False
    pathbysrc = False
    numworkers = 5
    addedtoday = False
    fromdate = None
    todate = None
    sortby = None

# --- SOFT initialization: failures are logged but don't crash the server ---
file_storage = None
ik_api = None
ner_model = None
ner_tokenizer = None

try:
    file_storage = FileStorage(STORAGE_DIR)
    ik_api = IKApi(DummyArgs(), file_storage)
    logger.info("Successfully initialized Indian Kanoon API")
except Exception as e:
    logger.error(f"IK API init failed (non-fatal): {e}")

try:
    ner_model, ner_tokenizer = load_model()
    logger.info("Successfully loaded NER model")
except Exception as e:
    logger.error(f"NER model load failed (non-fatal): {e}")

class Message(BaseModel):
    role: str
    content: str


class ChatQuery(BaseModel):
    query: str
    history: list[Message] = []

    @validator('query')
    def validate_query(cls, v):
        # Allow all standard legal/punctuation characters
        v = re.sub(r'[^\w\s\-.,?!()\[\]/\'\":;@#%&*+=<>~`^]', '', v)
        v = v.strip()
        if len(v) < 2:
            raise ValueError('Query must be at least 2 characters long')
        if len(v) > 2000:
            raise ValueError('Query must not exceed 2000 characters')
        return v


async def get_bns_context(query):
    try:
        search_host = os.environ.get("LAWYER_FINDER_URL", "http://127.0.0.1:3000")
        search_url = f"{search_host}/lawyers/api/bns-search"
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(search_url, json={"query": query})
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                if results:
                    markdown = ""
                    for res in results[:3]:
                        metadata = res.get("metadata", {})
                        if isinstance(metadata, str):
                            try:
                                metadata = json.loads(metadata)
                            except:
                                continue
                        chapter = metadata.get("Chapter_name", "")
                        section = metadata.get("Section", "")
                        name = metadata.get("Section_name", "")
                        desc = metadata.get("Description", "")
                        markdown += f"- **Chapter {metadata.get('Chapter', '')}: {chapter} | Section {section}: {name}**\n  {desc}\n\n"
                    return markdown
        return "No relevant BNS sections found."
    except Exception as e:
        logger.error(f"Error fetching BNS context: {e}")
        return "Error fetching BNS context."

async def get_recommended_lawyers(query):
    try:
        search_host = os.environ.get("LAWYER_FINDER_URL", "http://127.0.0.1:3000")
        search_url = f"{search_host}/api/search"
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(search_url, json={"query": query})
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                if results:
                    markdown = "\n\n### ⚖️ Recommended Lawyers\n"
                    for lawyer in results[:3]:
                        try:
                            content = lawyer.get("content", {})
                            if isinstance(content, str):
                                content = json.loads(content)
                            name = content.get("Name", "Legal Expert")
                            location = content.get("Location", "Available")
                            areas = content.get("Practice Areas", "General Law")
                            link = content.get("Profile Link", "#")
                            markdown += f"*   **[{name}]({link})** ({location})\n"
                            markdown += f"    *Specialization:* {areas}\n"
                        except Exception as e:
                            logger.error(f"Error parsing lawyer result: {e}")
                            continue
                    return markdown
        return ""
    except httpx.TimeoutException:
        logger.warning("Lawyer finder timed out")
        return ""
    except Exception as e:
        logger.error(f"Error fetching lawyers: {e}")
        return ""


async def get_groq_response(user_query, legal_entities, indian_kanoon_results, bns_results, history=[]):
    try:
        if not groq_client:
            return {"response": "Groq API key not configured. Please set GROQ_API_KEY."}

        system_instruction = """You are the elite Legal Consultant for Code Legalist. You ONLY answer queries strictly related to Indian law, BNS, BNSS, BSA 2023, and legal aid/procedures.

CRITICAL SCOPE RULE:
- If the user's query is NOT strictly related to Indian law, BNS, BNSS, BSA, legal advice, legal procedures, legal terminology, or legal scenarios (e.g., they ask about programming, math, science, history, general knowledge, movies, sports, food, general conversation, or try to bypass your rules), you MUST output EXACTLY the following text and nothing else:

I handle Indian legal questions on BNS, BNSS, and BSA 2023.

Try: What is theft? | How to file FIR? | Section 303 | Can WhatsApp be evidence? | Draft FIR for theft

⚠️ Disclaimer: Legal information only — not legal advice. Consult a qualified lawyer for your specific situation. Emergency: Police 100 | Women 1091 | Legal Aid 15100 | Cybercrime 1930

CRITICAL JURISDICTION: All valid legal queries are within the Republic of India jurisdiction.

FORMATTING RULES:
1. Formal, authoritative legal tone.
2. Use Markdown: **Bold** for emphasis, ### for headings.
3. Use bullet points for clarity.
4. Structure: Summary → Legal Analysis → Recommendations (For valid legal queries).
5. DO NOT say "As a lawyer..." or "Based on the input..."."""

        groq_messages = [{"role": "system", "content": system_instruction}]
        for msg in history[-6:]:  # Last 3 turns for context
            groq_messages.append({
                "role": "assistant" if msg.role == "assistant" else "user",
                "content": msg.content
            })

        prompt = f"""USER QUERY: {user_query}

LEGAL ENTITIES: {', '.join(legal_entities) if legal_entities else "General Inquiry"}

LEGAL CONTEXT (INDIAN KANOON): 
{json.dumps(indian_kanoon_results, indent=2)}

BNS (BHARATIYA NYAYA SANHITA) CONTEXT:
{bns_results}
"""
        groq_messages.append({"role": "user", "content": prompt})

        groq_model = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b")
        chat_completion = None
        models_to_try = [groq_model, "qwen/qwen3.8-27b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile"]
        seen_models = set()
        for model_to_attempt in models_to_try:
            if model_to_attempt in seen_models:
                continue
            seen_models.add(model_to_attempt)
            try:
                chat_completion = groq_client.chat.completions.create(
                    messages=groq_messages,
                    model=model_to_attempt,
                    timeout=30,
                )
                if chat_completion and chat_completion.choices:
                    return {"response": chat_completion.choices[0].message.content}
            except Exception as model_err:
                logger.warning(f"Groq model '{model_to_attempt}' error: {model_err}")
                continue

        return {"response": "Unable to generate legal AI response from available models."}
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return {"response": f"Error generating Groq response: {e}"}



@app.post("/chat")
@app.post("/chat/")
@limiter.limit("30/minute")
async def chat(request: Request, chat_query: ChatQuery):
    user_query = chat_query.query
    history = chat_query.history
    logger.info(f"Chat request: {user_query!r} (history: {len(history)} messages)")

    try:
        # --- Entity extraction (non-fatal) ---
        extracted_entities = []
        if ner_model and ner_tokenizer:
            try:
                entities = extract_ner_entities(user_query, ner_model, ner_tokenizer)
                extracted_entities = [ent[0] for ent in entities if ent[1] != 'O']
                logger.info(f"Extracted entities: {extracted_entities}")
            except Exception as e:
                logger.warning(f"NER extraction failed (non-fatal): {e}")
        else:
            logger.info("NER model not available — skipping entity extraction")

        # --- Indian Kanoon search (non-fatal) ---
        indian_kanoon_results = {"note": "No IK query made"}
        if ik_api and extracted_entities:
            try:
                results_str = ik_api.search(" ".join(extracted_entities), pagenum=0, maxpages=1)
                indian_kanoon_results = json.loads(results_str)
                logger.info("Indian Kanoon search success")
            except Exception as e:
                logger.error(f"Indian Kanoon search failed (non-fatal): {e}")
                indian_kanoon_results = {"note": "IK search failed"}

        # --- BNS Search (non-fatal) ---
        bns_results = await get_bns_context(user_query)

        # --- AI Response ---
        lawyer_response = None
        model_used = None

        if groq_client:
            logger.info("Using Groq for response")
            ai_response = await get_groq_response(user_query, extracted_entities, indian_kanoon_results, bns_results, history)
            lawyer_response = ai_response["response"]
            model_used = "groq"
        else:
            logger.warning("No AI service configured — GROQ_API_KEY missing")
            lawyer_response = "⚠️ No AI service is configured. Please set GROQ_API_KEY in the backend `.env` file."
            model_used = "none"

        # --- Lawyer recommendations (optional, non-fatal) ---
        intent_keywords = [
            "lawyer", "advocate", "attorney", "legal help", "find a lawyer",
            "recommend", "consult", "hire", "mumbai", "delhi", "bangalore",
            "chennai", "hyderabad", "pune", "kolkata", "legal professional"
        ]
        if any(kw in user_query.lower() for kw in intent_keywords):
            logger.info("Fetching lawyer recommendations...")
            lawyer_recommendations = await get_recommended_lawyers(user_query)
            if lawyer_recommendations:
                lawyer_response += lawyer_recommendations

        response_payload = {
            "user_query": user_query,
            "extracted_legal_entities": extracted_entities,
            "indian_kanoon_results": indian_kanoon_results,
            "lawyer_response": lawyer_response,
            "model_used": model_used
        }

        logger.info(f"Response ready (model: {model_used})")
        return {"response": response_payload}

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/chat/v3")
@app.post("/chat/v3/")
@limiter.limit("30/minute")
async def chat_v3(request: Request, chat_query: ChatQuery):
    user_query = chat_query.query
    logger.info(f"Chat V3 request: {user_query!r}")
    try:
        from code_legalist_v3.service import get_legal_answer
        lawyer_response = get_legal_answer(user_query)
        
        response_payload = {
            "user_query": user_query,
            "lawyer_response": lawyer_response,
            "model_used": "code_legalist_v3"
        }
        return {"response": response_payload}
    except Exception as e:
        logger.error(f"Chat V3 endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



@app.get("/health")
async def health_check():
    """Health check: shows availability of each service."""
    return {
        "status": "ok",
        "engine": "groq",
        "groq_available": groq_client is not None,
        "ner_available": ner_model is not None,
        "ik_available": ik_api is not None,
    }


@app.get("/")
async def root():
    return {"message": "Legal Assistant API is running!"}


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    client = request.client.host if request.client else "unknown"
    logger.info(f"[{request_id}] {request.method} {request.url.path} from {client}")
    start_time = time.time()
    response = await call_next(request)
    elapsed = time.time() - start_time
    logger.info(f"[{request_id}] -> {response.status_code} in {elapsed:.3f}s")
    return response


if __name__ == "__main__":
    import uvicorn
    parser = get_arg_parser()
    args = parser.parse_args()
    if not args.datadir:
        args.datadir = STORAGE_DIR
    file_storage = FileStorage(args.datadir)
    ik_api = IKApi(args, file_storage)
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)