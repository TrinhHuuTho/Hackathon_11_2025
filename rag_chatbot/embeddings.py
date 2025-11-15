import os
import logging
import numpy as np
from typing import List, Union
from sentence_transformers import SentenceTransformer
import torch

logger = logging.getLogger(__name__)


class TextEmbedding:
    """Text embedding service sử dụng sentence-transformers local models."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize embedding model.

        Args:
            model_name: Tên model sentence-transformers.
                       'all-MiniLM-L6-v2' (~90MB) - nhanh, hiệu quả cho tiếng Anh
                       'paraphrase-multilingual-MiniLM-L12-v2' - hỗ trợ đa ngôn ngữ tốt hơn
        """
        self.model_name = model_name
        self.model = None
        self.embedding_dim = None

        # Tạo cache directory cho models
        self.cache_dir = os.path.join(os.path.expanduser("~"), ".sentence_transformers")
        os.makedirs(self.cache_dir, exist_ok=True)

    def load_model(self) -> None:
        """Load sentence transformer model."""
        try:
            logger.info(f"Loading sentence transformer model: {self.model_name}")

            # Sử dụng CPU để đảm bảo compatibility
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {device}")

            self.model = SentenceTransformer(
                self.model_name, cache_folder=self.cache_dir, device=device
            )

            # Get embedding dimension
            self.embedding_dim = self.model.get_sentence_embedding_dimension()
            logger.info(
                f"Model loaded successfully. Embedding dimension: {self.embedding_dim}"
            )

        except Exception as e:
            logger.error(f"Failed to load model {self.model_name}: {e}")
            raise RuntimeError(f"Cannot load embedding model: {e}")

    def ensure_model_loaded(self) -> None:
        """Ensure model is loaded before use."""
        if self.model is None:
            self.load_model()

    def embed_text(self, text: str) -> np.ndarray:
        """
        Embed single text string.

        Args:
            text: Input text string

        Returns:
            Numpy array với embedding vector
        """
        self.ensure_model_loaded()

        try:
            # Preprocess text - clean và normalize
            cleaned_text = self._preprocess_text(text)

            # Generate embedding
            embedding = self.model.encode(
                cleaned_text,
                convert_to_numpy=True,
                normalize_embeddings=True,  # Normalize cho cosine similarity
            )

            return embedding

        except Exception as e:
            logger.error(f"Failed to embed text: {e}")
            # Return zero vector as fallback
            return np.zeros(self.embedding_dim, dtype=np.float32)

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """
        Embed multiple texts in batch (more efficient).

        Args:
            texts: List of text strings

        Returns:
            Numpy array với shape (len(texts), embedding_dim)
        """
        self.ensure_model_loaded()

        if not texts:
            return np.array([]).reshape(0, self.embedding_dim)

        try:
            # Preprocess all texts
            cleaned_texts = [self._preprocess_text(text) for text in texts]

            # Batch embedding generation
            embeddings = self.model.encode(
                cleaned_texts,
                convert_to_numpy=True,
                normalize_embeddings=True,
                batch_size=32,  # Process in batches để tránh memory issues
                show_progress_bar=len(texts) > 100,  # Show progress for large batches
            )

            return embeddings

        except Exception as e:
            logger.error(f"Failed to embed text batch: {e}")
            # Return zero vectors as fallback
            return np.zeros((len(texts), self.embedding_dim), dtype=np.float32)

    def compute_similarity(
        self, embedding1: np.ndarray, embedding2: np.ndarray
    ) -> float:
        """
        Compute cosine similarity between two embeddings.

        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector

        Returns:
            Cosine similarity score (0-1)
        """
        try:
            # Normalize vectors (đảm bảo unit vectors)
            norm1 = np.linalg.norm(embedding1)
            norm2 = np.linalg.norm(embedding2)

            if norm1 == 0 or norm2 == 0:
                return 0.0

            # Cosine similarity
            similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)

            # Clamp to [0, 1] range
            return max(0.0, min(1.0, float(similarity)))

        except Exception as e:
            logger.error(f"Failed to compute similarity: {e}")
            return 0.0

    def _preprocess_text(self, text: str) -> str:
        """
        Preprocess text trước khi embedding.

        Args:
            text: Raw input text

        Returns:
            Cleaned text
        """
        if not isinstance(text, str):
            text = str(text)

        # Basic cleaning
        text = text.strip()

        # Replace multiple whitespaces với single space
        import re

        text = re.sub(r"\s+", " ", text)

        # Truncate nếu quá dài (models có limit)
        max_length = 512  # Typical transformer limit
        if len(text) > max_length:
            text = text[:max_length]
            logger.warning(f"Text truncated to {max_length} characters")

        return text

    def get_model_info(self) -> dict:
        """Get information about current model."""
        self.ensure_model_loaded()

        return {
            "model_name": self.model_name,
            "embedding_dimension": self.embedding_dim,
            "device": str(self.model.device) if self.model else "not_loaded",
            "cache_dir": self.cache_dir,
            "max_sequence_length": getattr(self.model, "max_seq_length", "unknown"),
        }


# Global embedding instance (singleton pattern)
_embedding_service = None


def get_embedding_service(model_name: str = "all-MiniLM-L6-v2") -> TextEmbedding:
    """
    Get global embedding service instance.

    Args:
        model_name: Model name for sentence transformers

    Returns:
        TextEmbedding service instance
    """
    global _embedding_service

    if _embedding_service is None or _embedding_service.model_name != model_name:
        _embedding_service = TextEmbedding(model_name)

    return _embedding_service


__all__ = ["TextEmbedding", "get_embedding_service"]
