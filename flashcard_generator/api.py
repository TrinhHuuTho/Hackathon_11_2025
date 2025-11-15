"""
FastAPI server for Flashcard Generator
=====================================

RESTful API endpoints for generating flashcards from Vietnamese text content.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
import logging
import json
from typing import Dict, Any

from .tasks import generate_flashcards

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Flashcard Generator API",
    description="Generate Vietnamese flashcards from text content using Google Gemini API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ErrorResponse(BaseModel):
    error: str
    details: str = None


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy", service="flashcard_generator", version="1.0.0"
    )


@app.post("/flashcard/generate")
async def generate_flashcard_endpoint(request_data: Dict[str, Any]):
    """
    Generate flashcards from text content.

    Expected input format:
    {
        "sections": [
            {
                "id": "section_id",
                "summary": "Section summary content..."
            }
        ],
        "config": {
            "n_flashcards": 8,
            "types": ["definition", "question", "example"]
        }
    }

    Returns JSON flashcard data.
    """
    try:
        logger.info(
            f"Received flashcard generation request: {json.dumps(request_data, ensure_ascii=False)}"
        )

        # Generate flashcards using the existing function
        result_json = generate_flashcards(request_data)

        # Parse JSON to validate it's correct
        result_data = json.loads(result_json)

        logger.info(
            f"Successfully generated {len(result_data.get('flashcards', []))} flashcards"
        )

        return result_data

    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid input data: {str(e)}")
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to parse generated flashcards: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Flashcard Generator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {"generate_flashcard": "POST /flashcard/generate"},
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8004, reload=False, log_level="info")
