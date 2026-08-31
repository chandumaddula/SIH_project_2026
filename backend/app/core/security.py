import hashlib
from datetime import datetime, timedelta
from typing import Any, Optional, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_password = plain_password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    if hashed_password.startswith("pbkdf2:"):
        return hashed_password == f"pbkdf2:{hashlib.sha256(safe_password.encode()).hexdigest()}"
    try:
        return pwd_context.verify(safe_password, hashed_password)
    except Exception:
        return hashed_password == f"pbkdf2:{hashlib.sha256(safe_password.encode()).hexdigest()}"

def get_password_hash(password: str) -> str:
    safe_password = password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    try:
        return pwd_context.hash(safe_password)
    except Exception:
        return f"pbkdf2:{hashlib.sha256(safe_password.encode()).hexdigest()}"
