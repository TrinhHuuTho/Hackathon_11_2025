import os
import logging
from typing import Optional
from dotenv import load_dotenv

import requests
import json

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class GeminiAdapter:
    """Adapter for Google Gemini API for Flashcard Generation.

    Expects environment variables:
    - GEMINI_API_KEY (required)
    - GEMINI_MODEL (optional, defaults to gemini-2.5-flash)
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")

        self.model = model or os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        self.base_url = "https://generativelanguage.googleapis.com/v1/models"

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: int = 256,
        temperature: float = 0.2,
    ) -> str:
        # Allow an offline canned response for UI/dev testing
        use_canned = os.environ.get("USE_CANNED_LLM", "0").lower() in (
            "1",
            "true",
            "yes",
        )
        if use_canned:
            logger.info(
                "Using canned LLM response (USE_CANNED_LLM=%s)",
                os.environ.get("USE_CANNED_LLM"),
            )
            # Return a small, valid JSON array of flashcards for testing
            canned = [
                {
                    "id": "f1",
                    "type": "definition",
                    "front": "Python",
                    "back": "Ngôn ngữ lập trình cấp cao với cú pháp đơn giản và dễ học",
                    "category": "programming",
                },
                {
                    "id": "f2",
                    "type": "question",
                    "front": "Thủ đô của Việt Nam là gì?",
                    "back": "Hà Nội",
                    "category": "geography",
                },
                {
                    "id": "f3",
                    "type": "example",
                    "front": "Ví dụ về vòng lặp trong Python",
                    "back": "for i in range(5): print(i)",
                    "category": "programming",
                },
            ]
            return json.dumps(canned, ensure_ascii=False)

        # Try different model names if default fails
        model_names = [
            model or self.model,
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
        ]

        # Remove duplicates while preserving order
        seen = set()
        model_names = [x for x in model_names if not (x in seen or seen.add(x))]

        headers = {"Content-Type": "application/json"}

        # Construct the request payload for Gemini API
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max(max_tokens, 1000),  # Ensure minimum 1000 tokens
                "candidateCount": 1,
            },
        }

        last_error = None

        for model_name in model_names:
            url = f"{self.base_url}/{model_name}:generateContent"
            params = {"key": self.api_key}

            try:
                logger.info(f"Trying Gemini model: {model_name}")
                resp = requests.post(
                    url, json=payload, headers=headers, params=params, timeout=60
                )
                resp.raise_for_status()

                data = resp.json()

                # Extract text from Gemini response
                if "candidates" in data and len(data["candidates"]) > 0:
                    candidate = data["candidates"][0]

                    # Check for text content in parts (older format)
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            logger.info(f"Successfully used model: {model_name}")
                            return parts[0]["text"]

                    # Check for text directly in content (newer format)
                    elif "content" in candidate and "text" in candidate["content"]:
                        logger.info(f"Successfully used model: {model_name}")
                        return candidate["content"]["text"]

                    # Check finish reason - if MAX_TOKENS, try next model
                    elif candidate.get("finishReason") == "MAX_TOKENS":
                        logger.warning(
                            f"Model {model_name} hit MAX_TOKENS, trying next model"
                        )
                        last_error = f"Model {model_name} hit MAX_TOKENS limit"
                        continue

                    # Check if content is empty or missing
                    else:
                        logger.warning(
                            f"No text content in response from model {model_name}: {candidate}"
                        )
                        last_error = (
                            f"No text content in response from model {model_name}"
                        )
                        continue

                # If no candidates, try next model
                logger.warning(f"No candidates in response from model {model_name}")
                last_error = f"No candidates in response from model {model_name}"
                continue

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 404:
                    logger.warning(
                        f"Model {model_name} not found (404), trying next model"
                    )
                    last_error = f"Model {model_name} not found: {e}"
                    continue
                else:
                    logger.error(f"HTTP error with model {model_name}: {e}")
                    last_error = f"HTTP error with model {model_name}: {e}"
                    continue
            except Exception as e:
                logger.error(f"Unexpected error with model {model_name}: {e}")
                last_error = f"Unexpected error with model {model_name}: {e}"
                continue

        # If all models failed, raise the last error
        error_msg = f"All Gemini models failed. Last error: {last_error}"
        logger.exception(error_msg)
        raise RuntimeError(error_msg)


__all__ = ["GeminiAdapter"]
