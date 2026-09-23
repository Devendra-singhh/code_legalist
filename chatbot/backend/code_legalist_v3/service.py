# service.py
# ================================================================
# CODELEGALIST 3.0 — LOCAL SERVICE INTEGRATION
# ================================================================

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
import os
import re
import pandas as pd
from typing import List, Dict, Optional, Tuple
from datetime import date
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ================================================================
# GROQ CLIENT SETUP
# ================================================================

_NON_LEGAL_GROQ_PATTERNS = [
    r'\b(weather|temperature|rain|sunny|forecast|climate)\b',
    r'\b(c\+\+|java\b|python code|programming|oop|object.oriented|algorithm|compile|syntax)\b',
    r'\b(recipe|food|cook|pizza|restaurant|dinner|breakfast|lunch)\b',
    r'\b(cricket|ipl|football|soccer|sports|match score|cricket score)\b',
    r'\b(movie|film|song|music|actor|actress|bollywood|netflix)\b',
    r'\b(stock market|share price|nifty|sensex|crypto price)\b',
    r'\b(whats up|how are you|good morning|hello there)\b',
]

try:
    from groq import Groq as GroqClient
    _GROQ_KEY = os.environ.get("GROQ_API_KEY", "")
    groq_client = GroqClient(api_key=_GROQ_KEY) if _GROQ_KEY else None
    if groq_client:
        print("✅ CodeLegalist V3: Groq client initialised")
    else:
        print("⚠️  CodeLegalist V3: GROQ_API_KEY not set — Groq layer disabled")
except ImportError:
    groq_client = None
    print("⚠️  CodeLegalist V3: groq package not installed — Groq layer disabled")

GROQ_MODEL = "llama-3.3-70b-versatile"


def groq_answer(query: str, top_sections: List[Dict]) -> Optional[str]:
    if groq_client is None or not top_sections:
        return None
    q_lower = query.lower()
    if any(re.search(p, q_lower) for p in _NON_LEGAL_GROQ_PATTERNS):
        return None
    context_parts = []
    for r in top_sections[:5]:
        context_parts.append(
            f"[{r['law']} Section {r['section']} — {r['title']}]\n"
            f"{r['content'][:600]}"
        )
    context_str = "\n\n---\n\n".join(context_parts)
    system_prompt = (
        "You are CodeLegalist, an AI Indian legal assistant specialising in "
        "BNS 2023, BNSS 2023, and BSA 2023.\n\n"
        "Rules:\n"
        "- Use ONLY the legal context provided below. Do not use outside knowledge.\n"
        "- Select the most relevant section(s) for the user's question.\n"
        "- Cite section numbers and law names in your answer.\n"
        "- If no confident match exists in the context, reply exactly: "
        "\"No confident legal match found.\"\n"
        "- Do not answer questions outside Indian law (BNS/BNSS/BSA).\n"
        "- Keep answers clear, structured, and under 400 words.\n\n"
        f"LEGAL CONTEXT:\n{context_str}"
    )
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": query},
            ],
            max_tokens=600,
            temperature=0.1,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"⚠️  CodeLegalist V3: Groq call failed: {e}")
        return None


def groq_rerank(query: str, results: List[Dict]) -> List[Dict]:
    if groq_client is None or not results:
        return results
    
    to_rank = results[:6]
    sections_info = []
    for idx, r in enumerate(to_rank):
        sections_info.append(
            f"Index: {idx}\n"
            f"Law: {r['law']}\n"
            f"Section: {r['section']}\n"
            f"Title: {r['title']}\n"
            f"Content: {r['content'][:400]}..."
        )
    sections_str = "\n\n".join(sections_info)
    
    system_prompt = (
        "You are an expert Indian legal assistant. Your task is to rank the retrieved legal sections by their direct legal relevance to the user's query.\n"
        "Return ONLY a comma-separated list of the indices in order of relevance, from most relevant to least relevant (e.g., '1,0,2').\n"
        "Rules:\n"
        "- Do not explain your reasoning.\n"
        "- Do not invent sections or indices.\n"
        "- Only output the list of indices, nothing else."
    )
    
    user_prompt = (
        f"User Query: {query}\n\n"
        f"Retrieved Sections:\n{sections_str}\n\n"
        "Ranked indices (comma-separated):"
    )
    
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            max_tokens=30,
            temperature=0.0,
        )
        ranked_str = response.choices[0].message.content.strip()
        indices = []
        for val in ranked_str.split(','):
            val_clean = ''.join(c for c in val if c.isdigit())
            if val_clean:
                idx = int(val_clean)
                if 0 <= idx < len(to_rank) and idx not in indices:
                    indices.append(idx)
        
        reranked = [to_rank[i] for i in indices]
        for i in range(len(to_rank)):
            if i not in indices:
                reranked.append(to_rank[i])
        
        return reranked + results[len(to_rank):]
    except Exception as e:
        print(f"⚠️  CodeLegalist V3: Groq re-ranking failed: {e}")
        return results



# ================================================================
# 1 — LOCAL DATASET LOADING
# ================================================================

def load_local_dataset(name: str, label: str):
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_dir, "datasets", f"{name}.csv")
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Local CSV dataset not found at {csv_path}")
        df = pd.read_csv(csv_path)
        ds = df.to_dict(orient="records")
        print(f"✅ CodeLegalist V3: Loaded {label} ({len(ds)} rows)")
        return ds
    except Exception as e:
        print(f"❌ CodeLegalist V3: Failed to load {label} locally: {e}")
        return None


bns_dataset  = load_local_dataset("bns",  "BNS")
bnss_dataset = load_local_dataset("bnss", "BNSS")
bsa_dataset  = load_local_dataset("bsa",  "BSA")


# ================================================================
# 2 — SCHEMA-AWARE DOCUMENT BUILDERS
# ================================================================

def get_col(item, *keys) -> str:
    for k in keys:
        if k in item:
            return str(item[k]).strip()
    return ""


def build_bns_docs(ds, label: str) -> List[Document]:
    if ds is None:
        return []
    docs = []
    for item in ds:
        sec   = get_col(item, "Section",         "section")
        title = get_col(item, "Section _name",   "Section_name", "section_name", "title")
        ch    = get_col(item, "Chapter",         "chapter")
        ch_nm = get_col(item, "Chapter_name",    "chapter_name")
        sub   = get_col(item, "Chapter_subtype", "chapter_subtype")
        desc  = get_col(item, "Description",     "description")
        content = (
            f"Law: {label}\nChapter: {ch} — {ch_nm} ({sub})\n"
            f"Section: {sec} — {title}\n\nDescription:\n{desc}"
        )
        docs.append(Document(
            page_content=content,
            metadata={"law": label, "section": sec, "title": title}
        ))
    print(f"   {label}: {len(docs)} docs built")
    return docs


def build_bnss_docs(ds) -> List[Document]:
    if ds is None:
        return []
    docs = []
    for item in ds:
        sec   = get_col(item, "section_no", "Section",      "section")
        title = get_col(item, "title",      "Title",        "Section _name", "section_name")
        ch    = get_col(item, "chapter",    "Chapter")
        body  = get_col(item, "body",       "Body",         "description",   "Description")
        content = f"Law: BNSS\nChapter: {ch}\nSection: {sec} — {title}\n\nDescription:\n{body}"
        docs.append(Document(
            page_content=content,
            metadata={"law": "BNSS", "section": sec, "title": title}
        ))
    print(f"   BNSS: {len(docs)} docs built")
    return docs


def build_bsa_docs(ds) -> List[Document]:
    if ds is None:
        return []
    sample = ds[0]
    if "body" in sample or "section_no" in sample:
        docs = []
        for item in ds:
            sec   = get_col(item, "section_no", "Section",  "section")
            title = get_col(item, "title",      "Title",    "Section _name", "section_name")
            ch    = get_col(item, "chapter",    "Chapter")
            body  = get_col(item, "body",       "Body",     "description",   "Description")
            content = f"Law: BSA\nChapter: {ch}\nSection: {sec} — {title}\n\nDescription:\n{body}"
            docs.append(Document(
                page_content=content,
                metadata={"law": "BSA", "section": sec, "title": title}
            ))
        print(f"   BSA: {len(docs)} docs built (BNSS-style schema)")
        return docs
    return build_bns_docs(ds, "BSA")


bns_docs  = build_bns_docs(bns_dataset,  "BNS")
bnss_docs = build_bnss_docs(bnss_dataset)
bsa_docs  = build_bsa_docs(bsa_dataset)


# ================================================================
# 3 — O(1) SECTION INDEXES
# ================================================================

BNS_IDX:  Dict[str, Document] = {d.metadata["section"]: d for d in bns_docs}
BNSS_IDX: Dict[str, Document] = {d.metadata["section"]: d for d in bnss_docs}
BSA_IDX:  Dict[str, Document] = {d.metadata["section"]: d for d in bsa_docs}
ALL_IDXS = {"BNS": BNS_IDX, "BNSS": BNSS_IDX, "BSA": BSA_IDX}

BNS_TITLE  = {d.metadata["section"]: d.metadata["title"] for d in bns_docs}
BNSS_TITLE = {d.metadata["section"]: d.metadata["title"] for d in bnss_docs}
BSA_TITLE  = {d.metadata["section"]: d.metadata["title"] for d in bsa_docs}

BNS_SECS  = set(BNS_IDX)
BNSS_SECS = set(BNSS_IDX)
BSA_SECS  = set(BSA_IDX)


# ================================================================
# 4 — FAISS CACHING + VECTORSTORES
# ================================================================

