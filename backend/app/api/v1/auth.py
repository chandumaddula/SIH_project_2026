from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import auth_service
from app.schemas.auth import UserLoginRequest, UserCreateRequest, AuthTokenResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

class SimpleLoginPayload(BaseModel):
    identifier: Optional[str] = "citizen-101"
    password: Optional[str] = "password123"
    personType: Optional[Literal['employee', 'citizen', 'admin']] = 'citizen'

class GoogleLoginPayload(BaseModel):
    email: Optional[str] = None
    googleToken: Optional[str] = None
    personType: Optional[Literal['employee', 'citizen', 'admin']] = 'citizen'

@router.post("/register")
def register(payload: Optional[UserCreateRequest] = None, db: Session = Depends(get_db)):
    if payload:
        result = auth_service.authenticate_multi_role(
            db=db,
            identifier=payload.email,
            password=payload.password,
            person_type=payload.role.lower() if payload.role else "citizen",
        )
        return AuthTokenResponse(**result)
    return {
        "message": "Register API working",
        "status": "success"
    }

@router.post("/login")
def login(payload: Optional[SimpleLoginPayload] = None, db: Session = Depends(get_db)):
    if payload and payload.identifier and payload.password:
        result = auth_service.authenticate_multi_role(
            db=db,
            identifier=payload.identifier,
            password=payload.password,
            person_type=payload.personType or "citizen",
        )
        return AuthTokenResponse(**result)
    return {
        "message": "Login API working",
        "status": "success"
    }

@router.post("/google", response_model=AuthTokenResponse)
def login_with_google(payload: Optional[GoogleLoginPayload] = None, db: Session = Depends(get_db)):
    person_type = payload.personType if payload else "citizen"
    email = payload.email if payload else None
    result = auth_service.authenticate_google_sso(
        db=db,
        email=email,
        person_type=person_type,
    )
    return AuthTokenResponse(**result)
