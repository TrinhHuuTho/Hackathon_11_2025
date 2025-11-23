from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class Section(BaseModel):
    id: str
    summary: str


class FlashcardConfig(BaseModel):
    n_flashcards: int = Field(default=10, ge=1)
    types: List[str] = Field(
        default_factory=lambda: ["definition", "question", "example"]
    )
    difficulty: Optional[Dict[str, float]] = None


class GenerateRequest(BaseModel):
    document_id: Optional[str] = None
    sections: Optional[List[Section]] = None
    config: Optional[FlashcardConfig] = None


class Flashcard(BaseModel):
    id: str
    type: str
    front: str
    back: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    source_sections: Optional[List[str]] = None


class FlashcardSet(BaseModel):
    id: str
    flashcards: List[Flashcard]
    meta: Optional[Dict] = None


__all__ = ["Section", "FlashcardConfig", "GenerateRequest", "Flashcard", "FlashcardSet"]
