"""
Flashcard Generator Package

Tạo flashcard tự động từ nội dung văn bản sử dụng Google Gemini API.
"""

__version__ = "1.0.0"
__author__ = "Hackathon Team"

from .main import generate_flashcards

__all__ = ["generate_flashcards"]
