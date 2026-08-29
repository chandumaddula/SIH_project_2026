import os
import uuid
from typing import Tuple
from PIL import Image, ImageOps
from fastapi import UploadFile, HTTPException, status

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MIN_FILE_SIZE_BYTES = 1024  # 1 KB
MIN_IMAGE_DIMENSION_PX = 300

def validate_image_file(file: UploadFile, content: bytes) -> Tuple[str, str, int]:
    filename = file.filename or "upload.jpg"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: JPG, PNG, WEBP.",
        )

    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{file.content_type}'. Must be image/jpeg, image/png, or image/webp.",
        )

    file_size = len(content)
    if file_size < MIN_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size too small ({file_size} B). Minimum required size is 1 KB.",
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large. Maximum allowed size is 10 MB.",
        )

    return filename, ext, file_size

def generate_unique_filename(original_filename: str, user_id: str = None) -> str:
    ext = os.path.splitext(original_filename)[1].lower() or ".jpg"
    unique_id = uuid.uuid4().hex[:8]
    prefix = f"user{user_id}_" if user_id else "scan_"
    return f"{prefix}{unique_id}{ext}"
