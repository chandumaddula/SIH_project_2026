from typing import Optional, Literal
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserCreate, Token, TokenData

PersonType = Literal['employee', 'citizen', 'admin']

class UserLogin(BaseModel):
    email: Optional[str] = None
    identifier: Optional[str] = None
    password: str

class UserLoginRequest(BaseModel):
    identifier: str
    password: str
    personType: Optional[PersonType] = 'citizen'

class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "CITIZEN"
    department: Optional[str] = None
    organisation_name: Optional[str] = None

class AuthUserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    personType: Optional[str] = None

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    isAuthenticated: bool = True
    personType: str
    user: AuthUserResponse

__all__ = [
    "UserCreate",
    "UserLogin",
    "Token",
    "TokenData",
    "UserCreateRequest",
    "UserLoginRequest",
    "AuthUserResponse",
    "AuthTokenResponse",
]
