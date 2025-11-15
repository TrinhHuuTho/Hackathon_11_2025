import os
import logging
from typing import List, Optional
from vector_store import FAISSVectorStore
from schemas import RetrievalConfig, RetrievedDocument

logger = logging.getLogger(__name__)


class DocumentRetriever:
    """Document retrieval service sử dụng FAISS vector store."""

    def __init__(
        self,
        data_path: Optional[str] = None,
        index_cache_dir: Optional[str] = None,
        embedding_model: str = "all-MiniLM-L6-v2",
    ):
        """
        Initialize document retriever.

        Args:
            data_path: Path to JSON file chứa documents (mock data)
            index_cache_dir: Directory để cache FAISS index
            embedding_model: Sentence transformer model name
        """
        self.data_path = data_path or self._get_default_data_path()
        self.index_cache_dir = index_cache_dir or self._get_default_cache_dir()
        self.embedding_model = embedding_model

        # Vector store instance
        self.vector_store = None
        self.is_initialized = False

    def _get_default_data_path(self) -> str:
        """Get default path to mock data JSON."""
        # Assume được gọi từ package root
        current_dir = os.path.dirname(__file__)
        return os.path.join(current_dir, "data", "mock_summaries.json")

    def _get_default_cache_dir(self) -> str:
        """Get default cache directory for FAISS index."""
        current_dir = os.path.dirname(__file__)
        return os.path.join(current_dir, "cache")

    def initialize(self, force_rebuild: bool = False) -> None:
        """
        Initialize retriever và load/build index.

        Args:
            force_rebuild: Force rebuild index từ source data
        """
        if self.is_initialized and not force_rebuild:
            return

        logger.info("Initializing document retriever...")

        # Create vector store
        self.vector_store = FAISSVectorStore()

        # Try to load existing index
        if not force_rebuild and os.path.exists(self.index_cache_dir):
            try:
                self.vector_store.load_index(self.index_cache_dir)
                logger.info("Loaded existing FAISS index from cache")
                self.is_initialized = True
                return
            except Exception as e:
                logger.warning(f"Failed to load cached index: {e}. Rebuilding...")

        # Build new index từ data source
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Data file not found: {self.data_path}")

        self.vector_store.load_documents_from_json(self.data_path)

        # Save index to cache
        try:
            self.vector_store.save_index(self.index_cache_dir)
            logger.info("FAISS index cached for future use")
        except Exception as e:
            logger.warning(f"Failed to cache index: {e}")

        self.is_initialized = True
        logger.info("Document retriever initialized successfully")

    def retrieve_documents(
        self, query: str, config: Optional[RetrievalConfig] = None
    ) -> List[RetrievedDocument]:
        """
        Retrieve relevant documents cho query.

        Args:
            query: Search query string
            config: Retrieval configuration (sử dụng default nếu None)

        Returns:
            List of relevant documents với similarity scores
        """
        if not self.is_initialized:
            self.initialize()

        if not query.strip():
            return []

        # Use default config if not provided
        if config is None:
            config = RetrievalConfig()

        # Perform search
        retrieved_docs = self.vector_store.search(query, config)

        logger.info(
            f"Retrieved {len(retrieved_docs)} documents for query: '{query[:50]}...'"
        )

        return retrieved_docs

    def get_document_by_id(self, document_id: str) -> Optional[dict]:
        """
        Get full document by ID.

        Args:
            document_id: Document ID to retrieve

        Returns:
            Document data or None if not found
        """
        if not self.is_initialized:
            self.initialize()

        if document_id in self.vector_store.documents:
            doc = self.vector_store.documents[document_id]
            return doc.model_dump()

        return None

    def get_stats(self) -> dict:
        """Get retriever statistics."""
        if not self.is_initialized:
            return {"status": "not_initialized"}

        stats = self.vector_store.get_stats()
        stats.update(
            {
                "data_source": self.data_path,
                "cache_directory": self.index_cache_dir,
                "embedding_model": self.embedding_model,
                "initialized": self.is_initialized,
            }
        )

        return stats

    def list_all_topics(self) -> List[str]:
        """Get list of all unique topics trong documents."""
        if not self.is_initialized:
            self.initialize()

        topics = set()
        for doc in self.vector_store.documents.values():
            topics.add(doc.topic)

        return sorted(list(topics))

    def list_all_categories(self) -> List[str]:
        """Get list of all unique categories trong documents."""
        if not self.is_initialized:
            self.initialize()

        categories = set()
        for doc in self.vector_store.documents.values():
            categories.add(doc.category)

        return sorted(list(categories))

    def search_by_filters(
        self,
        topic: Optional[str] = None,
        category: Optional[str] = None,
        user_id: Optional[str] = None,
        limit: int = 10,
    ) -> List[dict]:
        """
        Search documents by metadata filters (không cần query text).

        Args:
            topic: Filter by topic
            category: Filter by category
            user_id: Filter by user_id
            limit: Maximum results to return

        Returns:
            List of matching documents
        """
        if not self.is_initialized:
            self.initialize()

        results = []

        for doc in self.vector_store.documents.values():
            # Apply filters
            if topic and doc.topic.lower() != topic.lower():
                continue
            if category and doc.category.lower() != category.lower():
                continue
            if user_id and doc.user_id != user_id:
                continue

            results.append(doc.model_dump())

            if len(results) >= limit:
                break

        return results

    def rebuild_index(self) -> None:
        """Force rebuild FAISS index từ source data."""
        logger.info("Rebuilding FAISS index...")
        self.initialize(force_rebuild=True)

    def clear_cache(self) -> None:
        """Clear cached FAISS index."""
        try:
            import shutil

            if os.path.exists(self.index_cache_dir):
                shutil.rmtree(self.index_cache_dir)
                logger.info("FAISS index cache cleared")
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")


# Global retriever instance (singleton pattern)
_document_retriever = None


def get_document_retriever(data_path: Optional[str] = None) -> DocumentRetriever:
    """
    Get global document retriever instance.

    Args:
        data_path: Optional path to data file (sử dụng default nếu None)

    Returns:
        DocumentRetriever instance
    """
    global _document_retriever

    if _document_retriever is None:
        _document_retriever = DocumentRetriever(data_path=data_path)

    return _document_retriever


__all__ = ["DocumentRetriever", "get_document_retriever"]
