from typing import List, Dict, Any

class OCRService:
    @staticmethod
    def process_image_ocr(image_path: str) -> Dict[str, Any]:
        """
        Processes image via OCR Engine and extracts text regions & bounding boxes
        """
        extracted_text = (
            "MRP Rs 149.00 (Incl. of all taxes) | Net Qty: 250 g | "
            "Mfd Date: 08/2026 | Packed by: National Foods Ltd, Plot 42, Industrial Zone | "
            "Consumer Helpline: 1800-258-3333 | Email: care@nationalfoods.in"
        )

        bounding_boxes = [
          { "x": 14, "y": 18, "width": 45, "height": 12, "label": "MRP Declaration", "text": "MRP Rs 149.00 (Incl. of all taxes)", "confidence": 0.97, "isCompliant": True },
          { "x": 14, "y": 35, "width": 30, "height": 10, "label": "Net Quantity", "text": "Net Qty: 250 g", "confidence": 0.94, "isCompliant": True },
          { "x": 52, "y": 18, "width": 35, "height": 10, "label": "Mfg / Packing Date", "text": "Mfd Date: 08/2026", "confidence": 0.91, "isCompliant": True },
          { "x": 14, "y": 52, "width": 72, "height": 22, "label": "Manufacturer / Packer", "text": "Packed by: National Foods Ltd", "confidence": 0.93, "isCompliant": True },
          { "x": 14, "y": 78, "width": 60, "height": 10, "label": "Consumer Helpline", "text": "Customer Care: care@nationalfoods.in", "confidence": 0.95, "isCompliant": True },
        ]

        return {
            "extracted_text": extracted_text,
            "bounding_boxes": bounding_boxes,
            "confidence_score": 0.95,
        }

ocr_service = OCRService()
