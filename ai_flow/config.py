"""
AI Flow Configuration

Settings and constants for the AI pipeline.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

# OCR Engine selection
OCR_ENGINE = "easyocr"  # Options: "easyocr", "paddleocr", "tesseract"

# Minimum confidence threshold for OCR results
MIN_OCR_CONFIDENCE = 0.5

# Minimum resolution for acceptable OCR images (width, height in pixels)
MIN_IMAGE_RESOLUTION = (300, 300)

# Image preprocessing settings
PREPROCESSING = {
    "resize_to_width": 1200,  # Resize large images to this width for processing
    "deskew": True,
    "denoise": True,
    "contrast_enhancement": True,
    "sharpening": True,
}

# Field extraction patterns
EXTRACTION = {
    "mrp_patterns": [
        r"MRP\s*₹?\s*([\d,\.]+)",
        r"Maximum Retail Price\s*₹?\s*([\d,\.]+)",
        r"MRP\s*:\s*([\d,\.]+)",
    ],
    "net_quantity_patterns": [
        r"Net\s*Quantity\s*([\d\.\s]+?)(?:g|kg|ml|l|pcs)",
        r"Net Weight\s*([\d\.\s]+?)(?:g|kg|ml)",
        r"Qty\s*:\s*([\d\.\s]+)",
    ],
    "manufacturer_patterns": [
        r"Manufactured\s*by\s+([A-Za-z0-9\s\.]+)",
        r"Packed\s*by\s+([A-Za-z0-9\s\.]+)",
        r"Made in\s+([A-Za-z0-9\s\.]+)",
    ],
    "expiry_date_patterns": [
        r"(?:Expiry|Exp|Best Before)\s*[:\s]*([\d/\s]+)",
        r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b",
    ],
    "mfg_date_patterns": [
        r"(?:Mfg|Manufacture|Packed)\s*[:\s]*([\d/\s]+)",
        r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b",
    ],
    "consumer_care_patterns": [
        r"Consumer\s*Care[:\s]*(.+)",
        r"Customer\s*Care[:\s]*(.+)",
        r"Helpline[:\s]*(.+)",
        r"Call\s*[:\s]*(.+)",
    ],
}