base_dir = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(base_dir, "faiss_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

print("CodeLegalist V3: Loading embeddings model...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


def get_vectorstore(docs: List[Document], label: str):
    if not docs:
        print(f"⚠️  {label}: skipped — no docs")
        return None
    path = os.path.join(CACHE_DIR, label.lower())
    if os.path.exists(path):
        try:
            vs = FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
            print(f"✅ {label}: loaded from cache")
            return vs
        except Exception as e:
            print(f"⚠️  {label}: cache failed ({e}) — rebuilding")
    vs = FAISS.from_documents(docs, embeddings)
    vs.save_local(path)
    print(f"✅ {label}: built and cached")
    return vs


bns_vs  = get_vectorstore(bns_docs,  "BNS")
bnss_vs = get_vectorstore(bnss_docs, "BNSS")
bsa_vs  = get_vectorstore(bsa_docs,  "BSA")
VS = {"bns": bns_vs, "bnss": bnss_vs, "bsa": bsa_vs}


# ================================================================
# 5 — DYNAMIC SECTION DISCOVERY
# ================================================================

def find_section(docs: List[Document], *keywords) -> Optional[str]:
    kws = [k.lower() for k in keywords]
    for strict in [True, False]:
        for d in docs:
            t = d.metadata["title"].lower()
            match = all(k in t for k in kws) if strict else any(k in t for k in kws)
            if match:
                return d.metadata["section"]
    return None


DYN: Dict[str, Optional[str]] = {
    "murder"            : find_section(bns_docs, "murder"),
    "culpable_homicide" : find_section(bns_docs, "culpable homicide"),
    "attempt_murder"    : find_section(bns_docs, "attempt", "murder"),
    "hurt"              : find_section(bns_docs, "causing hurt"),
    "grievous_hurt"     : find_section(bns_docs, "grievous hurt"),
    "rape_def"          : find_section(bns_docs, "rape"),
    "modesty"           : find_section(bns_docs, "outrage", "modesty"),
    "sexual_harassment" : find_section(bns_docs, "sexual harassment"),
    "stalking"          : find_section(bns_docs, "stalking"),
    "voyeurism"         : find_section(bns_docs, "voyeurism"),
    "domestic_cruelty"  : find_section(bns_docs, "cruelty", "husband"),
    "theft"             : find_section(bns_docs, "theft"),
    "snatching"         : find_section(bns_docs, "snatching"),
    "robbery"           : find_section(bns_docs, "robbery"),
    "dacoity"           : find_section(bns_docs, "dacoity"),
    "extortion"         : find_section(bns_docs, "extortion"),
    "cheating"          : find_section(bns_docs, "cheating"),
    "intimidation"      : find_section(bns_docs, "criminal intimidation"),
    "kidnapping"        : find_section(bns_docs, "kidnapping"),
    "abduction"         : find_section(bns_docs, "abduction"),
    "defamation"        : find_section(bns_docs, "defamation"),
    "forgery"           : find_section(bns_docs, "forgery"),
    "trespass"          : find_section(bns_docs, "trespass"),
    "rape_punishment"       : find_section(bns_docs, "punishment for rape"),
    "murder_punishment"     : find_section(bns_docs, "punishment", "murder"),
    "robbery_punishment"    : find_section(bns_docs, "punishment", "robbery"),
    "dacoity_punishment"    : find_section(bns_docs, "punishment", "dacoity"),
    "extortion_punishment"  : find_section(bns_docs, "punishment", "extortion"),
    "kidnapping_punishment" : find_section(bns_docs, "punishment", "kidnapping"),
    "cheating_punishment"   : find_section(bns_docs, "punishment", "cheating"),
}

# Critical overrides — never rely on fuzzy discovery for these
DYN["theft"]         = "303"
DYN["robbery"]       = "309"
DYN["dacoity"]       = "310"
DYN["cheating"]      = "318"
DYN["intimidation"]  = "351"
DYN["grievous_hurt"] = "117"
DYN["trespass"]      = "329"

print(f"CodeLegalist V3: {sum(1 for v in DYN.values() if v)}/{len(DYN)} BNS sections resolved")

# Startup assertions
_REQUIRED = {"303": "Theft", "309": "Robbery", "310": "Dacoity",
             "318": "Cheating", "351": "Criminal Intimidation", "117": "Grievous Hurt"}
for _sec, _name in _REQUIRED.items():
    assert _sec in BNS_IDX, f"❌ CodeLegalist V3 STARTUP FAIL: BNS Section {_sec} ({_name}) not in index."
print("✅ CodeLegalist V3: All required BNS sections present")


# ================================================================
# INTERCEPTORS
# ================================================================

THEFT_EXPLICIT_KWS = [
    "theft", "steal", "stole", "stolen", "pickpocket", "shoplifting",
    "bike stolen", "phone stolen", "mobile stolen", "wallet stolen",
    "laptop stolen", "car stolen", "scooter stolen", "bicycle stolen",
    "wallet missing", "phone missing", "bike missing", "car missing",
    "laptop missing", "jewellery missing", "mobile missing",
    "taken away", "took my", "lifted my", "lost due to theft",
]
THEFT_SCENARIO_ITEMS = [
    "bike", "bicycle", "wallet", "mobile", "phone", "laptop",
    "scooter", "car", "jewellery", "cash", "purse", "bag",
]
THEFT_SCENARIO_VERBS = [
    "stole", "stolen", "steal", "took", "missing", "snatched",
    "pickpocket", "vanished", "disappeared", "gone", "lifted",
]

def is_theft_query(query: str) -> bool:
    q = query.lower()
    if any(kw in q for kw in THEFT_EXPLICIT_KWS):
        return True
    has_verb = any(v in q for v in THEFT_SCENARIO_VERBS)
    has_item = any(item in q for item in THEFT_SCENARIO_ITEMS)
    return has_verb and has_item


ROBBERY_KWS = [
    "robbery", "robbed",
    "gunpoint", "knife point", "held at gunpoint",
    "threatened and took", "forcefully took", "under threat",
    "loot", "looted", "looted me",
    "mugged", "mugging",
]

def is_robbery_query(query: str) -> bool:
    q = query.lower()
    if any(w in q for w in ROBBERY_KWS):
        return True
    if "threat" in q and any(
        w in q for w in ["took", "phone", "wallet", "money", "cash",
                         "bag", "purse", "jewellery", "mobile", "laptop"]
    ):
        return True
    return False


DACOITY_KWS = [
    "dacoity",
    "five men", "five people", "five persons",
    "armed gang", "gang robbery", "group robbery",
    "group attacked and robbed", "band of robbers",
]

def is_dacoity_query(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in DACOITY_KWS)


CHEATING_KWS = [
    "cheated", "cheating", "cheat",
    "fraud", "fraudulent",
    "deceived", "deception", "deceive",
    "duped", "scammed", "scam", "tricked",
    "investment fraud", "loan fraud", "fake scheme",
    "ponzi",
]

def is_cheating_query(query: str) -> bool:
    q = query.lower()
    cyber_kws = ["otp", "upi", "hacked", "instagram", "facebook",
                 "phishing", "online scam", "cyber", "digital fraud"]
    if any(c in q for c in cyber_kws):
        return False
    return any(kw in q for kw in CHEATING_KWS)


GRIEVOUS_HURT_KWS = [
    "grievous hurt", "grievous injury", "grievous bodily",
    "serious injury", "permanent injury",
    "loss of limb", "loss of eye", "loss of hearing", "loss of eyesight",
    "disfigurement", "permanent disfigurement",
    "permanently disfigured",
    "face disfigured",
    "acid attack",
    "broken arm", "broke my arm", "broken leg", "broke my leg",
    "broken bone", "fracture", "fractured",
    "blindness", "maimed",
]

def is_grievous_hurt_query(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in GRIEVOUS_HURT_KWS)


INTIMIDATION_KWS = [
    "criminal intimidation",
    "death threat", "kill me", "harm me",
    "threatening messages", "threatening calls",
    "blackmail", "blackmailed",
]

def is_intimidation_query(query: str) -> bool:
    q = query.lower()
    if any(kw in q for kw in INTIMIDATION_KWS):
        return True
    if ("threat" in q or "threatened" in q):
        robbery_context = any(w in q for w in ["gunpoint", "knife", "loot", "rob", "mugg"])
        if not robbery_context:
            return True
    return False


# ================================================================
# DIRECT BNS ROUTING TABLE
# ================================================================

DIRECT_BNS_PUNISHMENT: Dict[str, str] = {
    "murder"        : DYN.get("murder_punishment")     or "103",
    "rape"          : DYN.get("rape_punishment")       or "64",
    "robbery"       : DYN.get("robbery_punishment")    or "309",
    "dacoity"       : DYN.get("dacoity_punishment")    or "310",
    "extortion"     : DYN.get("extortion_punishment")  or "308",
    "kidnapping"    : DYN.get("kidnapping_punishment") or "137",
    "cheating"      : DYN.get("cheating_punishment")   or "318",
    "attempt murder": DYN.get("attempt_murder")        or "109",
}

DIRECT_BNS: Dict[str, str] = {
    "murder"               : DYN.get("murder")             or "101",
    "attempt to murder"    : DYN.get("attempt_murder")     or "109",
    "culpable homicide"    : DYN.get("culpable_homicide")  or "105",
    "rape"                 : DYN.get("rape_def")            or "63",
    "punishment for rape"  : DYN.get("rape_punishment")    or "64",
    "sexual harassment"    : DYN.get("sexual_harassment")  or "75",
    "stalking"             : DYN.get("stalking")            or "78",
    "voyeurism"            : DYN.get("voyeurism")           or "77",
    "dacoity"              : DYN.get("dacoity")             or "310",
    "robbery"              : DYN.get("robbery")             or "309",
    "theft"                : DYN.get("theft")               or "303",
    "stealing"             : DYN.get("theft")               or "303",
    "cheated"              : DYN.get("cheating")            or "318",
    "cheating"             : DYN.get("cheating")            or "318",
    "snatching"            : DYN.get("snatching")           or "304",
    "extortion"            : DYN.get("extortion")           or "308",
    "abduction"            : DYN.get("abduction")           or "138",
    "kidnapping"           : DYN.get("kidnapping")          or "137",
    "forgery"              : DYN.get("forgery")             or "336",
    "defamation"           : DYN.get("defamation")          or "356",
    "criminal intimidation": DYN.get("intimidation")        or "351",
    "intimidation"         : DYN.get("intimidation")        or "351",
    "trespass"             : DYN.get("trespass")            or "329",
    "grievous hurt"        : DYN.get("grievous_hurt")       or "117",
    "grievous injury"      : DYN.get("grievous_hurt")       or "117",
    "hurt"                 : DYN.get("hurt")                or "115",
    "domestic violence"    : DYN.get("domestic_cruelty")    or "85",
    "cruelty by husband"   : DYN.get("domestic_cruelty")    or "85",
    "modesty"              : DYN.get("modesty")             or "74",
    "outrage modesty"      : DYN.get("modesty")             or "74",
}


def check_direct_bns(query: str, intent: str = "general") -> Optional[str]:
    q = query.lower()
    if intent == "punishment":
        for phrase in sorted(DIRECT_BNS_PUNISHMENT, key=len, reverse=True):
            if phrase in q:
                return DIRECT_BNS_PUNISHMENT[phrase]
    for phrase in sorted(DIRECT_BNS, key=len, reverse=True):
        if phrase in q:
            return DIRECT_BNS[phrase]
    return None


# ================================================================
# SCENARIO MAP
# ================================================================

SCENARIO_MAP: Dict[str, str] = {
    "stole"            : "theft",
    "stolen"           : "theft",
    "steal"            : "theft",
    "bike"             : "theft",
    "bicycle"          : "theft",
    "wallet"           : "theft",
    "mobile"           : "theft",
    "phone"            : "theft",
    "pickpocket"       : "theft",
    "shoplifting"      : "theft",
    "laptop"           : "theft",
    "car stolen"       : "theft",
    "scooter"          : "theft",
    "missing"          : "theft",
    "vanished"         : "theft",
    "disappeared"      : "theft",
    "gone missing"     : "theft",
    "taken away"       : "theft",
    "took my"          : "theft",
    "lifted my"        : "theft",
    "robbed"           : "robbery",
    "gunpoint"         : "robbery",
    "loot"             : "robbery",
    "looted"           : "robbery",
    "mugged"           : "robbery",
    "mugging"          : "robbery",
    "five men"         : "dacoity",
    "gang robbery"     : "dacoity",
    "group robbery"    : "dacoity",
    "armed gang"       : "dacoity",
    "snatched"         : "snatching",
    "chain snatching"  : "snatching",
    "grabbed"          : "snatching",
    "forged"           : "forgery",
    "signature"        : "forgery",
    "fake document"    : "forgery",
    "tampered"         : "forgery",
    "blackmail"        : "criminal intimidation",
    "blackmailed"      : "criminal intimidation",
    "threatening me"   : "criminal intimidation",
    "threatened me"    : "criminal intimidation",
    "death threat"     : "criminal intimidation",
    "kill me"          : "criminal intimidation",
    "harm me"          : "criminal intimidation",
    "threat"           : "criminal intimidation",
    "cheated"          : "cheating fraud deception",
    "cheated me"       : "cheating fraud deception",
    "defrauded"        : "cheating fraud deception",
    "duped"            : "cheating fraud deception",
    "scammed"          : "cheating fraud deception",
    "scam"             : "cheating fraud deception",
    "tricked"          : "cheating fraud deception",
    "investment fraud" : "cheating fraud investment",
    "loan fraud"       : "cheating fraud loan",
    "ponzi"            : "cheating fraud ponzi scheme",
    "hacked"           : "cyber fraud cheating electronic record",
    "account hacked"   : "cyber fraud cheating electronic record",
    "instagram"        : "cyber fraud cheating impersonation",
    "facebook"         : "cyber fraud cheating impersonation",
    "telegram scam"    : "cyber fraud cheating impersonation",
    "whatsapp scam"    : "cyber fraud cheating impersonation",
    "fake profile"     : "cyber fraud cheating impersonation",
    "impersonation"    : "cyber fraud cheating",
    "otp"              : "cyber fraud cheating otp banking",
    "upi"              : "cyber fraud cheating upi payment",
    "phishing"         : "cyber fraud cheating phishing",
    "deepfake"         : "cyber fraud cheating impersonation",
    "fake kyc"         : "cyber fraud cheating kyc",
    "credit card fraud": "cyber fraud cheating credit card",
    "debit card fraud" : "cyber fraud cheating debit card",
    "crypto scam"      : "cyber fraud cheating cryptocurrency",
    "investment scam"  : "cyber fraud cheating investment",
    "trading scam"     : "cyber fraud cheating trading",
    "loan app fraud"   : "cyber fraud cheating loan",
    "husband beats"    : "cruelty by husband",
    "wife beating"     : "cruelty by husband",
    "dowry"            : "cruelty by husband",
    "slapped"          : "hurt",
    "punched"          : "hurt",
    "kicked"           : "hurt",
    "beaten"           : "hurt",
    "beat"             : "hurt",
    "hit me"           : "hurt",
    "assault"          : "hurt",
    "attacked"         : "hurt",
    "road rage"        : "hurt",
    "physical attack"  : "hurt",
    "broken arm"       : "grievous hurt",
    "broke my arm"     : "grievous hurt",
    "broken leg"       : "grievous hurt",
    "fracture"         : "grievous hurt",
    "fractured"        : "grievous hurt",
    "acid attack"      : "grievous hurt",
    "maimed"           : "grievous hurt",
    "disfigurement"    : "grievous hurt",
    "molested"         : "outrage modesty",
    "groped"           : "outrage modesty",
    "followed me"      : "stalking",
    "keeps following"  : "stalking",
    "took my land"     : "trespass encroachment civil dispute property",
    "occupied my land" : "trespass encroachment civil dispute property",
    "encroached my land": "trespass encroachment civil dispute property",
    "took my property" : "trespass encroachment civil dispute property",
    "occupied my property": "trespass encroachment civil dispute property",
    "encroached my property": "trespass encroachment civil dispute property",
    "neighbour built"  : "trespass encroachment civil dispute property",
    "neighbor built"   : "trespass encroachment civil dispute property",
    "refuses to return": "criminal breach of trust cheating trespass",
    "refuse to return" : "criminal breach of trust cheating trespass",
}


def expand_query_scenario(query: str) -> str:
    q = query.lower()
    expansions = [query]
    for phrase, legal_term in SCENARIO_MAP.items():
        if phrase in q:
            expansions.append(legal_term)
    return " ".join(dict.fromkeys(expansions))


# ================================================================
# 6 — SUMMARIES
# ================================================================

_S = DYN
BNS_SUMMARY_TEMPLATES = {
    "murder"           : ("Murder",                       "Causing death with intention, or with knowledge that the act will cause death.",                         ["murder", "kill", "death", "intentional"]),
    "culpable_homicide": ("Culpable Homicide",             "Causing death with intention or causing injury likely to cause death.",                                  ["culpable", "homicide", "death", "injury"]),
    "attempt_murder"   : ("Attempt to Murder",             "Doing any act with intent to cause death where death would constitute murder.",                          ["attempt", "murder", "intent", "death"]),
    "hurt"             : ("Hurt",                          "Intentionally causing bodily pain, injury, or infirmity to another person.",                             ["hurt", "pain", "injury", "bodily"]),
    "grievous_hurt"    : ("Grievous Hurt",                 "Causing serious bodily harm — loss of limb, sight, hearing, or permanent disfigurement.",               ["grievous", "hurt", "serious", "injury", "limb"]),
    "rape_def"         : ("Rape — Definition",             "Sexual intercourse without consent, or under fear/fraud/intoxication, or when victim is under 18.",     ["rape", "consent", "sexual", "intercourse"]),
    "rape_punishment"  : ("Punishment for Rape",           "Prescribes punishments for rape under BNS 2023.",                                                        ["rape", "punishment", "imprisonment"]),
    "modesty"          : ("Assault to Outrage Modesty",    "Assault or criminal force on a woman intending to outrage her modesty.",                                 ["modesty", "assault", "woman", "criminal force"]),
    "sexual_harassment": ("Sexual Harassment",             "Unwelcome physical contact, requests for sexual favours, or sexually coloured remarks.",                 ["sexual", "harassment", "unwelcome", "workplace"]),
    "stalking"         : ("Stalking",                      "Repeatedly following, contacting, or monitoring a woman despite her clear disinterest.",                 ["stalking", "follow", "monitoring", "repeated"]),
    "voyeurism"        : ("Voyeurism",                     "Watching or capturing images of a woman in a private act without her consent.",                         ["voyeurism", "privacy", "recording", "image"]),
    "domestic_cruelty" : ("Cruelty by Husband/Relatives",  "Treating a wife with physical or mental cruelty, or harassing her for unlawful demands.",               ["cruelty", "husband", "wife", "dowry", "domestic"]),
    "theft"            : ("Theft",                         "Dishonestly taking movable property out of another person's possession without their consent.",          ["theft", "steal", "movable", "dishonest"]),
    "snatching"        : ("Snatching",                     "Suddenly taking movable property from a person using force or threat. New offence in BNS 2023.",        ["snatching", "force", "sudden", "property"]),
    "robbery"          : ("Robbery",                       "Theft or extortion combined with voluntarily causing or attempting death, hurt, or wrongful restraint.", ["robbery", "violence", "fear", "force", "theft"]),
    "dacoity"          : ("Dacoity",                       "Robbery committed by five or more persons together.",                                                    ["dacoity", "five", "gang", "group", "robbery"]),
    "extortion"        : ("Extortion",                     "Putting a person in fear of injury to dishonestly induce delivery of property.",                        ["extortion", "fear", "threat", "property", "money"]),
    "cheating"         : ("Cheating",                      "Fraudulently deceiving a person to deliver property or cause damage.",                                   ["cheating", "fraud", "deceive", "deception", "scam"]),
    "intimidation"     : ("Criminal Intimidation",         "Threatening a person with injury to them, their reputation, or property to cause fear.",                 ["intimidation", "threat", "fear", "injury"]),
    "kidnapping"       : ("Kidnapping",                    "Taking a minor or person of unsound mind out of lawful guardianship without consent.",                   ["kidnapping", "minor", "guardian", "child"]),
    "abduction"        : ("Abduction",                     "Compelling or inducing a person by force, threat, or deception to move from one place to another.",     ["abduction", "force", "compel", "move"]),
    "defamation"       : ("Defamation",                    "Making or publishing a false imputation concerning a person intending to harm their reputation.",        ["defamation", "reputation", "false", "imputation"]),
    "forgery"          : ("Forgery",                       "Making a false document or electronic record with intent to cause damage or fraud.",                     ["forgery", "false", "document", "signature"]),
    "trespass"         : ("Criminal Trespass",             "Entering or remaining on property without permission with intent to commit an offence.",                  ["trespass", "property", "enter", "permission"]),
}

BNS_SUMMARIES: Dict[str, Dict] = {}
for key, (title, definition, keywords) in BNS_SUMMARY_TEMPLATES.items():
    sec = _S.get(key)
    if sec:
        BNS_SUMMARIES[sec] = {"title": title, "definition": definition, "keywords": keywords}


# ================================================================
# 7 — QUERY EXPANSION
# ================================================================

SYNONYMS: Dict[str, str] = {
    "chain snatching"    : "snatching robbery theft chain",
    "stolen mobile"      : "theft snatching mobile phone",
    "stolen phone"       : "theft snatching mobile phone",
    "stolen bike"        : "theft dishonest movable property bike",
    "my bike was stolen" : "theft dishonest movable property",
    "my phone was stolen": "theft dishonest movable property",
    "stole"              : "theft dishonest movable property",
    "stolen"             : "theft dishonest movable property",
    "someone stole"      : "theft dishonest movable property",
    "they stole"         : "theft dishonest movable property",
    "he stole"           : "theft dishonest movable property",
    "my bike"            : "theft dishonest movable property",
    "my phone"           : "theft dishonest movable property",
    "my wallet"          : "theft dishonest movable property",
    "my laptop"          : "theft dishonest movable property",
    "my car"             : "theft dishonest movable property",
    "my scooter"         : "theft dishonest movable property",
    "my mobile"          : "theft dishonest movable property",
    "wallet missing"     : "theft dishonest movable property",
    "phone missing"      : "theft dishonest movable property",
    "bike missing"       : "theft dishonest movable property",
    "car missing"        : "theft dishonest movable property",
    "laptop missing"     : "theft dishonest movable property",
    "jewellery missing"  : "theft dishonest movable property",
    "robbed"             : "robbery force threat property",
    "gunpoint"           : "robbery force threat weapon",
    "looted"             : "robbery force property",
    "mugged"             : "robbery force threat",
    "five men"           : "dacoity robbery five persons group",
    "gang robbery"       : "dacoity robbery gang group",
    "group robbery"      : "dacoity robbery gang group",
    "armed gang"         : "dacoity robbery armed group",
    "otp fraud"          : "cheating fraud deception otp banking",
    "upi fraud"          : "cheating fraud payment deception upi",
    "bank fraud"         : "cheating fraud banking deception",
    "cyber crime"        : "cheating fraud electronic digital",
    "online scam"        : "cheating fraud internet deception",
    "job fraud"          : "cheating fraud employment fake",
    "investment scam"    : "cheating fraud investment deception",
    "trading scam"       : "cheating fraud trading deception",
    "loan app fraud"     : "cheating fraud loan digital",
    "ponzi"              : "cheating fraud scheme deception",
    "telegram scam"      : "cheating fraud impersonation telegram",
    "whatsapp scam"      : "cheating fraud impersonation whatsapp",
    "deepfake"           : "cheating fraud impersonation digital",
    "fake kyc"           : "cheating fraud identity kyc",
    "credit card fraud"  : "cheating fraud credit card banking",
    "debit card fraud"   : "cheating fraud debit card banking",
    "crypto scam"        : "cheating fraud cryptocurrency digital",
    "cheated"            : "cheating fraud deception",
    "cheated me"         : "cheating fraud deception",
    "duped"              : "cheating fraud deception",
    "scammed"            : "cheating fraud deception",
    "tricked"            : "cheating fraud deception",
    "account hacked"     : "cheating electronic record cyber fraud",
    "hacked"             : "cheating cyber fraud electronic record",
    "instagram hacked"   : "cheating cyber fraud impersonation electronic",
    "facebook hacked"    : "cheating cyber fraud impersonation electronic",
    "fake profile"       : "cheating impersonation fraud",
    "blackmail"          : "extortion threat blackmail criminal intimidation",
    "private photos"     : "extortion defamation blackmail private",
    "death threat"       : "criminal intimidation threat injury",
    "threatening messages": "criminal intimidation threat",
    "kill me"            : "criminal intimidation murder threat",
    "domestic violence"  : "cruelty husband wife domestic abuse",
    "beat me"            : "hurt voluntary causing hurt",
    "beat up"            : "hurt grievous hurt voluntary causing",
    "assault"            : "hurt voluntary causing hurt",
    "attacked"           : "hurt voluntary causing hurt",
    "road rage"          : "hurt voluntary causing hurt",
    "acid attack"        : "grievous hurt acid permanent injury",
    "broken arm"         : "grievous hurt fracture injury",
    "broke my arm"       : "grievous hurt fracture injury",
    "fracture"           : "grievous hurt fracture injury",
    "disfigurement"      : "grievous hurt permanent injury",
    "permanently disfigured": "grievous hurt permanent disfigurement injury",
    "face disfigured"    : "grievous hurt permanent disfigurement injury",
    "cctv footage"       : "electronic record evidence video digital",
    "whatsapp message"   : "electronic record digital evidence",
    "call recording"     : "electronic record digital evidence audio",
    "forged"             : "forgery false document",
    "signature"          : "forgery document",
    "tricked me"         : "cheating fraud deception",
    "fake website"       : "cheating fraud deception internet",
    "eve teasing"        : "sexual harassment molestation modesty",
    "threat"             : "criminal intimidation extortion",
    "threatened"         : "criminal intimidation",
}


def expand_query(q: str) -> str:
    expansions = [q]
    for phrase, syns in SYNONYMS.items():
        if phrase in q.lower():
            expansions.append(syns)
    return " ".join(dict.fromkeys(expansions))


# ================================================================
# 8 — HYBRID SCORING
# ================================================================

def keyword_score(query: str, content: str) -> float:
    query_words = set(re.findall(r'\b\w{3,}\b', query.lower()))
    content_lower = content.lower()
    if not query_words:
        return 0.0
    hits = sum(1 for w in query_words if w in content_lower)
    return min(hits / len(query_words), 1.0)


def title_score(query: str, title: str) -> float:
    query_words = set(re.findall(r'\b\w{3,}\b', query.lower()))
    title_words = set(re.findall(r'\b\w{3,}\b', title.lower()))
    if not query_words or not title_words:
        return 0.0
    
    hits_query = sum(1 for w in query_words if w in title_words)
    ratio_query = hits_query / len(query_words)
    
    hits_title = sum(1 for w in title_words if w in query_words)
    ratio_title = hits_title / len(title_words)
    
    if ratio_title == 1.0:
        return 1.5
        
    return max(ratio_query, ratio_title)


NL_OVERRIED_MAP = {
    "short title, commencement and application": "1",
    "definitions": "2",
    "general explanations": "3",
    "commutation of sentence": "5",
    "act not intended and not known to be likely to cause death or grievous hurt, done by consent": "25",
    "exclusion of acts which are offences independently of harm caused": "29",
    "act to which a person is compelled by threats": "32",
    "act causing slight harm": "33",
    "abetment of a thing": "45",
    "word, gesture or act intended to insult modesty of a woman": "79",
    "marriage ceremony fraudulently gone through without lawful marriage": "83",
    "kidnapping, abducting or inducing woman to compel her marriage": "87",
    "kidnapping or abducting child under ten years of age with intent to steal from its person": "97",
    "culpable homicide by causing death of person other than person whose death was intended": "102",
    "punishment for murder by life-convict": "104",
    "punishment for culpable homicide not amounting to murder": "105"
}


def hybrid_score(embedding_s: float, query: str, content: str, title: str, section: str = "") -> float:
    ks = keyword_score(query, content)
    ts = title_score(query, title)
    
    # Check for direct section match
    sec_match = False
    if section:
        numbers = re.findall(r'\b\d+\b', query)
        if str(section) in numbers:
            sec_match = True
            
    # Check for direct phrase override match
    q_clean = query.lower()
    for phrase, sec_num in NL_OVERRIED_MAP.items():
        if phrase in q_clean and str(section) == sec_num:
            sec_match = True
            
    base = round(0.6 * embedding_s + 0.2 * ks + 0.2 * ts, 4)
    if sec_match:
        return base + 1.5
    return base


# ================================================================
# 9 — RETRIEVAL
# ================================================================

SCORE_THRESHOLD = 0.25


def retrieve(query: str, law: str, k: int = 5) -> List[Dict]:
    vs = VS.get(law)
    if vs is None:
        return []
    expanded = expand_query(query)
    fetch_k = max(25, k)
    try:
        raw = vs.similarity_search_with_score(expanded, k=fetch_k)
    except Exception:
        raw = [(d, 1.0) for d in vs.similarity_search(expanded, k=fetch_k)]
    results = []
    for doc, distance in raw:
        score = 1 / (1 + distance)
        if score >= SCORE_THRESHOLD:
            sec = doc.metadata["section"]
            h_score = hybrid_score(score, query, doc.page_content, doc.metadata["title"], section=sec)
            results.append({
                "section": sec,
                "title"  : doc.metadata["title"],
                "law"    : doc.metadata.get("law", law.upper()),
                "content": doc.page_content,
                "score"  : h_score,
            })
    sorted_results = sorted(results, key=lambda x: x["score"], reverse=True)
    return sorted_results[:k]


def retrieve_multi(query: str, laws: List[str], k: int = 5) -> List[Dict]:
    all_r = []
    for law in laws:
        all_r.extend(retrieve(query, law, k=k))
    all_r.sort(key=lambda x: x["score"], reverse=True)
    seen, unique = set(), []
    for r in all_r:
        key = (r["law"], r["section"])
        if key not in seen:
            seen.add(key)
            unique.append(r)
    title_seen: set = set()
    deduped: List[Dict] = []
    for r in unique:
        t_key = r["title"].lower()[:30]
        if t_key not in title_seen:
            title_seen.add(t_key)
            deduped.append(r)
    return deduped


# ================================================================
# 10 — LAW-SPECIFIC EXTRACTORS
# ================================================================

_SKIP_PREFIXES = ("illustration", "example", "explanation")
_LETTERED_CLAUSE = re.compile(r'^\s*\([a-z]{1,3}\)\s', re.IGNORECASE)
_PUNISHMENT_KWS = [
    "shall be punished", "punished with", "punishable with",
    "imprisonment", "rigorous imprisonment", "simple imprisonment",
    "imprisonment for life", "life imprisonment",
    "shall be liable", "liable to",
    "fine", "death", "penalty",
    "shall not be less than", "minimum.*year", "maximum.*year", "may extend to",
]


def extract_bns_punishment(text: str) -> List[str]:
    results = []
    for line in text.split('\n'):
        stripped = line.strip()
        if not stripped or len(stripped) < 10:
            continue
        lower = stripped.lower()
        if any(lower.startswith(pfx) for pfx in _SKIP_PREFIXES):
            continue
        is_lettered = bool(_LETTERED_CLAUSE.match(stripped))
        has_punishment = any(re.search(p, lower) for p in _PUNISHMENT_KWS)
        if is_lettered and not has_punishment:
            continue
        if has_punishment:
            entry = f"• {stripped.rstrip(',.')}"
            if entry not in results:
                results.append(entry)
    return results[:5]


def extract_bnss_procedure(text: str) -> List[str]:
    results = []
    kws = ["shall", "officer", "magistrate", "court", "may", "must",
           "entitled", "right", "inform", "custody", "arrested",
           "application", "procedure", "within", "hours", "days"]
    for line in text.split('\n'):
        line = line.strip()
        if any(k in line.lower() for k in kws) and 10 < len(line) < 300:
            entry = f"• {line.rstrip(',.')}"
            if entry not in results:
                results.append(entry)
    return results[:5]


def extract_bsa_conditions(text: str) -> List[str]:
    results = []
    kws = ["admissible", "evidence", "relevant", "shall be", "document",
           "certificate", "electronic", "court", "proof", "burden",
           "presumed", "witness", "testimony"]
    for line in text.split('\n'):
        line = line.strip()
        if any(k in line.lower() for k in kws) and 10 < len(line) < 300:
            entry = f"• {line.rstrip(',.')}"
            if entry not in results:
                results.append(entry)
    return results[:5]


LAW_EXTRACTOR = {
    "BNS" : ("Punishment", extract_bns_punishment),
    "BNSS": ("Procedure",  extract_bnss_procedure),
    "BSA" : ("Conditions", extract_bsa_conditions),
}


# ================================================================
# 11 — LAWYER TYPE RECOMMENDATIONS + ESCALATION
# ================================================================

SERIOUS_OFFENCES = {
    "murder", "rape", "gang rape", "dacoity", "kidnapping", "abduction",
    "pocso", "ndps", "terrorism", "acid attack", "attempt to murder",
    "trafficking", "sc/st atrocity",
}

LAWYER_TYPES: Dict[str, str] = {
    "murder": "Criminal Lawyer", "attempt_murder": "Criminal Lawyer",
    "culpable_homicide": "Criminal Lawyer", "rape": "Criminal Lawyer",
    "rape_punishment": "Criminal Lawyer", "sexual_harassment": "Criminal Lawyer",
    "modesty": "Criminal Lawyer", "stalking": "Criminal Lawyer",
    "voyeurism": "Criminal Lawyer", "hurt": "Criminal Lawyer",
    "grievous_hurt": "Criminal Lawyer", "kidnapping": "Criminal Lawyer",
    "abduction": "Criminal Lawyer", "theft": "Criminal Lawyer",
    "snatching": "Criminal Lawyer", "robbery": "Criminal Lawyer",
    "dacoity": "Criminal Lawyer", "extortion": "Criminal Lawyer",
    "intimidation": "Criminal Lawyer", "forgery": "Criminal Lawyer",
    "defamation": "Criminal Lawyer", "trespass": "Criminal Lawyer",
    "cheating": "Cyber Crime Lawyer", "otp fraud": "Cyber Crime Lawyer",
    "upi fraud": "Cyber Crime Lawyer", "bank fraud": "Cyber Crime Lawyer",
    "account hacked": "Cyber Crime Lawyer", "online fraud": "Cyber Crime Lawyer",
    "cyber crime": "Cyber Crime Lawyer", "cyber fraud": "Cyber Crime Lawyer",
    "digital fraud": "Cyber Crime Lawyer", "phishing": "Cyber Crime Lawyer",
    "investment scam": "Cyber Crime Lawyer", "trading scam": "Cyber Crime Lawyer",
    "loan app fraud": "Cyber Crime Lawyer", "deepfake": "Cyber Crime Lawyer",
    "crypto scam": "Cyber Crime Lawyer",
    "domestic_cruelty": "Family Lawyer", "domestic violence": "Family Lawyer",
    "dowry harassment": "Family Lawyer", "divorce": "Family Lawyer",
    "child custody": "Family Lawyer", "maintenance": "Family Lawyer",
    "matrimonial": "Family Lawyer",
    "property dispute": "Property Lawyer", "tenant dispute": "Property Lawyer",
    "land dispute": "Property Lawyer", "boundary dispute": "Property Lawyer",
    "consumer complaint": "Consumer Lawyer", "defective product": "Consumer Lawyer",
    "service deficiency": "Consumer Lawyer", "consumer": "Consumer Lawyer",
    "wrongful termination": "Labour Lawyer", "salary dispute": "Labour Lawyer",
    "workplace harassment": "Labour Lawyer", "provident fund": "Labour Lawyer",
    "labour": "Labour Lawyer", "labor": "Labour Lawyer",
    "tax issue": "Tax Lawyer", "income tax": "Tax Lawyer", "gst": "Tax Lawyer",
    "sc/st": "Human Rights Lawyer", "dalit": "Human Rights Lawyer",
    "atrocity": "Human Rights Lawyer", "caste discrimination": "Human Rights Lawyer",
}

LAWYER_TYPE_REASONS: Dict[str, str] = {
    "Criminal Lawyer"     : "This matter involves a criminal offence under BNS 2023 that requires criminal law expertise.",
    "Cyber Crime Lawyer"  : "This matter involves cybercrime, digital fraud, or electronic evidence — specialised cyber law expertise is needed.",
    "Family Lawyer"       : "This matter involves matrimonial, domestic, or family law — a family law specialist is best suited.",
    "Property Lawyer"     : "This matter involves property rights, land, or tenancy — a property law specialist is recommended.",
    "Consumer Lawyer"     : "This matter involves consumer rights or unfair trade practices under consumer protection law.",
    "Labour Lawyer"       : "This matter involves employment rights, labour disputes, or workplace issues.",
    "Tax Lawyer"          : "This matter involves taxation, financial regulations, or revenue law.",
    "Human Rights Lawyer" : "This matter involves caste-based discrimination or atrocities — a human rights or SC/ST specialist is recommended.",
}


def is_property_dispute_query(query: str) -> bool:
    q = query.lower()
    phrases = [
        "my land", "my plot", "my property", "occupied my land", "occupied my property",
        "encroached", "encroachment", "inheritance", "partition", "tenant", "tenancy",
        "land dispute", "property dispute", "neighbour built", "neighbor built", "took my land",
        "took my property", "occupied my land", "refuses to return my land", "refuse to return my land",
        "refuses to return my property", "refuse to return my property", "encroached my land",
        "encroached my property", "flat dispute", "house dispute", "plot dispute", "boundary dispute"
    ]
    return any(p in q for p in phrases)


def get_next_steps(query: str) -> str:
    if is_property_dispute_query(query):
        return (
            "\n💡 **Next Steps (Property Dispute):**\n"
            "• Verify ownership details via title deeds and registry documents (Sale Deed, etc.)\n"
            "• Retrieve updated Revenue records and Mutation records (Jamabandi/7-12 extract)\n"
            "• Consult a property lawyer to file a civil suit or obtain an injunction order\n"
            "• Gather photographic or physical evidence of encroachment/occupancy\n"
            "• Consult a lawyer — Free: NALSA **15100**\n"
        )
    else:
        return (
            "\n💡 **Next Steps:**\n"
            "• File an FIR at the nearest police station\n"
            "• Preserve all evidence (messages, screenshots, CCTV)\n"
            "• Consult a lawyer — Free: NALSA **15100**\n"
            "💡 *Type \"draft FIR\" for a ready-to-fill FIR template*\n"
        )


# Load Lawyers Database
LAWYERS_DATA: List[Dict] = []
try:
    _dir = os.path.dirname(os.path.abspath(__file__))
    _path = os.path.join(_dir, "datasets", "lawyers.json")
    if os.path.exists(_path):
        import json
        with open(_path, "r", encoding="utf-8") as _f:
            LAWYERS_DATA = json.load(_f)
        print(f"✅ Loaded {len(LAWYERS_DATA)} advocates for chatbot recommendations")
    else:
        print("⚠️ lawyers.json not found for chatbot recommendations in service.py")
except Exception as _e:
    print(f"Error loading lawyers.json in service.py: {_e}")


def recommend_lawyer_type(query: str, offence_key: str = "", show: bool = True) -> str:
    if not show:
        return ""
    q = query.lower()
    
    PROPERTY_KWS = ["land", "property", "plot", "house", "flat", "inheritance", "partition", "encroachment", "occupied"]
    if any(kw in q for kw in PROPERTY_KWS):
        lawyer_type = "Property Lawyer"
    else:
        lawyer_type = LAWYER_TYPES.get(offence_key, "")
        if not lawyer_type:
            for keyword, ltype in LAWYER_TYPES.items():
                if keyword in q:
                    lawyer_type = ltype
                    break
    if not lawyer_type:
        lawyer_type = "Criminal Lawyer"
    reason = LAWYER_TYPE_REASONS.get(lawyer_type, "This matter requires specialised legal expertise.")
    
    # Matching logic from 10k advocates
    detected_location = None
    cities = ["delhi", "mumbai", "bangalore", "pune", "chennai", "hyderabad", "kolkata", "ahmedabad", "kochi", "indore", "jaipur", "lucknow", "chandigarh", "nagpur", "patna", "bhopal", "surat", "kanpur", "visakhapatnam"]
    for city in cities:
        if city in q:
            detected_location = city
            break
            
    type_map = {
        "Criminal Lawyer": ["criminal", "criminial"],
        "Cyber Crime Lawyer": ["cyber", "fraud", "digital", "online"],
        "Family Lawyer": ["family", "divorce", "custody", "matrimonial", "domestic"],
        "Property Lawyer": ["property", "land", "tenant", "boundary"],
        "Consumer Lawyer": ["consumer", "product", "service"],
        "Labour Lawyer": ["labour", "labor", "employment", "salary", "workplace"],
        "Tax Lawyer": ["tax", "income tax", "gst"],
        "Human Rights Lawyer": ["human rights", "sc/st", "caste", "discrimination"]
    }
    
    keywords = type_map.get(lawyer_type, [lawyer_type.lower()])
    
    matches = []
    for l in LAWYERS_DATA:
        score = 0
        l_loc = l["Location"].lower()
        l_court = l["Court"].lower()
        l_practice = l["Practice Areas"].lower()
        
        if detected_location:
            if detected_location in l_loc or detected_location in l_court:
                score += 10
            else:
                score -= 5
                
        for kw in keywords:
            if kw in l_practice:
                score += 5
                break
                
        for word in q.split():
            if len(word) > 3:
                if word in l_practice:
                    score += 2
                if word in l_court:
                    score += 1
                    
        if score > 0:
            matches.append((score, l))
            
    matches.sort(key=lambda x: x[0], reverse=True)
    matched_lawyers = [m[1] for m in matches[:3]]
    if not matched_lawyers and LAWYERS_DATA:
        matched_lawyers = LAWYERS_DATA[:3]
        
    lawyer_cards_md = ""
    if matched_lawyers:
        lawyer_cards_md = "\n**Recommended Advocates for your Matter:**\n"
        for l in matched_lawyers:
            lawyer_cards_md += (
                f"*   **[{l['Name']}]({l['Profile Link']})** ({l['Location']})\n"
                f"    *Experience:* {l['Experience']} Years | *Court:* {l['Court']}\n"
                f"    *Specialization:* {l['Practice Areas']}\n"
            )
            
    return (
        f"\n\n👨‍⚖️ **Recommended Legal Assistance**\n"
        f"**Lawyer Type:** {lawyer_type}\n"
        f"**Reason:** {reason}\n"
        f"{lawyer_cards_md}\n"
        f"**Free Legal Aid:**\n"
        f"• NALSA Helpline: **15100** (free, 24x7)\n"
        f"• District Legal Services Authority (DLSA) — visit your district court\n"
        f"• Tele-Law Service: **15100** (free legal advice by phone)\n"
        f"• Online application: **nalsa.gov.in**\n\n"
        f"*⚠️ This is general guidance only. Consult a qualified advocate for your specific situation.*"
    )


def check_escalation(title: str) -> Optional[str]:
    if any(so in title.lower() for so in SERIOUS_OFFENCES):
        return (
            "\n⚠️ **IMMEDIATE LAWYER CONSULTATION RECOMMENDED**\n"
            "This is a serious offence. Do not proceed without legal representation.\n"
            "📞 Free legal aid: **NALSA 15100**\n"
        )
    return None


# ================================================================
# BNSS GUIDES
# ================================================================

BNSS_GUIDES: Dict[str, str] = {
    "what is fir": (
        "📋 **FIR — First Information Report (BNSS 2023)**\n\n"
        "An FIR is the first formal record of a cognizable offence made to the police.\n\n"
        "**Key Points:**\n"
        "• FIR must be registered by police for cognizable offences — cannot be refused\n"
        "• Zero FIR: Can be filed at any police station regardless of jurisdiction\n"
        "• Free copy must be given to complainant (Section 173 BNSS)\n\n"
        "**If police refuse:**\n"
        "1. Written complaint to SP/DSP\n"
        "2. File before Judicial Magistrate (Section 175 BNSS)\n"
        "3. Online: citizenservices.cdac.in\n\n"
        "📞 Police: **100** | Legal Aid: **NALSA 15100**\n"
        "💡 Type \"draft FIR\" for a ready-to-fill template"
    ),
    "how to file fir": (
        "📋 **How to File an FIR — Step-by-Step (BNSS 2023)**\n\n"
        "**Step 1** — Go to the police station in whose jurisdiction the crime occurred.\n"
        "(Zero FIR: if unsure, file at any station — they must transfer it)\n\n"
        "**Step 2** — Meet the SHO. Give full details:\n"
        "• Date, time, exact location\n"
        "• Names/description of accused\n"
        "• What happened — step by step\n"
        "• Witnesses and property lost\n\n"
        "**Step 3** — Police records the FIR. Read before signing.\n\n"
        "**Step 4** — Demand a free signed copy (Section 173 BNSS). Note FIR number.\n\n"
        "**If refused:** Written complaint to SP → Magistrate → citizenservices.cdac.in\n\n"
        "📞 Police: **100** | Legal Aid: **NALSA 15100**\n"
        "💡 Type \"draft FIR\" for a ready-to-fill template"
    ),
    "i got arrested": (
        "⚖️ **Arrested? Bail Guidance (BNSS 2023)**\n\n"
        "**BAILABLE** — Police MUST grant bail (minor offences)\n\n"
        "**NON-BAILABLE** (murder, rape, dacoity, robbery) — Only court can grant bail\n\n"
        "**Option A — Regular Bail (Sec 480):** After arrest. Before Magistrate/Sessions Court.\n"
        "**Option B — Anticipatory Bail (Sec 482):** Before arrest. Sessions Court/High Court.\n"
        "**Option C — Default Bail (Sec 479):** If charge sheet not filed within 60/90 days.\n\n"
        "📞 Lawyer immediately: **NALSA 15100** (free)"
    ),
    "what is bail": (
        "⚖️ **Bail Guide (BNSS 2023)**\n\n"
        "**Regular Bail** (Sec 480-481) — After arrest. Before Magistrate.\n"
        "**Anticipatory Bail** (Sec 482) — Before arrest. Sessions Court/High Court.\n"
        "**Default Bail** (Sec 479) — No charge sheet in 60/90 days → bail automatically.\n\n"
        "**Bailable:** Police must grant | **Non-Bailable:** Only court grants\n\n"
        "📞 Free Legal Aid: **NALSA 15100**"
    ),
    "regular bail"     : "⚖️ **Regular Bail (Sec 480 BNSS)** — Filed after arrest. Magistrate or Sessions Court. 📞 NALSA: **15100**",
    "interim bail"     : "⚖️ **Interim Bail (BNSS)** — Temporary bail pending full hearing. Sessions Court or High Court. 📞 NALSA: **15100**",
    "anticipatory bail": "⚖️ **Anticipatory Bail (Sec 482 BNSS)** — Applied BEFORE arrest. Sessions Court or High Court. 📞 NALSA: **15100**",
    "default bail"     : "⚖️ **Default Bail (Sec 479 BNSS)** — No charge sheet in 60 days (≤10yr) or 90 days (life/death) → automatic bail right. 📞 NALSA: **15100**",
    "police custody"   : "🔒 **Police Custody (Sec 187 BNSS)** — Max 15 days total. Must produce before Magistrate within 24 hours. 📞 NALSA: **15100**",
    "judicial custody" : "🏛️ **Judicial Custody** — After 15 days police custody → jail under Magistrate. After 60/90 day limit → Default Bail right arises. 📞 NALSA: **15100**",
    "remand"           : "📋 **Remand (Sec 187 BNSS)** — Police Remand: max 15 days total. Judicial Remand: jail under Magistrate. Rights: lawyer, family, medical exam. 📞 NALSA: **15100**",
    "charge sheet"     : "📄 **Charge Sheet (Sec 193 BNSS)** — Must be filed in 60 days (≤10yr) or 90 days (life/death). Failure → Default Bail (Sec 479). 📞 NALSA: **15100**",
    "how long can police": "🔒 **Detention Limits** — Without Magistrate: max 24 hrs (Sec 57) | Police custody: max 15 days | Charge sheet: 60/90 days | After limit: Default Bail (Sec 479). 📞 NALSA: **15100**",
    "zero fir"         : "📋 **Zero FIR** — File at ANY police station regardless of where crime occurred. Station must transfer to correct jurisdiction. Cannot be refused. 📞 Police: **100**",
}


def check_bnss_guide(query: str) -> Optional[str]:
    q = query.lower().strip()
    for trigger in sorted(BNSS_GUIDES, key=len, reverse=True):
        guide = BNSS_GUIDES[trigger]
        if trigger in q and len(guide) > 20:
            return guide + "\n" + LEGAL_DISCLAIMER
    return None


# ================================================================
# BSA GUIDES
# ================================================================

ELECTRONIC_EVIDENCE_GUIDE = (
    "💻 **Electronic & Digital Evidence (BSA 2023)**\n\n"
    "Electronic records are fully admissible as documentary evidence.\n\n"
    "**What qualifies:** WhatsApp/SMS/Telegram/Instagram chats, emails, screenshots, "
    "CCTV footage, call recordings, social media posts, GPS/location data, app logs\n\n"
    "**Certificate Requirement (Section 63 BSA):**\n"
    "1. Device was in proper working condition\n"
    "2. Record produced in normal course of activity\n"
    "3. Device identification details\n\n"
    "**How to Preserve:**\n"
    "• Do NOT edit, crop, compress, or filter originals\n"
    "• Note exact date, time, and device details\n"
    "• WhatsApp: use \"Export Chat\" (includes timestamps)\n"
    "• Screenshots: ensure visible URL/timestamp/sender name\n"
    "• CCTV: request immediately — footage overwritten within days\n"
    "• Emails: export as .eml with full headers\n\n"
    "BSA Sections: **63** (Admissibility) | **57** (Presumption) | **61** (Proof)\n\n"
    "📞 Legal Aid: **NALSA 15100**"
)

BSA_GUIDES: Dict[str, str] = {
    "what is evidence"      : (
        "🔍 **Evidence (BSA 2023)**\n\n"
        "**Types:** Oral (witness testimony), Documentary, Electronic/Digital, "
        "Primary (original), Secondary (copies)\n\n"
        "Only **relevant** facts are admissible. 📞 NALSA: **15100**"
    ),
    "whatsapp"              : ELECTRONIC_EVIDENCE_GUIDE,
    "whatsapp chat"         : ELECTRONIC_EVIDENCE_GUIDE,
    "telegram chat"         : ELECTRONIC_EVIDENCE_GUIDE,
    "instagram chat"        : ELECTRONIC_EVIDENCE_GUIDE,
    "chat evidence"         : ELECTRONIC_EVIDENCE_GUIDE,
    "screenshot evidence"   : ELECTRONIC_EVIDENCE_GUIDE,
    "screenshots"           : ELECTRONIC_EVIDENCE_GUIDE,
    "email evidence"        : ELECTRONIC_EVIDENCE_GUIDE,
    "call recording"        : ELECTRONIC_EVIDENCE_GUIDE,
    "social media evidence" : ELECTRONIC_EVIDENCE_GUIDE,
    "electronic record"     : ELECTRONIC_EVIDENCE_GUIDE,
    "digital record"        : ELECTRONIC_EVIDENCE_GUIDE,
    "electronic evidence"   : ELECTRONIC_EVIDENCE_GUIDE,
    "digital evidence"      : ELECTRONIC_EVIDENCE_GUIDE,
    "cctv"                  : ELECTRONIC_EVIDENCE_GUIDE,
    "cctv footage"          : ELECTRONIC_EVIDENCE_GUIDE,
    "metadata"              : ELECTRONIC_EVIDENCE_GUIDE,
    "expert witness"        : "👤 **Expert Witness (BSA)** — Forensic, medical, cyber, handwriting experts. Opinion-based testimony. Can be cross-examined. 📞 NALSA: **15100**",
    "hostile witness"       : "👤 **Hostile Witness (BSA)** — Court permits cross-examination of your own witness. Earlier police statement usable to contradict. 📞 NALSA: **15100**",
    "documentary evidence"  : "📄 **Documentary Evidence (BSA)** — Primary = original. Secondary = certified copy. Electronic docs governed by Sec 63. 📞 NALSA: **15100**",
    "burden of proof"       : "⚖️ **Burden of Proof (BSA)** — Criminal: beyond reasonable doubt. Civil: balance of probabilities. He who asserts must prove. 📞 NALSA: **15100**",
    "witness testimony"     : "👤 **Witness Testimony (BSA)** — Must be direct (personal knowledge). Hearsay generally inadmissible. Expert witnesses may give opinion evidence. 📞 NALSA: **15100**",
}


def check_bsa_guide(query: str) -> Optional[str]:
    q = query.lower().strip()
    for trigger in sorted(BSA_GUIDES, key=len, reverse=True):
        if trigger in q:
            return BSA_GUIDES[trigger] + "\n" + LEGAL_DISCLAIMER
    return None


# ================================================================
# DRAFT TRIGGERS AND DOCUMENT DRAFTING
# ================================================================

DRAFT_TRIGGERS = {
    "fir_draft"       : ["draft fir", "write fir", "generate fir", "fir draft",
                         "help me write fir", "prepare fir", "sample fir format",
                         "fir for my", "fir template"],
    "police_complaint": ["draft complaint", "write complaint", "police complaint format",
                         "written complaint police", "sample complaint",
                         "draft police complaint", "help me write complaint"],
    "cyber_complaint" : ["cyber complaint", "draft cyber", "write cybercrime",
                         "cybercrime format", "report cybercrime draft",
                         "draft cybercrime", "online complaint format"],
    "legal_notice"    : ["draft legal notice", "write legal notice", "send legal notice",
                         "legal notice format", "prepare legal notice",
                         "help me send notice", "draft notice to"],
    "rti"             : ["draft rti", "write rti", "rti application format",
                         "file rti", "prepare rti application",
                         "help me file rti", "rti draft"],
}

TODAY = date.today().strftime("%d/%m/%Y")

LEGAL_DISCLAIMER = (
    "\n---\n"
    "⚠️ **Disclaimer:** Legal information only — not legal advice. "
    "Consult a qualified lawyer for your specific situation.\n"
    "**Emergency:** Police **100** | Women **1091** | "
    "Legal Aid **15100** | Cybercrime **1930**\n---"
)


def detect_draft_trigger(query: str) -> Optional[str]:
    q = query.lower().strip()
    for dtype, triggers in DRAFT_TRIGGERS.items():
        if any(t in q for t in triggers):
            return dtype
    return None


def extract_context(query: str) -> Dict:
    q = query.lower()
    ctx = {"offence": "", "location": "", "date": TODAY, "items": ""}
    for kw in ["theft", "robbery", "fraud", "assault", "threatening", "harassment", "cheating"]:
        if kw in q:
            ctx["offence"] = kw.title()
            break
    for item in ["phone", "wallet", "bike", "motorcycle", "jewellery", "cash", "laptop", "car", "mobile"]:
        if item in q:
            ctx["items"] = item.title()
            break
    return ctx


DRAFTS = {
    "fir_draft": lambda ctx: (
        f"\n📄 **FIR DRAFT** *(Fill in bracketed fields)*\n\n"
        f"**To,** The Station House Officer, [Police Station], [City] — Date: {ctx['date']}\n\n"
        f"**Subject:** Complaint regarding {ctx['offence'] or '[OFFENCE TYPE]'}\n\n"
        f"I, **[YOUR FULL NAME]**, aged [AGE], resident of [ADDRESS], phone [PHONE], "
        f"hereby lodge the following complaint:\n\n"
        f"**Incident:** On [DATE] at [TIME] at [LOCATION], [DESCRIBE WHAT HAPPENED IN DETAIL]\n\n"
        f"**Accused:** [NAME / 'Unknown'] | [ADDRESS / 'Unknown']\n\n"
        f"**Property Lost:** {'• ' + ctx['items'] if ctx['items'] else '[LIST ITEMS + ESTIMATED VALUE]'}\n\n"
        f"**Witnesses:** [NAME, ADDRESS, PHONE]\n\n"
        f"I request registration of this FIR and appropriate legal action.\n\n"
        f"**[YOUR NAME]** | **[PHONE]** | **Date:** {ctx['date']}\n\n"
        f"*📌 Read FIR before signing. Demand free copy. Note FIR number.*\n"
        f"*If refused: approach SP or Judicial Magistrate.*"
    ),
    "police_complaint": lambda ctx: (
        f"\n📄 **WRITTEN POLICE COMPLAINT**\n\n"
        f"**To,** Superintendent of Police, [District], [State] — Date: {ctx['date']}\n\n"
        f"**Subject:** Complaint of {ctx['offence'] or '[OFFENCE]'} — request FIR registration\n\n"
        f"I, **[YOUR NAME]**, resident of [ADDRESS], report the following:\n\n"
        f"**Facts:** [DESCRIBE — WHO, WHAT, WHEN, WHERE, HOW]\n\n"
        f"I approached [POLICE STATION] on [DATE] but FIR was not registered.\n\n"
        f"**Action Requested:** Register FIR | Investigate | Arrest accused | Recover property\n\n"
        f"**[YOUR NAME]** | **[PHONE/EMAIL]** | **Date:** {ctx['date']}"
    ),
    "cyber_complaint": lambda ctx: (
        f"\n📄 **CYBERCRIME COMPLAINT**\n"
        f"**Platform:** cybercrime.gov.in | **Helpline:** 1930\n\n"
        f"Name: [NAME] | Phone: [PHONE] | State: [STATE]\n\n"
        f"**Type:** {ctx['offence'] or '[OTP Fraud / UPI Fraud / Hacking / Other]'}\n"
        f"**Date:** [DATE] | **Platform used by fraudster:** [Phone/Email/Website]\n\n"
        f"**Loss:** ₹[AMOUNT] | Transaction ID: [ID] | Bank: [BANK]\n\n"
        f"**Description:** [DESCRIBE EXACTLY — EVERY STEP, MESSAGE, CALL]\n\n"
        f"**Evidence:** Screenshots [ ] | Transactions [ ] | Phone numbers [ ] | URLs [ ]\n\n"
        f"*📌 Note acknowledgement number. Report to bank immediately.*"
    ),
    "legal_notice": lambda ctx: (
        f"\n📄 **LEGAL NOTICE** *(Send via Registered Post AD + Email)*\n\n"
        f"**From:** [YOUR NAME], [ADDRESS], [PHONE] — Date: {ctx['date']}\n"
        f"**To:** [RECIPIENT NAME], [ADDRESS]\n\n"
        f"**Sub:** Legal Notice under [BNS Section / Act]\n\n"
        f"I hereby serve this notice:\n\n"
        f"**Facts:** [DESCRIBE GRIEVANCE]\n"
        f"**Violation:** [BNS Section] has been violated.\n"
        f"**Demand:** (a) [DEMAND 1] (b) [DEMAND 2] — within **15 days**\n\n"
        f"Failing which legal proceedings shall be initiated at your cost.\n\n"
        f"**[YOUR NAME / ADVOCATE NAME]** | **Date:** {ctx['date']}\n"
        f"*📌 Keep copy + postal receipt.*"
    ),
    "rti": lambda ctx: (
        f"\n📄 **RTI APPLICATION** *(Right to Information Act, 2005)*\n\n"
        f"**To,** The PIO, [DEPARTMENT NAME], [ADDRESS] — Date: {ctx['date']}\n\n"
        f"Name: [NAME] | Address: [ADDRESS] | Phone: [PHONE]\n\n"
        f"**Information Requested:**\n"
        f"1. [SPECIFIC QUESTION 1]\n"
        f"2. [SPECIFIC QUESTION 2]\n\n"
        f"**Period:** [FROM DATE] to [TO DATE]\n"
        f"**Mode:** ☐ Post  ☐ Inspect  ☐ Certified copy  ☐ Electronic\n\n"
        f"**Fee:** ₹10 enclosed via [DD/IPO/Cash] *(BPL: exempt — attach proof)*\n\n"
        f"**[YOUR NAME]** | **Date:** {ctx['date']}\n"
        f"*📌 PIO must respond within 30 days. First appeal to Appellate Authority if dissatisfied.*"
    ),
}


def generate_draft(draft_type: str, query: str) -> str:
    ctx = extract_context(query)
    fn  = DRAFTS.get(draft_type)
    if fn is None:
        return ""
    content = fn(ctx)
    return f"**📋 {draft_type.replace('_', ' ').upper()}**\n{content}\n{LEGAL_DISCLAIMER}"


# ================================================================
# LEGAL GUIDANCE LAYER
# ================================================================

GUIDANCE_TRIGGERS = {
    "fir_guide"       : ["how to file fir", "how to file an fir", "file fir", "file an fir",
                         "filing fir", "filing an fir", "how fir is filed", "how is fir filed",
                         "filing of fir", "register fir", "register an fir", "registering fir",
                         "registering an fir", "police refuse fir", "zero fir", "how to complain police"],
    "bail_guide"      : ["anticipatory bail", "what is bail", "how to get bail",
                         "bail application", "default bail", "apply for bail", "bail process"],
    "arrest_guide"    : ["rights when arrested", "arrested rights", "my rights arrest",
                         "police can arrest without warrant", "wrongful arrest",
                         "illegal arrest", "how long police hold",
                         "police arrested me", "my rights if arrested"],
    "cybercrime_guide": ["otp fraud", "upi fraud", "online fraud", "cyber fraud", "bank fraud",
                         "phishing", "account hacked", "cybercrime complaint", "1930",
                         "telegram scam", "whatsapp scam", "investment scam", "trading scam",
                         "loan app fraud", "deepfake", "crypto scam", "credit card fraud",
                         "debit card fraud", "fake kyc"],
    "women_guide"     : ["domestic violence helpline", "women helpline", "rape helpline",
                         "women safety", "sexual harassment helpline", "dowry complaint"],
    "legal_aid_guide" : ["free lawyer", "cannot afford lawyer", "free legal help", "nalsa",
                         "legal aid", "poor need lawyer"],
    "evidence_guide"  : ["how to preserve evidence", "whatsapp chat as evidence",
                         "screenshot evidence", "cctv as evidence",
                         "call recording as evidence", "email as evidence"],
}

GUIDES = {
    "fir_guide": (
        "📋 **How to File an FIR (Section 173 BNSS 2023)**\n\n"
        "1. Go to police station in whose area the crime occurred\n"
        "2. Meet SHO — give full details\n"
        "3. Read FIR before signing\n"
        "4. Get **free copy** — your legal right\n"
        "5. Note the FIR number\n\n"
        "**Zero FIR** — Crime elsewhere? File here, police must transfer.\n"
        "**If Refused:** SP complaint → Magistrate → citizenservices.cdac.in\n\n"
        "📞 Police: **100** | 💡 *Type: \"draft FIR for [situation]\"*"
    ),
    "bail_guide": (
        "⚖️ **Bail Guide (BNSS 2023)**\n\n"
        "**Regular Bail** (Sec 480-481) — After arrest. Magistrate/Sessions Court.\n"
        "**Anticipatory Bail** (Sec 482) — Before arrest. Sessions Court/High Court.\n"
        "**Default Bail** (Sec 479) — No charge sheet in 60/90 days → automatic bail right.\n\n"
        "**Bailable:** Police must grant | **Non-Bailable:** Only court grants\n\n"
        "📞 Free Legal Aid: **NALSA 15100**"
    ),
    "arrest_guide": (
        "🔒 **Arrest Rights (BNSS 2023)**\n\n"
        "• **Know the reason** (Sec 47)\n"
        "• **Inform family/friend** immediately\n"
        "• **Consult lawyer** immediately\n"
        "• **24-hour rule** — Cannot be held beyond 24 hours without Magistrate (Sec 57)\n"
        "• **Medical exam** on request\n"
        "• **Right to silence** — statements to police generally not admissible\n"
        "• **No torture** — illegal and punishable\n\n"
        "📞 Legal Aid: **15100** | Human Rights: **nhrc.nic.in**"
    ),
    "cybercrime_guide": (
        "💻 **Cybercrime Response**\n\n"
        "**Do Immediately:** Screenshot everything | Note transaction IDs | Contact bank\n\n"
        "**Report:**\n"
        "🌐 **cybercrime.gov.in** | 📞 **1930** (24x7)\n"
        "🏛️ Police station — FIR under BNS Section 318 (Cheating)\n\n"
        "⏰ *Report within 24 hours for best recovery chance*\n"
        "💡 *Type \"draft cyber complaint\" for complaint format*"
    ),
    "women_guide": (
        "👩 **Women Safety Resources**\n\n"
        "📞 Women Helpline: **1091** | Domestic Violence: **181** | Police: **100** | NCW: **7827-170-170**\n\n"
        "• Domestic Violence → DV Act 2005\n"
        "• Workplace Harassment → POSH Act 2013\n"
        "• Stalking → Cognizable offence (file FIR immediately)\n"
        "• Dowry Harassment → BNS Section 85\n\n"
        "📞 Free Legal Aid: **NALSA 15100**"
    ),
    "legal_aid_guide": (
        "⚖️ **Free Legal Aid**\n\n"
        "**Qualifies:** Income <₹3 lakh | Women & children | SC/ST | Persons in custody\n\n"
        "📞 **NALSA: 15100** (free, 24x7) | 🌐 **nalsa.gov.in**\n"
        "🏛️ Visit DLSA at your district court | 🏛️ Lok Adalat — free, fast, binding"
    ),
    "evidence_guide": (
        "🔍 **Digital Evidence Guide (BSA 2023)**\n\n"
        "**Admissible:** WhatsApp, emails, CCTV, screenshots, call records, GPS\n"
        "**Certificate Req (Sec 63):** Device condition + normal course + device ID\n\n"
        "**Preserve:** Do NOT edit originals | Note date/time/device | "
        "WhatsApp: Export Chat | CCTV: request immediately"
    ),
}


def check_guidance(query: str) -> Optional[str]:
    q = query.lower()
    for key, triggers in GUIDANCE_TRIGGERS.items():
        if any(t in q for t in triggers):
            return GUIDES[key] + "\n" + LEGAL_DISCLAIMER
    return None


# ================================================================
# CITATION BUILDER
# ================================================================

class CitationTracker:
    def __init__(self):
        self.sources: List[str] = []

    def add(self, law: str, section: str, title: str = ""):
        entry = f"{law} Section {section}"
        if title:
            entry += f" — {title[:40]}"
        if entry not in self.sources:
            self.sources.append(entry)

    def render(self) -> str:
        if not self.sources:
            return ""
        return "\n\n📚 **Sources:** " + " | ".join(self.sources)


def match_strength_tag(s: float) -> str:
    emoji = "🟢" if s >= 0.65 else "🟡" if s >= 0.4 else "🟠"
    return f"{emoji} Match Strength: {int(s * 100)}%"


# ================================================================
# QUERY ROUTER
# ================================================================

BNS_KWS = {
    "murder", "homicide", "hurt", "rape", "assault", "theft", "snatching", "robbery",
    "dacoity", "extortion", "cheating", "fraud", "stalking", "voyeurism", "trespass",
    "kidnapping", "abduction", "intimidation", "forgery", "defamation", "cruelty",
    "dowry", "domestic", "offence", "crime", "illegal", "punish", "bns",
    "land", "property", "plot", "house", "flat", "occupied", "encroachment", "tenant",
    "rent", "ownership", "registry", "inheritance", "partition", "will",
    "commutation", "sentence", "defence", "defense", "abetment", "conspiracy", "sexual",
    "intercourse", "authority", "deceitful", "marriage", "ceremony", "accused",
    "discrimination", "discriminate", "caste", "sc/st", "dalit", "boss", "atrocity"
}
BNSS_KWS = {
    "fir", "bail", "arrest", "custody", "remand", "warrant", "summons", "charge sheet",
    "investigation", "trial", "magistrate", "procedure", "bnss", "zero fir", "police",
}
BSA_KWS = {
    "evidence", "proof", "witness", "cctv", "footage", "whatsapp", "screenshot",
    "electronic", "digital", "document", "admissible", "burden", "bsa", "recording",
}

ALL_KWS = BNS_KWS | BNSS_KWS | BSA_KWS | {
    "rights", "law", "legal", "court", "judge", "case", "lawyer",
    "police", "act", "complaint", "help", "section",
    "stole", "stolen", "bike", "mobile", "phone", "fraud", "scam",
    "threat", "harass", "abuse", "money", "bank", "upi", "attack",
    "hacked", "forged", "signature", "blackmail", "fake", "profile",
    "slapped", "punched", "beaten", "hit", "kicked", "molested",
    "groped", "followed", "dowry", "husband", "wife", "laptop", "car",
    "beat", "assault", "robbed", "gunpoint", "dacoity", "looted",
    "mugged", "cheated", "duped", "scammed", "tricked", "threatened",
    "missing", "vanished", "disappeared",
    "brother", "sister", "father", "mother", "uncle", "neighbour", "neighbor",
    "relative", "family", "land", "property", "plot", "house", "flat",
    "occupied", "encroachment", "tenant", "rent", "ownership", "registry",
    "inheritance", "partition", "will",
    "commutation", "sentence", "defence", "defense", "abetment", "conspiracy", "sexual",
    "intercourse", "authority", "deceitful", "marriage", "ceremony", "accused",
    "discrimination", "discriminate", "caste", "sc/st", "dalit", "boss", "atrocity", "discriminates"
}


def detect_law(query: str) -> str:
    q = query.lower()
    scores = {
        "bns" : sum(1 for k in BNS_KWS  if k in q),
        "bnss": sum(1 for k in BNSS_KWS if k in q),
        "bsa" : sum(1 for k in BSA_KWS  if k in q),
    }
    active = [l for l, s in scores.items() if s > 0]
    if len(active) >= 2:
        return "multi"
    return active[0] if active else "bns"


# ================================================================
# INTENT CLASSIFIER
# ================================================================

def classify_intent(query: str) -> str:
    q = query.lower().strip()
    if re.search(r'\bsection\s*\d+\b', q) or re.fullmatch(r'\d+', q):
        return "section_lookup"
    if any(w in q for w in ["punishment", "penalty", "sentence", "jail", "fine", "prison",
                             "punishment for", "how many years"]):
        return "punishment"
    if any(w in q for w in ["definition", "what is", "meaning", "define", "explain"]):
        return "definition"
    if any(w in q for w in [
        "my", "me", "someone", "happened", "i was", "they", "he", "she",
        "stole", "stolen", "hacked", "forged", "blackmail", "threatened",
        "slapped", "beaten", "molested", "followed", "beat", "assaulted",
        "robbed", "gunpoint", "looted", "mugged", "cheated", "duped", "scammed",
        "missing", "vanished", "disappeared",
        "land", "property", "plot", "house", "flat", "occupied", "encroachment",
        "tenant", "rent", "ownership", "registry", "inheritance", "partition", "will",
        "brother", "neighbour", "neighbor", "uncle", "father", "mother", "sister", "family",
        "accused", "friend", "colleague", "relative", "boss", "officer", "police", "court", "legal",
        "discrimination", "discriminate", "caste", "sc/st", "dalit", "atrocity", "discriminates"
    ]):
        return "scenario"
    return "general"


# ================================================================
# SECTION COLLISION HANDLER
# ================================================================

def handle_section_lookup(query: str) -> str:
    m = re.search(r'(\d+)', query)
    if not m:
        return ""
    sec     = m.group(1)
    q_lower = query.lower()
    cit     = CitationTracker()

    forced_law = None
    if "bnss" in q_lower:
        forced_law = "BNSS"
    elif "bsa" in q_lower:
        forced_law = "BSA"
    elif "bns" in q_lower:
        forced_law = "BNS"

    if forced_law:
        idx = ALL_IDXS[forced_law]
        doc = idx.get(sec)
        if doc:
            return _format_section_doc(doc, sec, forced_law, cit)
        return f"Section **{sec}** not found in {forced_law} 2023.\n" + LEGAL_DISCLAIMER

    matches = [(label, idx.get(sec)) for label, idx in ALL_IDXS.items() if idx.get(sec)]

    if not matches:
        return f"Section **{sec}** not found in BNS, BNSS, or BSA 2023.\n" + LEGAL_DISCLAIMER

    if len(matches) == 1:
        label, doc = matches[0]
        return _format_section_doc(doc, sec, label, cit)

    resp = f"📌 **Section {sec} exists in {len(matches)} laws:**\n\n"
    for label, doc in matches:
        cit.add(label, sec, doc.metadata["title"])
        resp += f"**{label} Section {sec} — {doc.metadata['title']}**\n"
        law_label, extractor = LAW_EXTRACTOR.get(label, ("Details", lambda x: []))
        items = extractor(doc.page_content)
        if items:
            resp += f"*{law_label}:*\n" + "\n".join(items[:2]) + "\n"
        resp += "\n"
    resp += f"💡 Specify the law: *'BNS Section {sec}'* or *'BNSS Section {sec}'*"
    return resp + cit.render() + "\n" + LEGAL_DISCLAIMER


def _format_section_doc(
    doc: Document,
    sec: str,
    label: str,
    cit: CitationTracker,
    show_lawyer: bool = False,
) -> str:
    cit.add(label, sec, doc.metadata["title"])
    if label == "BNS" and sec in BNS_SUMMARIES:
        s    = BNS_SUMMARIES[sec]
        resp = f"📋 **{s['title']}** (BNS Section {sec})\n\n"
        resp += f"**Definition:**\n{s['definition']}\n\n"
        punishments = extract_bns_punishment(doc.page_content)
        if punishments:
            resp += "**Punishment (from BNS dataset):**\n" + "\n".join(punishments) + "\n\n"
        if show_lawyer:
            resp += recommend_lawyer_type("", show=True)
        return resp + cit.render() + "\n" + LEGAL_DISCLAIMER

    law_label, extractor = LAW_EXTRACTOR.get(label, ("Details", lambda x: []))
    items = extractor(doc.page_content)
    resp  = f"📋 **{doc.metadata['title']}** ({label} Section {sec})\n\n"
    desc  = re.search(r'Description:\s*(.+?)(?:\n\n|$)', doc.page_content, re.DOTALL)
    resp += f"**Description:**\n{desc.group(1).strip()[:700]}\n\n" if desc else f"{doc.page_content[:600]}\n\n"
    if items:
        resp += f"**{law_label}:**\n" + "\n".join(items) + "\n"
    return resp + cit.render() + "\n" + LEGAL_DISCLAIMER


# ================================================================
# MULTI-OFFENCE KEYWORD BOOST MAP
# ================================================================

KEYWORD_BOOST_MAP: Dict[str, Tuple[str, Optional[str]]] = {
    r"theft|steal\b|stole\b|stolen\b|wallet|pickpocket|shoplifting|bike|bicycle|scooter|laptop stolen|phone stolen|mobile stolen|car stolen|wallet missing|phone missing|bike missing|car missing|jewellery missing": (
        "theft", DYN.get("theft")
    ),
    r"snatch|chain snatch|grabbed"                                                : ("snatching",           DYN.get("snatching")),
    r"\brobbery\b|robbed\b|gunpoint|knife point|held at gunpoint|looted\b|mugged\b|forcefully took|under threat|loot\b": (
        "robbery", DYN.get("robbery")
    ),
    r"dacoity|five\s+men|five\s+people|five\s+persons|group robbery|gang robbery|armed gang|band of robbers": (
        "dacoity", DYN.get("dacoity")
    ),
    r"attempt.*murder"                                                            : ("attempt_murder",      DYN.get("attempt_murder")),
    r"culpable homicide"                                                          : ("culpable_homicide",   DYN.get("culpable_homicide")),
    r"\bmurder\b"                                                                 : ("murder",              DYN.get("murder")),
    r"\brape\b|sexual assault"                                                    : ("rape",                DYN.get("rape_def")),
    r"cheated|cheat\b|cheating|fraud|fraudulent|deceived|deception|duped|scammed|scam\b|tricked|investment fraud|loan fraud|ponzi|otp|upi|hacked|fake profile|instagram|facebook|telegram scam|whatsapp scam|phishing|deepfake|fake kyc|crypto scam": (
        "cheating", DYN.get("cheating")
    ),
    r"criminal intimidation|death threat|kill me|harm me|blackmail|threatening messages|threatening calls|intimidat": (
        "criminal intimidation", DYN.get("intimidation")
    ),
    r"slap|beat|hit|punch|kick|assault|attacked|road rage|physical attack"        : ("hurt",                DYN.get("hurt")),
    r"domestic|husband.*beat|dowry"                                               : ("domestic_cruelty",    DYN.get("domestic_cruelty")),
    r"stalk|follow me|keeps following"                                            : ("stalking",            DYN.get("stalking")),
    r"forg|signature|fake document|tamper"                                        : ("forgery",             DYN.get("forgery")),
    r"abduct|kidnap"                                                              : ("abduction",           DYN.get("abduction")),
    r"trespass|entered.*house|broke.*into|took.*land|occupied.*land|encroached.*land|took.*property|occupied.*property|encroached.*property|neighbor.*built|neighbour.*built|refuses.*return|encroachment|land dispute|property dispute|partition" : ("trespass", DYN.get("trespass")),
    r"grievous hurt|grievous injury|grievous bodily|serious.*injur|broken arm|broke.*arm|broken leg|broke.*leg|fracture|fractured|lost.*eye|loss of eyesight|blindness|permanent.*injur|permanent disfigurement|permanently disfigured|face disfigured|acid attack|disfigur|maimed": (
        "grievous_hurt", DYN.get("grievous_hurt")
    ),
    r"extort|demand.*money.*threat"                                               : ("extortion",           DYN.get("extortion")),
}


def detect_all_applicable_offences(query: str) -> List[Tuple[str, str]]:
    q = query.lower()
    found = []
    seen_sections: set = set()
    for pattern, (key, sec) in KEYWORD_BOOST_MAP.items():
        if sec and re.search(pattern, q):
            if sec not in seen_sections:
                seen_sections.add(sec)
                found.append((key, sec))
    return found


# ================================================================
# RETRIEVAL-FIRST SCENARIO ANALYZER
# ================================================================

def _pin_section(bns_list: List[Dict], sec: str, score: float = 0.99) -> List[Dict]:
    doc = BNS_IDX.get(sec)
    if not doc:
        return bns_list
    bns_list = [r for r in bns_list if r["section"] != sec]
    bns_list.insert(0, {
        "section": sec,
        "title"  : doc.metadata["title"],
        "law"    : "BNS",
        "content": doc.page_content,
        "score"  : score,
        "boosted": True,
    })
    return bns_list


def analyze_scenario_retrieval_first(query: str) -> Dict:
    cit = CitationTracker()
    expanded_query = expand_query_scenario(query)
    all_results = retrieve_multi(expanded_query, ["bns", "bnss", "bsa"], k=6)

    bns_results  = [r for r in all_results if r["law"] == "BNS"]
    bnss_results = [r for r in all_results if r["law"] == "BNSS"]
    bsa_results  = [r for r in all_results if r["law"] == "BSA"]

    q = query.lower()

    for pattern, (key, sec) in KEYWORD_BOOST_MAP.items():
        if re.search(pattern, q) and sec:
            boosted = False
            for r in bns_results:
                if r["section"] == sec:
                    r["score"] = min(r["score"] + 0.15, 1.0)
                    r["boosted"] = True
                    boosted = True
            if not boosted:
                doc = BNS_IDX.get(sec)
                if doc:
                    bns_results.append({
                        "section": sec,
                        "title"  : doc.metadata["title"],
                        "law"    : "BNS",
                        "content": doc.page_content,
                        "score"  : 0.55,
                        "boosted": True,
                    })

    bns_results.sort(key=lambda x: x["score"], reverse=True)

    detected_offences = detect_all_applicable_offences(query)
    existing_sections = {r["section"] for r in bns_results}
    for offence_name, sec in detected_offences:
        if sec not in existing_sections:
            doc = BNS_IDX.get(sec)
            if doc:
                bns_results.append({
                    "section": sec, "title": doc.metadata["title"],
                    "law": "BNS", "content": doc.page_content,
                    "score": 0.50, "boosted": True,
                })
                existing_sections.add(sec)

    bns_results.sort(key=lambda x: x["score"], reverse=True)

    title_seen: set = set()
    bns_deduped: List[Dict] = []
    for r in bns_results:
        t_key = r["title"].lower()[:25]
        if t_key not in title_seen:
            title_seen.add(t_key)
            bns_deduped.append(r)

    # Pin interceptors
    if is_grievous_hurt_query(query):
        bns_deduped = _pin_section(bns_deduped, DYN.get("grievous_hurt") or "117")
    if is_theft_query(query):
        bns_deduped = _pin_section(bns_deduped, DYN.get("theft") or "303")
    if is_robbery_query(query) and not is_dacoity_query(query):
        bns_deduped = _pin_section(bns_deduped, DYN.get("robbery") or "309")
    if is_dacoity_query(query):
        bns_deduped = _pin_section(bns_deduped, DYN.get("dacoity") or "310")

    bns_top  = bns_deduped[:5]
    if groq_client:
        bns_top = groq_rerank(query, bns_top)
    bnss_top = bnss_results[:1]
    bsa_top  = bsa_results[:1]

    for r in bns_top + bnss_top + bsa_top:
        cit.add(r["law"], r["section"], r["title"])

    escalation = None
    for r in bns_top:
        result = check_escalation(r["title"])
        if result:
            escalation = result
            break

    lawyer_rec = ""
    if bns_top:
        offence_key = next(
            (key for pattern, (key, sec) in KEYWORD_BOOST_MAP.items()
             if sec and sec == bns_top[0]["section"] and re.search(pattern, q)),
            ""
        )
        lawyer_rec = recommend_lawyer_type(query, offence_key, show=True)

    return {
        "bns": bns_top, "bnss": bnss_top, "bsa": bsa_top,
        "cit": cit, "escalation": escalation, "lawyers": lawyer_rec,
    }


# ================================================================
# FORMATTER HELPERS
# ================================================================

SC_ST_KWS = [
    "sc st", "sc/st", "caste discrimination", "dalit", "scheduled caste",
    "scheduled tribe", "atrocity", "untouchability", "caste abuse", "caste slur",
    "caste harassment", "discriminates based on caste"
]

SC_ST_RESPONSE = (
    "⚠️ **Legal Information: SC/ST (Prevention of Atrocities) Act, 1989**\n\n"
    "Caste-based discrimination and harassment are strictly prohibited under Indian law. "
    "To determine the most accurate legal route, please consider the following:\n\n"
    "1. **Is the victim a member of a Scheduled Caste (SC) or Scheduled Tribe (ST)?**\n"
    "   *   **If Yes:** The **SC/ST (Prevention of Atrocities) Act, 1989** is highly applicable. Under **Section 3** of this Act:\n"
    "       *   **Section 3(1)(r):** Intentional insult or intimidation with intent to humiliate a member of a Scheduled Caste or a Scheduled Tribe in any place within public view is punishable with imprisonment for a term between 6 months and 5 years, along with a fine.\n"
    "       *   **Section 3(1)(s):** Abusing any member of a Scheduled Caste or a Scheduled Tribe by caste name in any place within public view is punishable similarly.\n"
    "       *   **Section 3(1)(u):** Promoting feelings of enmity, hatred, or ill-will against members of SC/ST by words (spoken or written) is an offence.\n"
    "   *   **If No:** The SC/ST Act does not apply. Instead, recourse must be sought under:\n"
    "       *   **Workplace Harassment / Service Law:** Service regulations, industrial dispute frameworks, and Constitutional guarantees (Articles 14, 15, and 16 protecting equality and prohibiting discrimination).\n"
    "       *   **BNS Offences:** If the discrimination involves public insults or public mischief, **Section 196** (promoting enmity on grounds of caste/group) or civil defamation remedies may apply.\n\n"
    "💡 **Next Steps:**\n"
    "• File a complaint directly with your company's Internal Complaints Committee (ICC) or HR department.\n"
    "• File an FIR at the local police station specifically mentioning the **SC/ST Act** if applicable.\n"
    "• For direct assistance, you can contact the State SC/ST Cell or the National Commission for Scheduled Castes (NCSC).\n\n"
    "👨‍⚖️ **Recommended Legal Assistance:**\n"
    "For cases involving caste-based discrimination, it is highly recommended to consult a **Human Rights/SC-ST Specialist** or a **Labour/Service Lawyer**."
)


# ================================================================
# MAIN ANSWER FUNCTION
# ================================================================

def get_legal_answer(user_query: str, history: list = None) -> str:
    if not user_query or not user_query.strip():
        return "Please ask a legal question about BNS, BNSS, or BSA 2023."
    query = user_query.strip()
    q_low = query.lower()

    if any(kw in q_low for kw in SC_ST_KWS):
        # Retrieve matched advocates for SC/ST
        matched_lawyers = []
        if LAWYERS_DATA:
            for l in LAWYERS_DATA:
                l_practice = l["Practice Areas"].lower()
                l_court = l["Court"].lower()
                if "human rights" in l_practice or "sc/st" in l_practice or "caste" in l_practice or "civil" in l_practice:
                    matched_lawyers.append(l)
                    if len(matched_lawyers) == 3:
                        break
        
        lawyer_md = ""
        if matched_lawyers:
            lawyer_md = "\n\n**Recommended Advocates for your Matter:**\n"
            for l in matched_lawyers:
                lawyer_md += (
                    f"*   **[{l['Name']}]({l['Profile Link']})** ({l['Location']})\n"
                    f"    *Experience:* {l['Experience']} Years | *Court:* {l['Court']}\n"
                    f"    *Specialization:* {l['Practice Areas']}\n"
                )
        return SC_ST_RESPONSE + lawyer_md + "\n" + LEGAL_DISCLAIMER

    draft_type = detect_draft_trigger(query)
    if draft_type:
        return generate_draft(draft_type, query)

    guide = check_guidance(query)
    if guide:
        return guide

    bnss_guide = check_bnss_guide(query)
    if bnss_guide:
        return bnss_guide

    bsa_guide = check_bsa_guide(query)
    if bsa_guide:
        return bsa_guide

    has_number = bool(re.search(r'\b\d+\b', q_low))
    if not any(kw in q_low for kw in ALL_KWS) and not has_number:
        return (
            "I handle Indian legal questions on BNS, BNSS, and BSA 2023.\n\n"
            "**Try:** What is theft? | How to file FIR? | Section 303 | "
            "Can WhatsApp be evidence? | Draft FIR for theft\n" + LEGAL_DISCLAIMER
        )

    intent = classify_intent(query)

    if intent == "section_lookup":
        return handle_section_lookup(query)

    intercepted: List[str] = []

    if is_dacoity_query(query):
        sec = DYN.get("dacoity") or "310"
        if sec in BNS_IDX and sec not in intercepted:
            intercepted.append(sec)

    if is_robbery_query(query) and not is_dacoity_query(query):
        sec = DYN.get("robbery") or "309"
        if sec in BNS_IDX and sec not in intercepted:
            intercepted.append(sec)

    if is_theft_query(query):
        sec = DYN.get("theft") or "303"
        if sec in BNS_IDX and sec not in intercepted:
            intercepted.append(sec)

    if is_grievous_hurt_query(query):
        sec = DYN.get("grievous_hurt") or "117"
        if sec in BNS_IDX and sec not in intercepted:
            intercepted.append(sec)

    if is_cheating_query(query):
        sec = DYN.get("cheating") or "318"
        if sec in BNS_IDX and sec not in intercepted:
            intercepted.append(sec)

    if is_intimidation_query(query):
        sec = DYN.get("intimidation") or "351"
        if sec in BNS_IDX and sec not in intercepted:
            intercepted.append(sec)

    if intercepted:
        if len(intercepted) == 1 or intent in ("definition", "punishment"):
            doc = BNS_IDX.get(intercepted[0])
            if doc:
                cit = CitationTracker()
                return _format_section_doc(doc, intercepted[0], "BNS", cit, show_lawyer=True)

        cit  = CitationTracker()
        resp = "**Legal Analysis:**\n\n⚖️ **Possible Applicable Offences (BNS 2023):**\n"
        escalation_shown = False
        for sec in intercepted:
            doc = BNS_IDX.get(sec)
            if not doc:
                continue
            cit.add("BNS", sec, doc.metadata["title"])
            resp += f"\n📋 **Section {sec} — {doc.metadata['title']}** 🎯\n"
            punishments = extract_bns_punishment(doc.page_content)
            if punishments:
                resp += "   Punishment: " + punishments[0].lstrip("• ") + "\n"
            if sec in BNS_SUMMARIES:
                resp += f"   {BNS_SUMMARIES[sec]['definition']}\n"
            if not escalation_shown:
                esc = check_escalation(doc.metadata["title"])
                if esc:
                    resp += esc
                    escalation_shown = True
        resp += get_next_steps(query)
        resp += recommend_lawyer_type(query, show=True)
        resp += cit.render()
        return resp + "\n" + LEGAL_DISCLAIMER

    if intent in ("definition", "punishment", "general"):
        direct_sec = check_direct_bns(query, intent=intent)
        if direct_sec:
            doc = BNS_IDX.get(direct_sec)
            if doc:
                cit = CitationTracker()
                return _format_section_doc(doc, direct_sec, "BNS", cit, show_lawyer=True)

    if intent == "scenario":
        a   = analyze_scenario_retrieval_first(query)
        cit = a["cit"]

        if a["bns"] or a["bnss"] or a["bsa"]:
            resp = "**Legal Analysis:**\n"

            if a["escalation"]:
                resp += a["escalation"]

            if a["bns"]:
                resp += "\n⚖️ **Possible Applicable Offences (BNS 2023):**\n"
                for r in a["bns"]:
                    boosted = " 🎯" if r.get("boosted") else ""
                    resp += (
                        f"\n📋 **Section {r['section']} — {r['title']}** "
                        f"{match_strength_tag(r['score'])}{boosted}\n"
                    )
                    punishments = extract_bns_punishment(r["content"])
                    if punishments:
                        resp += "   Punishment: " + punishments[0].lstrip("• ") + "\n"
                    if r["section"] in BNS_SUMMARIES:
                        resp += f"   {BNS_SUMMARIES[r['section']]['definition']}\n"

            if a["bnss"]:
                resp += "\n📌 **Procedure (BNSS 2023):**\n"
                for r in a["bnss"]:
                    resp += f"📋 **Section {r['section']} — {r['title']}** {match_strength_tag(r['score'])}\n"
                    items = extract_bnss_procedure(r["content"])
                    if items:
                        resp += "\n".join(items[:2]) + "\n"

            if a["bsa"]:
                resp += "\n🔍 **Evidence (BSA 2023):**\n"
                for r in a["bsa"]:
                    resp += f"📋 **Section {r['section']} — {r['title']}** {match_strength_tag(r['score'])}\n"
                    items = extract_bsa_conditions(r["content"])
                    if items:
                        resp += "\n".join(items[:2]) + "\n"

            resp += get_next_steps(query)

            if a["lawyers"]:
                resp += a["lawyers"]

            resp += cit.render()

            groq_all = a["bns"] + a["bnss"] + a["bsa"]
            if groq_client and groq_all:
                groq_resp = groq_answer(query, groq_all)
                if groq_resp and "no confident" not in groq_resp.lower():
                    resp += f"\n\n🤖 **AI Summary (Groq):**\n{groq_resp}"

            return resp + "\n" + LEGAL_DISCLAIMER

    # FAISS fallback
    law     = detect_law(query)
    targets = ["bns", "bnss", "bsa"] if law == "multi" else [law]
    results = retrieve_multi(query, targets, k=5)
    if groq_client:
        results = groq_rerank(query, results)
    cit     = CitationTracker()

    if not results:
        return (
            "No confident match found in BNS/BNSS/BSA.\n\n"
            "Try: specific offences | section numbers | describe your situation\n"
            + LEGAL_DISCLAIMER
        )

    top = results[0]
    sec = top["section"]
    cit.add(top["law"], sec, top["title"])
    show_lawyer_in_fallback = (top["law"] == "BNS")

    if top["law"] == "BNS" and sec in BNS_SUMMARIES:
        s    = BNS_SUMMARIES[sec]
        resp = f"📋 **{s['title']}** (BNS Section {sec})\n\n"
        resp += f"**Definition:**\n{s['definition']}\n\n"
        doc  = BNS_IDX.get(sec)
        punishments = extract_bns_punishment(doc.page_content) if doc else []
        if punishments:
            resp += "**Punishment (from BNS 2023 dataset):**\n" + "\n".join(punishments) + "\n\n"
        else:
            resp += "**Punishment:** As prescribed under BNS 2023 — consult full section text.\n\n"
        resp += f"{match_strength_tag(top['score'])}\n"
        escalation = check_escalation(s["title"])
        if escalation:
            resp += escalation
        if show_lawyer_in_fallback:
            resp += recommend_lawyer_type(query, next(
                (k for k, sv in DYN.items() if sv == top["section"]), ""
            ), show=True)
        if len(results) > 1:
            resp += "\n**Also Relevant:**\n"
            seen_also = {sec}
            for r in results[1:4]:
                if r["section"] not in seen_also:
                    seen_also.add(r["section"])
                    resp += f"• {r['law']} Sec {r['section']} — {r['title']} {match_strength_tag(r['score'])}\n"
                    cit.add(r["law"], r["section"], r["title"])
        if groq_client:
            groq_resp = groq_answer(query, results[:5])
            if groq_resp and "no confident" not in groq_resp.lower():
                resp += f"\n\n🤖 **AI Summary (Groq):**\n{groq_resp}"
        return resp + cit.render() + "\n" + LEGAL_DISCLAIMER

    law_label, extractor = LAW_EXTRACTOR.get(top["law"], ("Details", lambda x: []))
    items = extractor(top["content"])
    resp  = f"📋 **{top['title']}** ({top['law']} Section {sec})\n\n"
    desc  = re.search(r'Description:\s*(.+?)(?:\n\n|$)', top["content"], re.DOTALL)
    resp += f"**Description:**\n{desc.group(1).strip()[:700]}\n\n" if desc else f"{top['content'][:600]}\n\n"
    if items:
        resp += f"**{law_label}:**\n" + "\n".join(items) + "\n\n"
    resp += f"{match_strength_tag(top['score'])}\n"
    if len(results) > 1:
        resp += "\n**Also Relevant:**\n"
        seen_also = {sec}
        for r in results[1:4]:
            if r["section"] not in seen_also:
                seen_also.add(r["section"])
                resp += f"• {r['law']} Sec {r['section']} — {r['title']} {match_strength_tag(r['score'])}\n"
                cit.add(r["law"], r["section"], r["title"])
    if show_lawyer_in_fallback:
        resp += recommend_lawyer_type(query, show=True)
    if groq_client:
        groq_resp = groq_answer(query, results[:5])
        if groq_resp and "no confident" not in groq_resp.lower():
            resp += f"\n\n🤖 **AI Summary (Groq):**\n{groq_resp}"
    return resp + cit.render() + "\n" + LEGAL_DISCLAIMER
