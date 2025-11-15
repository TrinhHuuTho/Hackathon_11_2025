import logging
from typing import List, Any, Dict
from llm_adapter import GeminiAdapter
from schemas import Section, FlashcardConfig, Flashcard, FlashcardSet, GenerateRequest

logger = logging.getLogger(__name__)


def generate_flashcards(data: Dict[str, Any]) -> str:
    """Generate flashcards from text content with Vietnamese optimization.

    Args:
        data: Dictionary with required keys 'content' and optional 'config'

    Returns:
        JSON string containing flashcard data

    Raises:
        ValueError: If required keys are missing or invalid
        RuntimeError: If LLM generation fails
    """
    try:
        # Parse and validate input
        request = GenerateRequest(**data)

        # Initialize LLM adapter
        llm = GeminiAdapter()

        # Build the Vietnamese flashcard prompt
        prompt = _build_flashcard_prompt(request.sections, request.config)

        # Generate content using LLM with increased token limit
        raw_response = llm.generate(prompt, max_tokens=2000, temperature=0.3)

        logger.info(f"Raw LLM response: {raw_response}")

        # Parse and validate the response
        flashcard_set = _parse_flashcard_response(
            raw_response, request.config, request.sections
        )

        # Return JSON string
        return flashcard_set.model_dump_json(ensure_ascii=False)

    except Exception as e:
        logger.error(f"Error generating flashcards: {e}")
        raise


def _build_flashcard_prompt(sections: List[Section], config: FlashcardConfig) -> str:
    """Build the Vietnamese prompt for flashcard generation."""

    # Combine all content from sections using id and summary
    full_content = "\n\n".join(
        [f"## {section.id}\n{section.summary}" for section in sections]
    )

    # Build types string for prompt
    types_str = ", ".join(config.types)

    # Create the Vietnamese prompt optimized for flashcards
    prompt = f"""Bạn là chuyên gia tạo thẻ học (flashcard) từ nội dung văn bản tiếng Việt.

Hãy tạo {config.n_flashcards} thẻ học từ nội dung sau:

{full_content}

YÊU CẦU:
- Tạo các loại thẻ: {types_str}
- Mỗi thẻ phải có id duy nhất (f1, f2, f3...)
- Phân loại thẻ theo category phù hợp
- Front (mặt trước): câu hỏi, định nghĩa cần giải thích, hoặc ví dụ cần giải thích
- Back (mặt sau): câu trả lời, giải thích, hoặc mô tả chi tiết
- Sử dụng tiếng Việt tự nhiên và dễ hiểu

LOẠI THẺ:
- "definition": Front là khái niệm, Back là định nghĩa/giải thích
- "question": Front là câu hỏi, Back là câu trả lời
- "example": Front là ví dụ/tình huống, Back là giải thích/phân tích

Trả về JSON array với format chính xác sau (không thêm markdown hay text khác):

[
  {{
    "id": "f1",
    "type": "definition",
    "front": "Khái niệm cần định nghĩa",
    "back": "Định nghĩa hoặc giải thích chi tiết",
    "category": "chủ đề"
  }},
  {{
    "id": "f2", 
    "type": "question",
    "front": "Câu hỏi về nội dung",
    "back": "Câu trả lời chi tiết",
    "category": "chủ đề"
  }}
]"""

    return prompt


def _parse_flashcard_response(
    raw_response: str, config: FlashcardConfig, sections: List[Section] = None
) -> FlashcardSet:
    """Parse and validate the LLM response into a FlashcardSet."""
    import json

    try:
        # Clean up the response - remove markdown code blocks if present
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        # Parse JSON
        flashcard_data = json.loads(cleaned)

        # Validate it's a list
        if not isinstance(flashcard_data, list):
            raise ValueError("Response must be a JSON array of flashcards")

        # Convert to Flashcard objects
        flashcards = []
        for i, item in enumerate(flashcard_data):
            try:
                flashcard = Flashcard(**item)
                flashcards.append(flashcard)
            except Exception as e:
                logger.warning(f"Skipping invalid flashcard {i}: {e}")
                continue

        if not flashcards:
            raise ValueError("No valid flashcards found in response")

        # Create FlashcardSet - need to provide required 'id' field for FlashcardSet
        return FlashcardSet(
            id=f"flashcard_set_{sections[0].id if sections and len(sections) > 0 else 'default'}",
            flashcards=flashcards,
            meta={
                "total_count": len(flashcards),
                "requested_count": config.n_flashcards,
                "requested_types": config.types,
            },
        )

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}")
        logger.error(f"Raw response was: {raw_response}")
        raise ValueError(f"Invalid JSON response from LLM: {e}")
    except Exception as e:
        logger.error(f"Failed to parse flashcard response: {e}")
        raise ValueError(f"Failed to parse flashcard response: {e}")


__all__ = ["generate_flashcards"]
