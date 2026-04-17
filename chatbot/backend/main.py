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
# Make sure your file is named ik_download.py and accessible in the path
from ik_download import IKApi, FileStorage, get_arg_parser

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# CORS Configuration - Add your production domains to the origins list
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your production domains here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],  # Explicitly specify allowed methods
    allow_headers=["Content-Type", "Authorization"],  # Explicitly specify allowed headers
    expose_headers=[],  # Explicitly specify which headers to expose
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Load environment variables
load_dotenv()

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

# --- Initialize Mistral AI API ---
# Mistral client removed
mistral_client = None

# --- Initialize IK API when FastAPI starts ---
IK_API_KEY = os.environ.get("IK_API_KEY", "") # Get from environment variables
STORAGE_DIR = "./indian_kanoon_cache"

# Create storage directory if it doesn't exist
os.makedirs(STORAGE_DIR, exist_ok=True)

# Default args for uvicorn run
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

try:
    file_storage = FileStorage(STORAGE_DIR)
    # Use DummyArgs by default
    ik_api = IKApi(DummyArgs(), file_storage)
    logger.info("Successfully initialized Indian Kanoon API")
except Exception as e:
    logger.error(f"Failed to initialize Indian Kanoon API: {str(e)}")
    raise

# --- Load NER model when FastAPI starts ---
try:
    model, tokenizer = load_model()
    logger.info("Successfully loaded NER model")
except Exception as e:
    logger.error(f"Failed to load NER model: {str(e)}")
    raise

# Default model preference (can be "mistral" or "gemini")
MODEL_PREFERENCE = "mistral"

class Message(BaseModel):
    role: str
    content: str

class ChatQuery(BaseModel):
    query: str
    history: list[Message] = []

    class Config:
        min_length = 3
        max_length = 1000

    @validator('query')
    def validate_query(cls, v):
        # Remove any potentially harmful characters
        v = re.sub(r'[^\w\s\-.,?!]', '', v)
        if len(v.strip()) < 3:
            raise ValueError('Query must be at least 3 characters long')
        if len(v) > 1000:
            raise ValueError('Query must not exceed 1000 characters')
        return v.strip()

class ModelPreference(BaseModel):
    model: str  # "mistral" or "gemini"

@app.post("/set-model-preference")
async def set_model_preference(preference: ModelPreference):
    """Set the preferred AI model to use for responses."""
    if preference.model not in ["gemini"]:
        raise HTTPException(status_code=400, detail="Invalid model preference. Only 'gemini' is supported currently.")
    
    MODEL_PREFERENCE = "gemini"
    logger.info(f"Model preference set to: {MODEL_PREFERENCE}")
    
    return {"message": f"Model preference set to {MODEL_PREFERENCE}"}

@app.get("/get-model-preference")
async def get_model_preference():
    """Get the current preferred AI model."""
    return {"model": "groq"} # Default to groq for now

# Function to get Gemini response using legal context
async def get_gemini_response(user_query, legal_entities, indian_kanoon_results, history=[]):
    try:
        if not GEMINI_API_KEY:
            return {"gemini_response": "Gemini API key not configured. Please set the GEMINI_API_KEY environment variable."}
        
        # Format history for the prompt
        history_text = ""
        if history:
            history_text = "CONVERSATION HISTORY:\n"
            for msg in history[-5:]: # Last 5 messages for context
                history_text += f"{msg.role.upper()}: {msg.content}\n"
            history_text += "\n"

        # Create a professional prompt for Gemini
        prompt = f"""
        You are an elite Legal Consultant specializing in Indian Law. Your goal is to provide a highly professional, accurate, and structured response.

        CRITICAL CONTEXT: 
        Assume all queries are within the jurisdiction of the Republic of India and prioritize Indian legal practitioners or statutes unless a different country is explicitly requested by the user.

        {history_text}
        CURRENT USER QUERY: {user_query}

        LEGAL ENTITIES: {', '.join(legal_entities) if legal_entities else "General Inquiry"}

        LEGAL CONTEXT (INDIAN KANOON): 
        {json.dumps(indian_kanoon_results, indent=2)}

        TONE AND FORMATTING:
        1. Maintain a formal, authoritative, yet helpful legal tone.
        2. Use clean Markdown: Bold for emphasis, headings (###) for sections.
        3. AVOID technical jargon or raw data in the response.
        4. Use bullet points for clarity.
        5. Structure: Summary -> Legal Analysis -> Recommendations.
        6. DO NOT include meta-talk like "As a lawyer..." or "Based on the input...".
        """
        
        # Call Gemini API
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        return {"gemini_response": response.text}
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return {"gemini_response": f"Error generating response: {str(e)}"}

