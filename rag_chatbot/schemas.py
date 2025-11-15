from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class SummaryDocument(BaseModel):
    """Model cho summary document."""

    id: str
    content: str
    topic: str
    category: str
    user_id: str
    created_at: datetime
    tags: List[str] = Field(default_factory=list)


class DocumentChunk(BaseModel):
    """Model cho document chunk sau khi chia nhỏ."""

    chunk_id: str
    document_id: str
    content: str
    chunk_index: int
    topic: str
    category: str
    tags: List[str] = Field(default_factory=list)


class RetrievalConfig(BaseModel):
    """Cấu hình cho document retrieval."""

    top_k: int = Field(default=5, ge=1, le=20)
    similarity_threshold: float = Field(default=0.3, ge=0.0, le=1.0)
    chunk_size: int = Field(default=200, ge=50, le=1000)  # characters
    chunk_overlap: int = Field(default=50, ge=0, le=200)
    user_filter: Optional[str] = None  # Filter by user_id
    topic_filter: Optional[str] = None  # Filter by topic
    include_metadata: bool = True


class ChatRequest(BaseModel):
    """Request cho chat API."""

    question: str = Field(min_length=1, max_length=1000)
    user_id: Optional[str] = None
    config: Optional[RetrievalConfig] = None
    conversation_history: Optional[List[Dict[str, str]]] = None


class RetrievedDocument(BaseModel):
    """Document được retrieve với similarity score."""

    document_id: str
    chunk_id: str
    content: str
    topic: str
    category: str
    similarity_score: float
    tags: List[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    """Response cho chat API."""

    answer: str
    question: str
    sources: List[RetrievedDocument]
    confidence: float = Field(ge=0.0, le=1.0)
    response_time: float  # seconds
    total_documents_searched: int
    metadata: Optional[Dict[str, Any]] = None


class VectorStoreStats(BaseModel):
    """Thống kê vector store."""

    total_documents: int
    total_chunks: int
    embedding_dimension: int
    index_size: str  # Human readable size
    last_updated: datetime


class ChatConfig(BaseModel):
    """Configuration for chat generation."""

    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Creativity level"
    )
    top_p: float = Field(default=0.9, ge=0.0, le=1.0, description="Nucleus sampling")
    max_tokens: int = Field(
        default=2048, ge=1, le=8192, description="Max response tokens"
    )
    max_context_docs: int = Field(
        default=5, ge=1, le=20, description="Max documents in context"
    )
    include_sources: bool = Field(default=True, description="Include source references")
    response_style: Optional[str] = Field(
        default=None, description="Response style preference"
    )


class ConversationContext(BaseModel):
    """Context information for conversation."""

    retrieved_count: int = Field(..., description="Number of documents retrieved")
    context_used: bool = Field(..., description="Whether context was used")
    sources: List[Dict[str, Any]] = Field(
        default_factory=list, description="Source documents"
    )
    context_text: Optional[str] = Field(default=None, description="Full context text")


class ConversationHistory(BaseModel):
    """Conversation history schema."""

    conversation_id: str = Field(..., description="Unique conversation ID")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    messages: List[Dict[str, Any]] = Field(
        default_factory=list, description="Conversation messages"
    )


class ConversationListResponse(BaseModel):
    """Response for listing conversations."""

    conversations: List[ConversationHistory] = Field(
        ..., description="List of conversations"
    )
    total: int = Field(..., description="Total conversations")
    has_more: bool = Field(..., description="Whether more conversations exist")


class RAGChatRequest(BaseModel):
    """Enhanced chat request for RAG system."""

    query: str = Field(..., min_length=1, max_length=2000, description="User question")
    retrieval_config: RetrievalConfig = Field(default_factory=RetrievalConfig)
    chat_config: ChatConfig = Field(default_factory=ChatConfig)
    conversation_id: Optional[str] = Field(
        default=None, description="Conversation ID for context"
    )


class RAGChatResponse(BaseModel):
    """Enhanced chat response for RAG system."""

    answer: str = Field(..., description="Generated answer")
    context: ConversationContext = Field(..., description="Context information")
    conversation_id: Optional[str] = Field(default=None, description="Conversation ID")
    timestamp: str = Field(..., description="Response timestamp")
    processing_time: float = Field(..., description="Processing time in seconds")
    retrieved_documents: List[Dict[str, Any]] = Field(
        default_factory=list, description="Retrieved docs"
    )


__all__ = [
    "SummaryDocument",
    "DocumentChunk",
    "RetrievalConfig",
    "ChatRequest",
    "RetrievedDocument",
    "ChatResponse",
    "VectorStoreStats",
    "ChatConfig",
    "ConversationContext",
    "ConversationHistory",
    "ConversationListResponse",
    "RAGChatRequest",
    "RAGChatResponse",
]
