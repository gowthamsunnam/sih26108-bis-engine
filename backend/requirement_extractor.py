"""
Structured Requirement Extraction & Missing Information Analyzer for SIH26108.
Extracts product, quantities, voltage, wattage, IP ratings, materials, protections, and applications.
Detects ambiguity and prompts for missing technical specs without guessing.
"""
import re

def extract_structured_requirements(text: str) -> dict:
    text_clean = text.replace("\n", " ").strip()
    text_lower = text_clean.lower()
    
    # 1. Protection & Performance Specs
    protections = []
    if any(k in text_lower for k in ["impact", "shock", "drop", "deflection", "absorption"]):
        protections.append("Impact & Shock Absorption")
    if any(k in text_lower for k in ["electric", "electrical", "voltage", "dielectric", "2000v", "shock hazard"]):
        protections.append("Electrical Hazard / Dielectric Protection")
    if any(k in text_lower for k in ["penetration", "puncture", "spike"]):
        protections.append("Penetration & Puncture Resistance")
    if any(k in text_lower for k in ["fire", "flame", "flammability", "heat"]):
        protections.append("Flame & Thermal Retardance")
    if any(k in text_lower for k in ["water", "ip65", "ip66", "ip67", "weatherproof"]):
        protections.append("Weather & Ingress Protection")

    # 2. Intended Applications / Sectors
    applications = []
    if any(k in text_lower for k in ["construct", "civil", "building", "site"]):
        applications.append("Construction & Civil Infrastructure")
    if any(k in text_lower for k in ["factory", "plant", "floor", "manufacturing", "industrial", "warehouse"]):
        applications.append("Industrial & Factory Floor Operations")
    if any(k in text_lower for k in ["mine", "mining", "quarry"]):
        applications.append("Mining & Subterranean Operations")
    if any(k in text_lower for k in ["motorcycle", "bike", "two-wheeler", "rider", "road"]):
        applications.append("Two-Wheeler Road Transit")
    if any(k in text_lower for k in ["power", "substation", "feeder", "grid"]):
        applications.append("High Voltage Power Distribution")

    # 3. Product Identification
    product = "Industrial Safety Equipment"
    category = "Occupational PPE"
    if any(k in text_lower for k in ["helmet", "hard hat", "head protection"]):
        if any(k in text_lower for k in ["bike", "motorcycle", "two-wheeler", "rider"]):
            product = "Protective Rider Helmet"
            category = "Automotive Safety"
        else:
            product = "Industrial Safety Helmet"
            category = "Occupational PPE"
    elif any(k in text_lower for k in ["cable", "conductor", "wire"]):
        product = "Electric Power Cable"
        category = "Electrical Conductors & Cables"
    elif any(k in text_lower for k in ["light", "led", "luminaire"]):
        product = "LED Luminaire Fixture"
        category = "Lighting & Electrical Luminaires"
    elif any(k in text_lower for k in ["steel", "rebar", "tmt"]):
        product = "High Strength Deformed Steel Rebar"
        category = "Construction Materials"
    elif any(k in text_lower for k in ["shoe", "footwear", "boot"]):
        product = "Safety Footwear"
        category = "Occupational PPE"
    elif any(k in text_lower for k in ["pipe", "hdpe", "upvc"]):
        product = "Pressure Pipes for Water Supply"
        category = "Piping & Irrigation"
    elif any(k in text_lower for k in ["cement", "opc"]):
        product = "Ordinary Portland Cement"
        category = "Construction Materials"
    elif any(k in text_lower for k in ["water", "mineral water", "drinking water"]):
        product = "Packaged / Potable Water"
        category = "Public Health / Water"

    # 4. Quantity & Power & Voltage & IP & Materials
    qty_match = re.search(r'\b(\d{1,6})\s*(?:nos|units|pieces|sets|meters|mt|km|bags)?\b', text_clean, re.I)
    quantity = qty_match.group(1) if qty_match and int(qty_match.group(1)) > 0 else None

    power_match = re.search(r'\b(\d{1,4}\s*(?:w|watt|kw|kva))\b', text_clean, re.I)
    power = power_match.group(1).upper() if power_match else None

    voltage_match = re.search(r'\b(\d{2,4}\s*(?:v|volt|kv))\b', text_clean, re.I)
    voltage = voltage_match.group(1).upper() if voltage_match else None

    ip_match = re.search(r'\b(IP\s*\d{2})\b', text_clean, re.I)
    ip_rating = ip_match.group(1).replace(" ", "").upper() if ip_match else None

    materials = []
    for mat in ["XLPE", "PVC", "Copper", "Aluminium", "HDPE", "ABS", "Steel", "TMT", "Fly Ash", "OPC", "Slag"]:
        if re.search(rf'\b{mat}\b', text_clean, re.I):
            materials.append(mat)

    # Missing Information Check
    missing_fields = []
    if category == "Occupational PPE" and "Helmet" in product:
        if "Electrical Hazard / Dielectric Protection" not in protections:
            missing_fields.append({"field": "Electrical Protection Class", "prompt": "Specify if Class B electrical protection (up to 2000V dielectric) or Class A is needed."})
        if not applications:
            missing_fields.append({"field": "Operating Environment", "prompt": "Clarify if intended for Construction, Factory Operations, or Mining."})
    elif category in ["Lighting & Electrical Luminaires", "Consumer Lighting"]:
        if not power:
            missing_fields.append({"field": "Power / Wattage", "prompt": "Specify nominal wattage (e.g. 90W, 120W) for photometric load."})
        if not ip_rating:
            missing_fields.append({"field": "Ingress Protection (IP)", "prompt": "Outdoor public luminaires require IP rating (e.g. IP65 or IP66)."})
    elif category == "Electrical Conductors & Cables":
        if "XLPE" not in materials and "PVC" not in materials:
            missing_fields.append({"field": "Insulation Compound", "prompt": "Clarify if insulation must be XLPE (IS 7098) or PVC (IS 1554)."})
        if not voltage:
            missing_fields.append({"field": "Voltage Rating", "prompt": "Specify working voltage (e.g., 1.1 kV, 11 kV, 33 kV)."})

    return {
        "extracted_parameters": {
            "product": product,
            "category": category,
            "quantity": quantity,
            "power": power,
            "voltage": voltage,
            "ip_rating": ip_rating,
            "materials": materials,
            "protections_demanded": protections,
            "applications": applications
        },
        "missing_information": missing_fields,
        "is_complete": len(missing_fields) == 0
    }
