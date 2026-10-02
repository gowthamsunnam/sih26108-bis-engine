import io
import json
import os
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

from multilingual_processor import normalize_multilingual_query
from requirement_extractor import extract_structured_requirements
from retrieval_engine import BISRecommendationEngine

app = FastAPI(
    title="BIS Standards Compliance & Recommendation Engine",
    description="Bureau of Indian Standards Public Procurement Compliance Engine",
    version="2.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Standards Database
STANDARDS_FILE = "standards_seed_data.json"
if os.path.exists(STANDARDS_FILE):
    with open(STANDARDS_FILE, "r", encoding="utf-8") as f:
        standards_database = json.load(f)
else:
    standards_database = []

engine = BISRecommendationEngine(standards_database)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "SIH26108 BIS Standards Recommendation Engine",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "indexed_standards": len(standards_database)
    }

# Persistent History Store File
HISTORY_FILE = "history_store.json"

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(history_list):
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history_list, f, indent=2)
    except Exception as e:
        print(f"Error saving history: {e}")

ANALYSIS_HISTORY = load_history()

class ExtractRequest(BaseModel):
    tender_text: str

class RecommendRequest(BaseModel):
    tender_text: str
    extracted_parameters: Optional[dict] = None
    language: Optional[str] = "en"
    top_k: Optional[int] = 5

def build_focused_query(params: dict, fallback_text: str) -> str:
    """
    Builds a high-signal search query from AI-extracted parameters,
    ignoring administrative noise (EMD, tender notices, officer titles).
    """
    if not params:
        return fallback_text[:400]
    
    parts = []
    if params.get("product") and params["product"] != "General Procurement Item":
        parts.append(params["product"])
    if params.get("category"):
        parts.append(params["category"])
    if params.get("power"):
        parts.append(params["power"])
    if params.get("voltage"):
        parts.append(params["voltage"])
    if params.get("ip_rating"):
        parts.append(params["ip_rating"])
    if params.get("materials"):
        mats = params["materials"] if isinstance(params["materials"], list) else [params["materials"]]
        parts.extend(mats)
    if params.get("protections_demanded"):
        parts.extend(params["protections_demanded"])
    if params.get("applications"):
        parts.extend(params["applications"])
    
    focused = " ".join([str(p) for p in parts if p]).strip()
    return focused if len(focused) > 5 else fallback_text[:400]

@app.post("/api/extract")
def extract_parameters(payload: ExtractRequest):
    multilingual_info = normalize_multilingual_query(payload.tender_text)
    extraction = extract_structured_requirements(multilingual_info["normalized_query"])
    return {
        "multilingual_meta": multilingual_info,
        "extracted_parameters": extraction["extracted_parameters"],
        "missing_information": extraction["missing_information"],
        "is_complete": extraction["is_complete"]
    }

@app.post("/api/recommend")
def recommend_standards(payload: RecommendRequest):
    multilingual_info = normalize_multilingual_query(payload.tender_text)
    normalized_query = multilingual_info["normalized_query"]

    # Always perform fresh extraction on the normalized text
    fresh_extraction = extract_structured_requirements(normalized_query)
    
    # If the user explicitly provided parameters, use them; otherwise use freshly extracted ones
    params = payload.extracted_parameters if payload.extracted_parameters else fresh_extraction["extracted_parameters"]
    missing_info = fresh_extraction.get("missing_information", [])

    # Build focused semantic search query strictly from the active parameters
    focused_search_query = build_focused_query(params, normalized_query)

    recommendations = engine.recommend(focused_search_query, extracted_params=params, top_k=payload.top_k)
    audit = engine.audit_tender(normalized_query, recommendations)

    # Persist session with the fresh state
    session_id = len(ANALYSIS_HISTORY) + 1
    history_entry = {
        "id": session_id,
        "query_snippet": payload.tender_text[:110] + ("..." if len(payload.tender_text) > 110 else ""),
        "full_text": payload.tender_text,
        "language": multilingual_info["detected_language"],
        "primary_standard": recommendations[0]["standard"]["is_code"] if recommendations else "None",
        "standards_count": len(recommendations),
        "extracted_parameters": params,
        "audit_report": audit,
        "recommendations": recommendations,
        "timestamp": "2026-10-02"
    }
    ANALYSIS_HISTORY.insert(0, history_entry)
    save_history(ANALYSIS_HISTORY)

    return {
        "original_query": payload.tender_text,
        "focused_search_query": focused_search_query,
        "multilingual_meta": multilingual_info,
        "extracted_parameters": params,
        "missing_information": missing_info,
        "audit_report": audit,
        "recommendations": recommendations
    }

