import os
import logging
from typing import List, Optional
from vector_store_langchain import LangChainVectorStore
from schemas import RetrievalConfig, RetrievedDocument

logger = logging.getLogger(__name__)


class OptimizedDocumentRetriever:
    """
    Optimized document retriever sử dụng LangChain FAISS với persistent storage.
    Giải quyết vấn đề memory overflow và slow initialization.
    """

    def __init__(
        self,
        data_path: Optional[str] = None,
        persist_directory: Optional[str] = None,
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
    ):
        """
        Initialize optimized document retriever.

        Args:
            data_path: Path to JSON file chứa documents (mock data)
            persist_directory: Directory để persist FAISS index
            embedding_model: HuggingFace embedding model name
        """
        self.data_path = data_path or self._get_default_data_path()
        self.persist_directory = persist_directory or self._get_default_persist_dir()
        self.embedding_model = embedding_model

        # LangChain vector store instance
        self.vector_store = LangChainVectorStore(
            embedding_model=embedding_model, persist_directory=self.persist_directory
        )

        self.is_initialized = False

    def _get_default_data_path(self) -> str:
        """Get default path to mock data JSON."""
        current_dir = os.path.dirname(__file__)
        return os.path.join(current_dir, "data", "mock_summaries.json")

    def _get_default_persist_dir(self) -> str:
        """Get default persist directory for FAISS index."""
        current_dir = os.path.dirname(__file__)
        return os.path.join(current_dir, "faiss_db")

    def initialize(self, force_rebuild: bool = False) -> None:
        """
        Initialize retriever và load/build index.

        Args:
            force_rebuild: Force rebuild index từ source data
        """
        if self.is_initialized and not force_rebuild:
            logger.info("Retriever already initialized")
            return

        logger.info("Initializing optimized document retriever...")

        try:
            # Load or create FAISS index (LangChain handles persistence automatically)
            self.vector_store.load_or_create_index(
                json_path=self.data_path, force_rebuild=force_rebuild
            )

            self.is_initialized = True

            # Log performance stats
            stats = self.vector_store.get_stats()
            logger.info(
                f"✅ Retriever initialized - Documents: {stats['total_documents']}, "
                f"Vectors: {stats['total_vectors']}, "
                f"Index size: {stats['index_size_mb']:.1f} MB"
            )

        except Exception as e:
            logger.error(f"Failed to initialize retriever: {e}")
            raise

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
            logger.info("Auto-initializing retriever on first query...")
            self.initialize()

        if not query.strip():
            return []

        # Use default config if not provided
        if config is None:
            config = RetrievalConfig()

        # Perform search using LangChain vector store
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
                "persist_directory": self.persist_directory,
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
        logger.info("Clearing FAISS index cache...")
        self.vector_store.clear_index()
        self.is_initialized = False


# Backward compatibility - alias to new class
DocumentRetriever = OptimizedDocumentRetriever

# Global retriever instance (singleton pattern)
_document_retriever = None


def get_document_retriever(
    data_path: Optional[str] = None,
) -> OptimizedDocumentRetriever:
    """
    Get global document retriever instance.

    Args:
        data_path: Optional path to data file (sử dụng default nếu None)

    Returns:
        OptimizedDocumentRetriever instance
    """
    global _document_retriever

    if _document_retriever is None:
        _document_retriever = OptimizedDocumentRetriever(data_path=data_path)

    return _document_retriever


__all__ = ["OptimizedDocumentRetriever", "DocumentRetriever", "get_document_retriever"]
