from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class BoundingBoxSchema(BaseModel):
    x: float = Field(..., description="Percent x offset 0-100")
    y: float = Field(..., description="Percent y offset 0-100")
    width: float = Field(..., description="Percent width 0-100")
    height: float = Field(..., description="Percent height 0-100")
    label: str
    text: str
    confidence: float
    is_compliant: bool = True

class OCRResponse(BaseModel):
    id: int
    extracted_text: Optional[str] = None
    bounding_boxes: List[BoundingBoxSchema] = []
    confidence_score: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True
