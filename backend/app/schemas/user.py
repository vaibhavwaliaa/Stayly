"""
User schemas — request/response shapes for user-related endpoints.
UserRead deliberately omits password_hash for security.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ─── Base ─────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    """Shared fields between create and read."""
    name: str = Field(..., min_length=1, max_length=100, examples=["Vaibhav"])
    email: str = Field(..., max_length=255, examples=["vaibhav@example.com"])


# ─── Create ───────────────────────────────────────────────────────────────────

class UserCreate(UserBase):
    """Fields required to register a new user."""
    password: str = Field(..., min_length=6, max_length=128, examples=["securepass123"])
    is_host: bool = Field(default=False, examples=[False])


# ─── Update ───────────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    """Partial update — all fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
    is_host: Optional[bool] = None


# ─── Read ─────────────────────────────────────────────────────────────────────

class UserRead(UserBase):
    """
    Public user representation — NEVER includes password_hash.
    Used in API responses and nested in other schemas.
    """
    id: int
    is_host: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HostSummary(BaseModel):
    """
    Lightweight host info embedded in listing detail responses.
    Shows just enough for the listing page's "Hosted by X" section.
    """
    id: int
    name: str
    avatar_url: Optional[str] = None
    host_since: datetime  # maps to user.created_at

    model_config = ConfigDict(from_attributes=True)


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    """Login credentials."""
    email: str = Field(..., examples=["vaibhav@example.com"])
    password: str = Field(..., examples=["securepass123"])


class TokenResponse(BaseModel):
    """JWT token returned after login/register."""
    access_token: str
    token_type: str = "bearer"
    user: UserRead
