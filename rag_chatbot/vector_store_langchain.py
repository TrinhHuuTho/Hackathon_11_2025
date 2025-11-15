import os
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
import shutil

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import CharacterTextSplitter

from schemas import SummaryDocument, DocumentChunk, RetrievalConfig, RetrievedDocument

logger = logging.getLogger(__name__)


class LangChainVectorStore:
    """
    LangChain-based FAISS vector store với persistent storage.
    Giải quyết vấn đề memory overflow và slow initialization.
    """

    def __init__(
        self,
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        persist_directory: str = "faiss_db",
    ):
        """
        Initialize LangChain FAISS vector store.

        Args:
            embedding_model: HuggingFace embedding model name
            persist_directory: Directory to save FAISS index
        """
        self.embedding_model_name = embedding_model
        self.persist_directory = persist_directory

        # Initialize embeddings (lightweight operation)
        self.embeddings = HuggingFaceEmbeddings(
            model_name=embedding_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

        # Vector store instance (lazy initialized)
        self.vectorstore: Optional[FAISS] = None
        self.is_loaded = False

        # Document metadata storage
        self.documents: Dict[str, SummaryDocument] = {}

    def load_or_create_index(self, json_path: str, force_rebuild: bool = False) -> None:
        """
        Load existing FAISS index or create new one.

        Args:
            json_path: Path to JSON file with documents
            force_rebuild: Force rebuild even if index exists
        """
        logger.info("Loading or creating FAISS index...")

        # Check if persistent index exists
        index_exists = os.path.exists(self.persist_directory) and os.path.exists(
            os.path.join(self.persist_directory, "index.faiss")
        )

        if index_exists and not force_rebuild:
            # Load existing index (FAST!)
            try:
                logger.info("Loading existing FAISS index from disk...")
                self.vectorstore = FAISS.load_local(
                    self.persist_directory,
                    self.embeddings,
                    allow_dangerous_deserialization=True,  # Required for FAISS loading
                )

                # Load document metadata
                self._load_document_metadata()

                self.is_loaded = True
                logger.info(
                    f"✅ FAISS index loaded successfully! Documents: {len(self.documents)}"
                )
                return

            except Exception as e:
                logger.warning(f"Failed to load existing index: {e}. Rebuilding...")

        # Create new index từ documents
        self._build_new_index(json_path)

    def _build_new_index(self, json_path: str) -> None:
        """Build new FAISS index từ JSON documents."""
        logger.info("Building new FAISS index from documents...")

        if not os.path.exists(json_path):
            raise FileNotFoundError(f"JSON file not found: {json_path}")

        # Load documents từ JSON
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Handle both array format và nested object format
        if isinstance(data, dict) and "summaries" in data:
            raw_documents = data["summaries"]
        elif isinstance(data, list):
            raw_documents = data
        else:
            raise ValueError(f"Unsupported JSON format in {json_path}")

        # Convert to LangChain documents với chunking
        langchain_docs = []
        self.documents = {}

        # Text splitter for chunking
        text_splitter = CharacterTextSplitter(
            chunk_size=200, chunk_overlap=50, separator=". "
        )

        logger.info(f"Processing {len(raw_documents)} documents...")

        for doc_data in raw_documents:
            # Create SummaryDocument
            summary_doc = SummaryDocument(
                id=doc_data["id"],
                content=doc_data["content"],
                topic=doc_data["topic"],
                category=doc_data["category"],
                user_id=doc_data["user_id"],
                created_at=datetime.fromisoformat(doc_data["created_at"]),
                tags=doc_data.get("tags", []),
            )

            self.documents[summary_doc.id] = summary_doc

            # Split document into chunks
            chunks = text_splitter.split_text(summary_doc.content)

            # Create LangChain documents for each chunk
            for i, chunk_text in enumerate(chunks):
                if len(chunk_text.strip()) < 10:  # Skip very short chunks
                    continue

                metadata = {
                    "document_id": summary_doc.id,
                    "chunk_id": f"{summary_doc.id}_chunk_{i}",
                    "topic": summary_doc.topic,
                    "category": summary_doc.category,
                    "user_id": summary_doc.user_id,
                    "chunk_index": i,
                    "tags": ",".join(summary_doc.tags),
                }

                langchain_doc = Document(page_content=chunk_text, metadata=metadata)
                langchain_docs.append(langchain_doc)

        if not langchain_docs:
            raise ValueError("No valid document chunks found")

        logger.info(
            f"Created {len(langchain_docs)} chunks from {len(raw_documents)} documents"
        )

        # Create FAISS vectorstore (memory intensive operation)
        logger.info("Building FAISS index... (this may take a while)")
        self.vectorstore = FAISS.from_documents(
            documents=langchain_docs, embedding=self.embeddings
        )

        # Save to disk for future use
        self._save_index()

        self.is_loaded = True
        logger.info("✅ FAISS index built and saved successfully!")

    def _save_index(self) -> None:
        """Save FAISS index và metadata to disk."""
        try:
            # Create persist directory
            os.makedirs(self.persist_directory, exist_ok=True)

            # Save FAISS index
            self.vectorstore.save_local(self.persist_directory)

            # Save document metadata
            metadata_path = os.path.join(
                self.persist_directory, "documents_metadata.json"
            )
            with open(metadata_path, "w", encoding="utf-8") as f:
                serializable_docs = {}
                for doc_id, doc in self.documents.items():
                    doc_dict = doc.model_dump()
                    doc_dict["created_at"] = doc_dict["created_at"].isoformat()
                    serializable_docs[doc_id] = doc_dict

                json.dump(serializable_docs, f, ensure_ascii=False, indent=2)

            logger.info(f"Index saved to: {self.persist_directory}")

        except Exception as e:
            logger.error(f"Failed to save index: {e}")

    def _load_document_metadata(self) -> None:
        """Load document metadata từ disk."""
        metadata_path = os.path.join(self.persist_directory, "documents_metadata.json")

        if not os.path.exists(metadata_path):
            logger.warning("No document metadata found")
            return

        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                serializable_docs = json.load(f)

            for doc_id, doc_data in serializable_docs.items():
                doc_data["created_at"] = datetime.fromisoformat(doc_data["created_at"])
                self.documents[doc_id] = SummaryDocument(**doc_data)

            logger.info(f"Loaded metadata for {len(self.documents)} documents")

        except Exception as e:
            logger.error(f"Failed to load document metadata: {e}")

    def search(self, query: str, config: RetrievalConfig) -> List[RetrievedDocument]:
        """
        Search for similar documents.

        Args:
            query: Search query
            config: Retrieval configuration

        Returns:
            List of relevant documents với similarity scores
        """
        if not self.is_loaded or not self.vectorstore:
            raise RuntimeError(
                "Vector store not loaded. Call load_or_create_index() first."
            )

        if not query.strip():
            return []

        try:
            # Perform similarity search with scores
            results = self.vectorstore.similarity_search_with_score(
                query=query, k=config.top_k
            )

            retrieved_docs = []

            for doc, score in results:
                # Convert score to similarity (FAISS returns distance, lower = more similar)
                similarity_score = 1 / (1 + score)  # Convert distance to similarity

                # Apply similarity threshold
                if similarity_score < config.similarity_threshold:
                    continue

                # Apply filters if specified
                if (
                    config.user_filter
                    and doc.metadata.get("user_id") != config.user_filter
                ):
                    continue
                if (
                    config.topic_filter
                    and doc.metadata.get("topic") != config.topic_filter
                ):
                    continue

                retrieved_doc = RetrievedDocument(
                    document_id=doc.metadata["document_id"],
                    chunk_id=doc.metadata["chunk_id"],
                    content=doc.page_content,
                    topic=doc.metadata["topic"],
                    category=doc.metadata["category"],
                    similarity_score=similarity_score,
                    tags=(
                        doc.metadata.get("tags", "").split(",")
                        if doc.metadata.get("tags")
                        else []
                    ),
                )

                retrieved_docs.append(retrieved_doc)

            # Sort by similarity score (descending)
            retrieved_docs.sort(key=lambda x: x.similarity_score, reverse=True)

            return retrieved_docs

        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    def get_stats(self) -> Dict[str, Any]:
        """Get vector store statistics."""
        stats = {
            "is_loaded": self.is_loaded,
            "persist_directory": self.persist_directory,
            "embedding_model": self.embedding_model_name,
            "total_documents": len(self.documents),
        }

        if self.is_loaded and self.vectorstore:
            stats.update(
                {
                    "total_vectors": self.vectorstore.index.ntotal,
                    "embedding_dimension": self.vectorstore.index.d,
                    "index_size_mb": self._get_index_size_mb(),
                }
            )
        else:
            stats.update(
                {"total_vectors": 0, "embedding_dimension": 0, "index_size_mb": 0}
            )

        return stats

    def _get_index_size_mb(self) -> float:
        """Get index size in MB."""
        try:
            if not os.path.exists(self.persist_directory):
                return 0.0

            total_size = 0
            for root, dirs, files in os.walk(self.persist_directory):
                for file in files:
                    file_path = os.path.join(root, file)
                    total_size += os.path.getsize(file_path)

            return total_size / (1024 * 1024)  # Convert to MB

        except Exception:
            return 0.0

    def clear_index(self) -> None:
        """Clear persisted index."""
        try:
            if os.path.exists(self.persist_directory):
                shutil.rmtree(self.persist_directory)
                logger.info("FAISS index cleared")

            self.vectorstore = None
            self.is_loaded = False
            self.documents = {}

        except Exception as e:
            logger.error(f"Failed to clear index: {e}")


__all__ = ["LangChainVectorStore"]
