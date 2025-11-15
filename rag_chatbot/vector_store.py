import os
import json
import logging
import pickle
from typing import List, Dict, Tuple, Optional
import numpy as np
import faiss
from datetime import datetime

from schemas import SummaryDocument, DocumentChunk, RetrievalConfig, RetrievedDocument
from embeddings import get_embedding_service

logger = logging.getLogger(__name__)


class FAISSVectorStore:
    """FAISS-based vector store cho document search và retrieval."""

    def __init__(
        self,
        embedding_dim: int = 384,  # all-MiniLM-L6-v2 dimension
        index_type: str = "flat",
    ):
        """
        Initialize FAISS vector store.

        Args:
            embedding_dim: Dimension của embedding vectors
            index_type: Loại FAISS index ('flat', 'hnsw', 'ivf')
        """
        self.embedding_dim = embedding_dim
        self.index_type = index_type
        self.index = None
        self.documents = {}  # document_id -> SummaryDocument
        self.chunks = {}  # chunk_id -> DocumentChunk
        self.chunk_embeddings = {}  # chunk_id -> embedding
        self.id_to_chunk_mapping = []  # FAISS index position -> chunk_id

        # Embedding service
        self.embedding_service = get_embedding_service()

    def _create_index(self) -> faiss.Index:
        """Tạo FAISS index dựa trên type."""
        if self.index_type == "flat":
            # Flat index - exact search, tốt cho datasets nhỏ
            index = faiss.IndexFlatIP(
                self.embedding_dim
            )  # Inner Product (cosine với normalized vectors)
        elif self.index_type == "hnsw":
            # HNSW - approximate search, nhanh hơn cho datasets lớn
            index = faiss.IndexHNSWFlat(self.embedding_dim, 32)
            index.hnsw.efConstruction = 40
            index.hnsw.efSearch = 16
        elif self.index_type == "ivf":
            # IVF - cluster-based search
            quantizer = faiss.IndexFlatIP(self.embedding_dim)
            nlist = 100  # số clusters
            index = faiss.IndexIVFFlat(quantizer, self.embedding_dim, nlist)
        else:
            raise ValueError(f"Unsupported index type: {self.index_type}")

        logger.info(
            f"Created FAISS {self.index_type} index with dimension {self.embedding_dim}"
        )
        return index

    def load_documents_from_json(self, json_path: str) -> None:
        """
        Load documents từ JSON file và build index.

        Args:
            json_path: Path to JSON file chứa summaries
        """
        try:
            logger.info(f"Loading documents from {json_path}")

            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            summaries = data.get("summaries", [])

            # Convert to SummaryDocument objects
            documents = []
            for summary_data in summaries:
                # Parse datetime
                created_at = datetime.fromisoformat(summary_data["created_at"])
                summary_data["created_at"] = created_at

                doc = SummaryDocument(**summary_data)
                documents.append(doc)

            logger.info(f"Loaded {len(documents)} documents")

            # Build index
            self.build_index(documents)

        except Exception as e:
            logger.error(f"Failed to load documents from {json_path}: {e}")
            raise

    def build_index(self, documents: List[SummaryDocument]) -> None:
        """
        Build FAISS index từ list of documents.

        Args:
            documents: List of SummaryDocument objects
        """
        logger.info("Building FAISS index...")

        # Clear existing data
        self.documents.clear()
        self.chunks.clear()
        self.chunk_embeddings.clear()
        self.id_to_chunk_mapping.clear()

        # Chunk documents
        all_chunks = []
        for doc in documents:
            self.documents[doc.id] = doc
            chunks = self._chunk_document(doc)
            all_chunks.extend(chunks)

        logger.info(f"Created {len(all_chunks)} chunks from {len(documents)} documents")

        if not all_chunks:
            logger.warning("No chunks to index")
            return

        # Generate embeddings for all chunks
        chunk_texts = [chunk.content for chunk in all_chunks]
        embeddings = self.embedding_service.embed_batch(chunk_texts)

        # Update embedding dimension if needed
        if embeddings.shape[1] != self.embedding_dim:
            self.embedding_dim = embeddings.shape[1]
            logger.info(f"Updated embedding dimension to {self.embedding_dim}")

        # Create FAISS index
        self.index = self._create_index()

        # Add embeddings to index
        self.index.add(embeddings.astype(np.float32))

        # Store chunk metadata
        for i, chunk in enumerate(all_chunks):
            self.chunks[chunk.chunk_id] = chunk
            self.chunk_embeddings[chunk.chunk_id] = embeddings[i]
            self.id_to_chunk_mapping.append(chunk.chunk_id)

        logger.info(f"FAISS index built successfully with {self.index.ntotal} vectors")

    def _chunk_document(
        self, document: SummaryDocument, chunk_size: int = 200, chunk_overlap: int = 50
    ) -> List[DocumentChunk]:
        """
        Chia document thành các chunks nhỏ hơn.

        Args:
            document: Document cần chunk
            chunk_size: Kích thước chunk (characters)
            chunk_overlap: Overlap giữa các chunks

        Returns:
            List of DocumentChunk objects
        """
        content = document.content
        chunks = []

        if len(content) <= chunk_size:
            # Document đủ nhỏ, không cần chunk
            chunk = DocumentChunk(
                chunk_id=f"{document.id}_chunk_0",
                document_id=document.id,
                content=content,
                chunk_index=0,
                topic=document.topic,
                category=document.category,
                tags=document.tags,
            )
            chunks.append(chunk)
        else:
            # Chia document thành chunks với overlap
            start = 0
            chunk_index = 0

            while start < len(content):
                end = min(start + chunk_size, len(content))

                # Tìm boundary tốt (end of sentence/word)
                if end < len(content):
                    # Tìm khoảng trắng gần nhất để không cắt giữa từ
                    while end > start and content[end] not in " \n.!?":
                        end -= 1
                    if end == start:  # Không tìm thấy boundary tốt
                        end = start + chunk_size

                chunk_content = content[start:end].strip()

                if chunk_content:  # Only add non-empty chunks
                    chunk = DocumentChunk(
                        chunk_id=f"{document.id}_chunk_{chunk_index}",
                        document_id=document.id,
                        content=chunk_content,
                        chunk_index=chunk_index,
                        topic=document.topic,
                        category=document.category,
                        tags=document.tags,
                    )
                    chunks.append(chunk)
                    chunk_index += 1

                # Move to next chunk với overlap
                start = end - chunk_overlap
                if start >= len(content):
                    break

        return chunks

    def search(self, query: str, config: RetrievalConfig) -> List[RetrievedDocument]:
        """
        Search for relevant documents dựa trên query.

        Args:
            query: Search query string
            config: Retrieval configuration

        Returns:
            List of RetrievedDocument với similarity scores
        """
        if self.index is None or self.index.ntotal == 0:
            logger.warning("No documents in index")
            return []

        try:
            # Generate query embedding
            query_embedding = self.embedding_service.embed_text(query)
            query_embedding = query_embedding.reshape(1, -1).astype(np.float32)

            # Search trong FAISS index
            k = min(
                config.top_k * 2, self.index.ntotal
            )  # Get more candidates để filter
            scores, indices = self.index.search(query_embedding, k)

            # Convert results to RetrievedDocument objects
            retrieved_docs = []

            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if idx == -1:  # FAISS returns -1 for invalid results
                    continue

                similarity_score = float(score)

                # Apply similarity threshold
                if similarity_score < config.similarity_threshold:
                    continue

                chunk_id = self.id_to_chunk_mapping[idx]
                chunk = self.chunks[chunk_id]

                # Apply filters
                if (
                    config.user_filter
                    and chunk.document_id.split("_")[0] != config.user_filter
                ):
                    continue

                if (
                    config.topic_filter
                    and chunk.topic.lower() != config.topic_filter.lower()
                ):
                    continue

                retrieved_doc = RetrievedDocument(
                    document_id=chunk.document_id,
                    chunk_id=chunk.chunk_id,
                    content=chunk.content,
                    topic=chunk.topic,
                    category=chunk.category,
                    similarity_score=similarity_score,
                    tags=chunk.tags,
                )

                retrieved_docs.append(retrieved_doc)

            # Sort by similarity score (descending) và limit to top_k
            retrieved_docs.sort(key=lambda x: x.similarity_score, reverse=True)
            retrieved_docs = retrieved_docs[: config.top_k]

            logger.info(
                f"Retrieved {len(retrieved_docs)} documents for query: {query[:50]}..."
            )
            return retrieved_docs

        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    def save_index(self, directory: str) -> None:
        """
        Save FAISS index và metadata to disk.

        Args:
            directory: Directory để save index files
        """
        os.makedirs(directory, exist_ok=True)

        if self.index is not None:
            # Save FAISS index
            index_path = os.path.join(directory, "faiss_index.bin")
            faiss.write_index(self.index, index_path)

            # Save metadata
            metadata = {
                "documents": {k: v.model_dump() for k, v in self.documents.items()},
                "chunks": {k: v.model_dump() for k, v in self.chunks.items()},
                "id_to_chunk_mapping": self.id_to_chunk_mapping,
                "embedding_dim": self.embedding_dim,
                "index_type": self.index_type,
            }

            metadata_path = os.path.join(directory, "metadata.pkl")
            with open(metadata_path, "wb") as f:
                pickle.dump(metadata, f)

            logger.info(f"Index saved to {directory}")

    def load_index(self, directory: str) -> None:
        """
        Load FAISS index và metadata from disk.

        Args:
            directory: Directory chứa index files
        """
        index_path = os.path.join(directory, "faiss_index.bin")
        metadata_path = os.path.join(directory, "metadata.pkl")

        if not os.path.exists(index_path) or not os.path.exists(metadata_path):
            raise FileNotFoundError(f"Index files not found in {directory}")

        # Load FAISS index
        self.index = faiss.read_index(index_path)

        # Load metadata
        with open(metadata_path, "rb") as f:
            metadata = pickle.load(f)

        # Restore documents and chunks
        self.documents = {
            k: SummaryDocument(**v) for k, v in metadata["documents"].items()
        }
        self.chunks = {k: DocumentChunk(**v) for k, v in metadata["chunks"].items()}
        self.id_to_chunk_mapping = metadata["id_to_chunk_mapping"]
        self.embedding_dim = metadata["embedding_dim"]
        self.index_type = metadata["index_type"]

        logger.info(f"Index loaded from {directory} with {self.index.ntotal} vectors")

    def get_stats(self) -> dict:
        """Get vector store statistics."""
        return {
            "total_documents": len(self.documents),
            "total_chunks": len(self.chunks),
            "embedding_dimension": self.embedding_dim,
            "index_size": f"{self.index.ntotal} vectors" if self.index else "0 vectors",
            "index_type": self.index_type,
            "last_updated": datetime.now().isoformat(),
        }


__all__ = ["FAISSVectorStore"]
