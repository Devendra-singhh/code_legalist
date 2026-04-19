# main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from legal_ner import load_model, extract_ner_entities
import json
import os
import logging
import google.generativeai as genai
# Mistral import removed due to version conflicts
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

# --- Initialize Google Gemini API ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Successfully initialized Google Gemini API")
else:
    logger.warning("GEMINI_API_KEY not found. Gemini features will be disabled.")

# --- Initialize Groq API ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = None
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    logger.info("Successfully initialized Groq API")
else:
    logger.warning("GROQ_API_KEY not found. Groq features will be disabled.")

mistral_client = None  # Mistral removed

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

# Default model preference (global)
MODEL_PREFERENCE = "groq"


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


class ModelPreference(BaseModel):
    model: str  # "gemini" or "groq"


@app.post("/set-model-preference")
async def set_model_preference(preference: ModelPreference):
    """Set the preferred AI model to use for responses."""
    global MODEL_PREFERENCE
    if preference.model not in ["gemini", "groq"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid model preference. Only 'gemini' or 'groq' are supported."
        )
    MODEL_PREFERENCE = preference.model
    logger.info(f"Model preference set to: {MODEL_PREFERENCE}")
    return {"message": f"Model preference set to {MODEL_PREFERENCE}", "model": MODEL_PREFERENCE}


@app.get("/get-model-preference")
async def get_model_preference():
    """Get the current preferred AI model."""
    return {"model": MODEL_PREFERENCE}


async def get_gemini_response(user_query, legal_entities, indian_kanoon_results, history=[]):
    try:
        if not GEMINI_API_KEY:
            return {"gemini_response": "Gemini API key not configured."}

        history_text = ""
        if history:
            history_text = "CONVERSATION HISTORY:\n"
            for msg in history[-5:]:
                history_text += f"{msg.role.upper()}: {msg.content}\n"
            history_text += "\n"

        prompt = f"""You are an elite Legal Consultant specializing in Indian Law. Provide a professional, accurate, structured response.

CRITICAL: All queries are within the Republic of India jurisdiction unless explicitly stated otherwise.

{history_text}CURRENT USER QUERY: {user_query}

LEGAL ENTITIES: {', '.join(legal_entities) if legal_entities else "General Inquiry"}

LEGAL CONTEXT (INDIAN KANOON): 
{json.dumps(indian_kanoon_results, indent=2)}

FORMATTING RULES:
1. Formal, authoritative legal tone.
2. Use Markdown: **Bold** for emphasis, ### for headings.
3. Use bullet points for clarity.
4. Structure: Summary → Legal Analysis → Recommendations.
5. DO NOT say "As a lawyer..." or "Based on the input...".
"""
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content(prompt)
        return {"gemini_response": response.text}
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return {"gemini_response": f"Error generating Gemini response: {e}"}


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


async def get_groq_response(user_query, legal_entities, indian_kanoon_results, history=[]):
    try:
        if not groq_client:
            return {"response": "Groq API key not configured. Please set GROQ_API_KEY."}

        groq_messages = []
        for msg in history[-6:]:  # Last 3 turns for context
            groq_messages.append({
                "role": "assistant" if msg.role == "assistant" else "user",
                "content": msg.content
            })

        prompt = f"""You are an elite Legal Consultant specializing in Indian Law. Provide a professional, accurate, structured response.

CRITICAL: All queries are within the Republic of India jurisdiction. Use conversation history above for follow-up context.

USER QUERY: {user_query}

LEGAL ENTITIES: {', '.join(legal_entities) if legal_entities else "General Inquiry"}

LEGAL CONTEXT (INDIAN KANOON): 
{json.dumps(indian_kanoon_results, indent=2)}

FORMATTING RULES:
1. Formal, authoritative legal tone.
2. Use Markdown: **Bold** for emphasis, ### for headings.
3. Use bullet points for clarity.
4. Structure: Summary → Legal Analysis → Recommendations.
5. DO NOT say "As a lawyer..." or "Based on the input...".
"""
        groq_messages.append({"role": "user", "content": prompt})

        chat_completion = groq_client.chat.completions.create(
            messages=groq_messages,
            model="llama-3.3-70b-versatile",
            timeout=30,
        )
        return {"response": chat_completion.choices[0].message.content}
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

        # --- AI Response ---
        lawyer_response = None
        model_used = None

        if groq_client:
            logger.info("Using Groq for response")
            ai_response = await get_groq_response(user_query, extracted_entities, indian_kanoon_results, history)
            lawyer_response = ai_response["response"]
            model_used = "groq"
        elif GEMINI_API_KEY:
            logger.info("Using Gemini for response")
            gemini_response = await get_gemini_response(user_query, extracted_entities, indian_kanoon_results, history)
            lawyer_response = gemini_response["gemini_response"]
            model_used = "gemini"
        else:
            logger.warning("No AI service configured")
            lawyer_response = "⚠️ No AI service is configured. Please set GROQ_API_KEY or GEMINI_API_KEY in the backend `.env` file."
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


@app.get("/health")
async def health_check():
    """Health check: shows availability of each service."""
    return {
        "status": "ok",
        "model_preference": MODEL_PREFERENCE,
        "groq_available": groq_client is not None,
        "gemini_available": bool(GEMINI_API_KEY),
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