@app.post("/api/upload-pdf")
async def upload_tender_pdf(file: UploadFile = File(...)):
    """
    Extracts text from uploaded tender PDF document with try-except safety,
    extracts structured parameters, and runs recommendation and statutory compliance audit.
    """
    try:
        contents = await file.read()
        reader = PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF file: {str(e)}")

    clean_text = extracted_text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Unable to extract readable text from PDF. File may be scanned, protected, or empty.")

    multilingual_info = normalize_multilingual_query(clean_text)
    normalized_query = multilingual_info["normalized_query"]

    extraction = extract_structured_requirements(normalized_query)
    params = extraction["extracted_parameters"]
    missing_info = extraction.get("missing_information", [])

    focused_search_query = build_focused_query(params, normalized_query)
    recommendations = engine.recommend(focused_search_query, extracted_params=params, top_k=5)
    audit = engine.audit_tender(normalized_query, recommendations)

    session_id = len(ANALYSIS_HISTORY) + 1
    history_entry = {
        "id": session_id,
        "query_snippet": clean_text[:110] + ("..." if len(clean_text) > 110 else ""),
        "full_text": clean_text,
        "language": multilingual_info["detected_language"],
        "primary_standard": recommendations[0]["standard"]["is_code"] if recommendations else "None",
        "standards_count": len(recommendations),
        "extracted_parameters": params,
        "audit_report": audit,
        "recommendations": recommendations,
        "timestamp": "2026-10-02"
    }
    ANALYSIS_HISTORY.insert(0, history_entry)
    save_history(ANALYSIS_HISTORY)

    return {
        "filename": file.filename,
        "extracted_text": clean_text,
        "focused_search_query": focused_search_query,
        "multilingual_meta": multilingual_info,
        "extracted_parameters": params,
        "missing_information": missing_info,
        "is_complete": extraction.get("is_complete", False),
        "recommendations": recommendations,
        "audit_report": audit
    }

@app.get("/api/standards")
def list_standards(search: Optional[str] = None):
    if not search:
        return standards_database
    norm = normalize_multilingual_query(search)["normalized_query"]
    results = engine.recommend(norm, top_k=15)
    return [r["standard"] for r in results]

@app.get("/api/standards/{is_code}")
def get_standard_detail(is_code: str):
    for s in standards_database:
        if s["is_code"].lower().strip() == is_code.lower().strip():
            return s
    raise HTTPException(status_code=404, detail="Standard not found.")

@app.get("/api/history")
def get_history():
    return ANALYSIS_HISTORY

@app.delete("/api/history/{session_id}")
def delete_history_item(session_id: int):
    global ANALYSIS_HISTORY
    ANALYSIS_HISTORY = [h for h in ANALYSIS_HISTORY if h["id"] != session_id]
    save_history(ANALYSIS_HISTORY)
    return {"status": "success", "remaining": len(ANALYSIS_HISTORY)}

@app.delete("/api/history")
def clear_all_history():
    global ANALYSIS_HISTORY
    ANALYSIS_HISTORY.clear()
    save_history(ANALYSIS_HISTORY)
    return {"status": "success", "message": "All session history cleared"}