# Function to get Mistral AI response using legal context
# Function to fetch recommended lawyers from Lawyer Finder service
async def get_recommended_lawyers(query):
    try:
        # Use IPv4 to avoid localhost resolution issues
        search_url = "http://127.0.0.1:3000/api/search"
        async with httpx.AsyncClient() as client:
            response = await client.post(search_url, json={"query": query}, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                if results:
                    markdown = "\n\n### ⚖️ Recommended Lawyers\n"
                    for lawyer in results[:3]: # Show top 3
                        try:
                            # Handle both string and object content
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
    except Exception as e:
        logger.error(f"Error fetching lawyers from service: {e}")
        return ""

# Function to get Groq response using legal context
async def get_groq_response(user_query, legal_entities, indian_kanoon_results, history=[]):
    try:
        if not groq_client:
            return {"response": "Groq API key not configured. Please set the GROQ_API_KEY environment variable."}
        
        # Format history for Groq
        groq_messages = []
        for msg in history[-6:]: # Last 6 messages (3 turns)
            groq_messages.append({
                "role": "assistant" if msg.role == "assistant" else "user",
                "content": msg.content
            })
        
        # Create the system-prompted final message
        prompt = f"""
        You are an elite Legal Consultant specializing in Indian Law. Your goal is to provide a highly professional, accurate, and structured response.

        CRITICAL CONTEXT: 
        Assume all queries are within the jurisdiction of the Republic of India and prioritize Indian legal practitioners or statutes unless a different country is explicitly requested by the user.
        Remember the conversation history provided above.

        USER QUERY: {user_query}

        LEGAL ENTITIES: {', '.join(legal_entities) if legal_entities else "General Inquiry"}

        LEGAL CONTEXT (INDIAN KANOON): 
        {json.dumps(indian_kanoon_results, indent=2)}

        TONE AND FORMATTING:
        1. Maintain a formal, authoritative, yet helpful legal tone.
        2. Use clean Markdown: Bold for emphasis, headings (###) for sections.
        3. AVOID technical jargon or raw data in the response.
        4. Use bullet points for clarity.
        5. Structure: Summary -> Legal Analysis -> Recommendations.
        6. DO NOT include meta-talk like "As a lawyer..." or "Based on the input...".
        """
        
        groq_messages.append({"role": "user", "content": prompt})
        
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=groq_messages,
            model="llama-3.3-70b-versatile",
        )
        
        return {"response": chat_completion.choices[0].message.content}
    except Exception as e:
        logger.error(f"Error calling Groq API: {str(e)}")
        return {"response": f"Error generating response via Groq: {str(e)}"}

@app.post("/chat")
@app.post("/chat/")
@limiter.limit("20/minute")  # Limit to 20 requests per minute per IP
async def chat(request: Request, chat_query: ChatQuery):
    user_query = chat_query.query
    history = chat_query.history
    logger.info(f"User query: {user_query} (History length: {len(history)})")
    
    try:
        # Extract named entities
        entities = extract_ner_entities(user_query, model, tokenizer)
        extracted_entities = [ent[0] for ent in entities if ent[1] != 'O']
        logger.info(f"Extracted entities: {extracted_entities}")
        
        # Search Indian Kanoon if we have entities
        if extracted_entities:
            search_query = " ".join(extracted_entities)
            logger.info(f"Searching Indian Kanoon for: {search_query}")
            
            try:
                results_str = ik_api.search(search_query, pagenum=0, maxpages=1)
                indian_kanoon_results = json.loads(results_str)
                logger.info("Successfully retrieved Indian Kanoon results")
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding Indian Kanoon JSON response: {str(e)}")
                indian_kanoon_results = {"error": "Failed to decode Indian Kanoon response."}
            except Exception as e:
                logger.error(f"Error querying Indian Kanoon API: {str(e)}")
                indian_kanoon_results = {"error": f"Error querying Indian Kanoon: {str(e)}"}
        else:
            logger.info("No relevant entities found to search Indian Kanoon")
            indian_kanoon_results = {"message": "No relevant entities found to search Indian Kanoon."}
        
        # Use the preferred model (with fallbacks)
        lawyer_response = None
        model_used = None
        
        if groq_client:
            logger.info("Using Groq for response generation")
            ai_response = await get_groq_response(user_query, extracted_entities, indian_kanoon_results, history)
            lawyer_response = ai_response["response"]
            model_used = "groq"
        elif GEMINI_API_KEY:
            logger.info("Using Google Gemini for response generation")
            gemini_response = await get_gemini_response(user_query, extracted_entities, indian_kanoon_results, history)
            lawyer_response = gemini_response["gemini_response"]
            model_used = "gemini"
        else:
            logger.warning("No AI service available")
            lawyer_response = "No AI service is configured. Please set GROQ_API_KEY or GEMINI_API_KEY."
            model_used = "none"

        # --- NEW: Fetch Lawyer Recommendations if applicable ---
        lawyer_recommendations = ""
        intent_keywords = ["lawyer", "advocate", "professional", "shrimp", "mumbai", "delhi", "bangalore", "legal help", "help me find"]
        if any(kw in user_query.lower() for kw in intent_keywords):
            logger.info("Fetching live lawyer recommendations...")
            lawyer_recommendations = await get_recommended_lawyers(user_query)
            if lawyer_recommendations:
                lawyer_response += lawyer_recommendations
        
        # Build response with all information
        overall_message = {
            "user_query": user_query,
            "extracted_legal_entities": extracted_entities,
            "indian_kanoon_results": indian_kanoon_results,
            "lawyer_response": lawyer_response,
            "model_used": model_used
        }
        
        return {"response": overall_message}
    
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Legal Assistant API is running!"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Generate request ID
    request_id = str(uuid.uuid4())
    
    # Log request details
    logger.info(f"Request {request_id}: {request.method} {request.url}")
    logger.info(f"Client IP: {request.client.host}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    # Time the request
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Log response details
    logger.info(f"Request {request_id} completed in {process_time:.2f}s with status {response.status_code}")
    
    return response

if __name__ == "__main__":
    import argparse
    import uvicorn
    parser = get_arg_parser()
    args = parser.parse_args()
    file_storage = FileStorage(args.datadir)
    ik_api = IKApi(args, file_storage)
    uvicorn.run(app, host="0.0.0.0", port=8000)