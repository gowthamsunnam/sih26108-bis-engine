"""
Multilingual Preprocessing Engine for SIH26108.
Supports English, Hindi (हिन्दी), and Telugu (తెలుగు) procurement inputs.
Normalizes domain vocabulary and preserves search intent without external paid APIs.
"""
import re

INDIC_DOMAIN_DICTIONARY = {
    # Telugu Keywords
    "స్ట్రీట్": "street",
    "లైట్లు": "lights luminaires",
    "లైట్లకు": "lights luminaires",
    "లైటింగ్": "lighting",
    "ప్రమాణాలు": "standards specifications",
    "ప్రమాణం": "standard",
    "హెల్మెట్": "helmet personal protective equipment",
    "హెల్మెట్లు": "helmets head protection",
    "రక్షణ": "safety protective",
    "కేబుల్": "cable conductor",
    "కేబుళ్ళు": "cables conductors",
    "వైర్లు": "wires conductors",
    "సిమెంట్": "cement concrete",
    "స్టీల్": "steel rebar",
    "ఇనుము": "iron structural steel",
    "విద్యుత్": "electrical power voltage",
    "వాటేజ్": "wattage power",
    "వోల్టేజ్": "voltage",
    "రోడ్డు": "road street outdoor",
    "బాహ్య": "outdoor road",
    "పరిశ్రమ": "industrial",

    # Hindi Keywords
    "स्ट्रीट": "street",
    "लाइट": "light luminaire",
    "लाइटें": "lights luminaires",
    "लाइट्स": "lights luminaires",
    "रोशनी": "lighting luminaire",
    "मानक": "standard specification",
    "मानकों": "standards specifications",
    "हेलमेट": "helmet safety head protection",
    "सुरक्षा": "safety protection",
    "केबल": "cable conductor",
    "तार": "wire conductor",
    "सीमेंट": "cement concrete",
    "स्टील": "steel rebar",
    "लोहा": "iron structural steel",
    "सड़क": "road street outdoor",
    "बिजली": "electrical power voltage",
    "वोल्टेज": "voltage",
    "वाट": "watt power",
    "उद्योग": "industrial",
    "औद्योगिक": "industrial"
}

def detect_language(text: str) -> str:
    """Detect whether input is Telugu, Hindi (Devanagari), or English."""
    telugu_range = re.findall(r'[\u0C00-\u0C7F]', text)
    hindi_range = re.findall(r'[\u0900-\u097F]', text)
    
    if len(telugu_range) > len(hindi_range) and len(telugu_range) > 3:
        return "te"
    elif len(hindi_range) > 3:
        return "hi"
    return "en"

def normalize_multilingual_query(raw_text: str) -> dict:
    """
    Normalizes Telugu and Hindi procurement queries into English semantic search tokens.
    Returns detected language, normalized query string, and translation trace.
    """
    detected_lang = detect_language(raw_text)
    normalized_tokens = []
    applied_translations = []

    words = re.findall(r'[\w]+', raw_text)
    
    for word in words:
        clean_word = word.strip().lower()
        if clean_word in INDIC_DOMAIN_DICTIONARY:
            translated = INDIC_DOMAIN_DICTIONARY[clean_word]
            normalized_tokens.append(translated)
            applied_translations.append(f"{word} -> {translated}")
        else:
            normalized_tokens.append(word)

    normalized_query = " ".join(normalized_tokens)
    
    return {
        "original_query": raw_text,
        "detected_language": detected_lang,
        "normalized_query": normalized_query,
        "translated_concepts": applied_translations
    }
