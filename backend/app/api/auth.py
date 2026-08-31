from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import UserLoginRequest, UserCreateRequest, AuthTokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

class GoogleAuthRequest(BaseModel):
    email: Optional[str] = None
    googleToken: Optional[str] = None
    personType: Optional[Literal['employee', 'citizen', 'admin']] = 'citizen'

@router.post("/login", response_model=AuthTokenResponse)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    result = auth_service.authenticate_multi_role(
        db=db,
        identifier=payload.identifier,
        password=payload.password,
        person_type=payload.personType or "citizen",
    )
    return AuthTokenResponse(**result)

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreateRequest, db: Session = Depends(get_db)):
    result = auth_service.authenticate_multi_role(
        db=db,
        identifier=payload.email,
        password=payload.password,
        person_type=payload.role.lower() if payload.role else "citizen",
    )
    return AuthTokenResponse(**result)

@router.post("/google", response_model=AuthTokenResponse)
def login_google(payload: Optional[GoogleAuthRequest] = None, db: Session = Depends(get_db)):
    person_type = payload.personType if payload else "citizen"
    email = payload.email if payload else None
    result = auth_service.authenticate_google_sso(
        db=db,
        email=email,
        person_type=person_type,
    )
    return AuthTokenResponse(**result)

@router.post("/logout")
def logout_user():
    return {"status": "success", "message": "Successfully logged out"}
