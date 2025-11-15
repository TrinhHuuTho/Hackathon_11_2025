#!/usr/bin/env python3
"""
RAG Chatbot Demo Script

Demo script demonstrating RAG chatbot capabilities với example queries.
"""

import os
import sys
import time
import asyncio
from typing import List, Dict, Any

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from chat_engine import get_chat_engine
from retriever import get_document_retriever
from schemas import RAGChatRequest, ChatConfig, RetrievalConfig


class RAGChatbotDemo:
    """Demo class cho RAG chatbot system."""

    def __init__(self):
        self.chat_engine = None

    def initialize(self) -> bool:
        """Initialize demo system."""
        try:
            print("🚀 Initializing RAG Chatbot Demo...")

            # Get components
            retriever = get_document_retriever()
            self.chat_engine = get_chat_engine(retriever=retriever)

            # Initialize
            self.chat_engine.initialize()

            stats = self.chat_engine.get_stats()
            print(f"✅ Demo initialized!")
            print(f"📚 Documents: {stats['retriever']['total_documents']}")
            print(f"🔍 Chunks: {stats['retriever']['total_chunks']}")
            print()

            return True

        except Exception as e:
            print(f"❌ Demo initialization failed: {e}")
            return False

    def run_sample_queries(self):
        """Run sample queries để demonstrate functionality."""

        sample_queries = [
            {
                "category": "Python Programming",
                "query": "Python có những đặc điểm gì nổi bật?",
                "description": "General question về Python features",
            },
            {
                "category": "Web Development",
                "query": "JavaScript được sử dụng như thế nào trong web development?",
                "description": "JavaScript usage patterns",
            },
            {
                "category": "Database Systems",
                "query": "So sánh SQL và NoSQL databases",
                "description": "Database comparison query",
            },
            {
                "category": "Machine Learning",
                "query": "Các thuật toán machine learning cơ bản là gì?",
                "description": "Basic ML algorithms overview",
            },
            {
                "category": "API Design",
                "query": "REST API best practices là gì?",
                "description": "API development guidelines",
            },
        ]

        print("🎯 Running Sample Queries")
        print("=" * 50)

        conversation_id = "demo-conversation-001"

        for i, sample in enumerate(sample_queries, 1):
            self._run_single_query(
                query=sample["query"],
                category=sample["category"],
                description=sample["description"],
                conversation_id=conversation_id,
                query_num=i,
            )

            # Small delay between queries
            time.sleep(1)

        print("\n🎉 Demo completed successfully!")

    def _run_single_query(
        self,
        query: str,
        category: str,
        description: str,
        conversation_id: str,
        query_num: int,
    ):
        """Run single demo query."""

        print(f"\n📝 Query {query_num}: {category}")
        print(f"💭 {description}")
        print(f"❓ Question: {query}")
        print("-" * 40)

        try:
            # Create request
            request = RAGChatRequest(
                query=query,
                retrieval_config=RetrievalConfig(top_k=3, similarity_threshold=0.2),
                chat_config=ChatConfig(
                    temperature=0.7, max_context_docs=3, include_sources=True
                ),
                conversation_id=conversation_id,
            )

            start_time = time.time()

            # Process query
            response = self.chat_engine.chat(request, conversation_id)

            # Display results
            print(f"🤖 Answer:")
            print(self._format_answer(response.answer))

            if response.context.context_used:
                print(f"\n📎 Sources ({response.context.retrieved_count} found):")
                for j, source in enumerate(response.context.sources[:2], 1):
                    print(
                        f"   {j}. {source['topic']} (score: {source['similarity_score']:.3f})"
                    )
                    print(f"      Preview: {source['chunk_text'][:100]}...")

            print(f"\n⏱️ Time: {response.processing_time:.2f}s")

        except Exception as e:
            print(f"❌ Query failed: {e}")

    def _format_answer(self, answer: str, max_width: int = 80) -> str:
        """Format answer for better display."""
        lines = answer.split("\n")
        formatted_lines = []

        for line in lines:
            if len(line) <= max_width:
                formatted_lines.append(f"   {line}")
            else:
                # Simple word wrap
                words = line.split(" ")
                current_line = "   "

                for word in words:
                    if len(current_line + word) <= max_width:
                        current_line += word + " "
                    else:
                        formatted_lines.append(current_line.rstrip())
                        current_line = f"   {word} "

                if current_line.strip():
                    formatted_lines.append(current_line.rstrip())

        return "\n".join(formatted_lines)

    def run_conversation_demo(self):
        """Demo conversation flow với multiple related queries."""

        print("\n💬 Conversation Demo")
        print("=" * 50)

        conversation_id = "demo-conversation-002"

        # Related queries trong same conversation
        conversation_queries = [
            "Python có những ưu điểm gì?",
            "Có thể sử dụng Python để làm gì?",
            "So sánh Python với JavaScript",
            "Học Python cần bao lâu?",
        ]

        print("🎯 Topic: Python Programming Deep Dive")
        print("📖 Following conversation flow...")

        for i, query in enumerate(conversation_queries, 1):
            print(f"\n--- Turn {i} ---")
            self._run_single_query(
                query=query,
                category="Python",
                description=f"Conversation turn {i}",
                conversation_id=conversation_id,
                query_num=i,
            )
            time.sleep(0.5)

        # Show conversation history
        conversation = self.chat_engine.get_conversation(conversation_id)
        if conversation:
            print(f"\n📚 Conversation Summary:")
            print(f"   Total messages: {len(conversation.messages)}")
            print(f"   Started: {conversation.created_at}")
            print(f"   Last update: {conversation.updated_at}")

    def run_performance_test(self):
        """Test performance với multiple concurrent queries."""

        print("\n⚡ Performance Test")
        print("=" * 50)

        test_queries = [
            "Giải thích về Object-Oriented Programming",
            "REST API hoạt động như thế nào?",
            "Khác biệt giữa SQL và NoSQL",
            "Machine learning algorithms cơ bản",
            "Cloud computing benefits",
        ]

        print(f"🎯 Testing {len(test_queries)} queries...")

        start_time = time.time()
        results = []

        for i, query in enumerate(test_queries, 1):
            try:
                request = RAGChatRequest(
                    query=query,
                    retrieval_config=RetrievalConfig(top_k=5),
                    chat_config=ChatConfig(max_tokens=1024),
                )

                query_start = time.time()
                response = self.chat_engine.chat(request)
                query_time = time.time() - query_start

                results.append(
                    {
                        "query": query,
                        "time": query_time,
                        "docs_found": response.context.retrieved_count,
                        "answer_length": len(response.answer),
                    }
                )

                print(
                    f"   ✅ Query {i}: {query_time:.2f}s ({response.context.retrieved_count} docs)"
                )

            except Exception as e:
                print(f"   ❌ Query {i} failed: {e}")

        total_time = time.time() - start_time

        # Performance summary
        print(f"\n📊 Performance Summary:")
        print(f"   Total time: {total_time:.2f}s")
        print(f"   Average per query: {total_time/len(test_queries):.2f}s")
        print(f"   Successful queries: {len(results)}/{len(test_queries)}")

        if results:
            avg_docs = sum(r["docs_found"] for r in results) / len(results)
            avg_length = sum(r["answer_length"] for r in results) / len(results)
            print(f"   Avg documents retrieved: {avg_docs:.1f}")
            print(f"   Avg answer length: {avg_length:.0f} chars")

    def show_system_info(self):
        """Show system information và capabilities."""

        print("\n🔧 System Information")
        print("=" * 50)

        # Get stats
        stats = self.chat_engine.get_stats()

        print("📊 Statistics:")
        print(f"   Total documents: {stats['retriever']['total_documents']}")
        print(f"   Total chunks: {stats['retriever']['total_chunks']}")
        print(f"   Embedding dimension: {stats['retriever']['embedding_dimension']}")
        print(f"   Index size: {stats['retriever']['index_size']}")

        print(f"\n🤖 LLM Configuration:")
        print(f"   Model: {stats['llm_adapter']['model']}")
        print(f"   Status: {stats['llm_adapter']['status']}")

        # Show available topics
        retriever = self.chat_engine.retriever
        topics = retriever.list_all_topics()
        categories = retriever.list_all_categories()

        print(f"\n📚 Content Overview:")
        print(f"   Topics: {len(topics)}")
        for topic in topics[:5]:
            print(f"     • {topic}")
        if len(topics) > 5:
            print(f"     ... and {len(topics) - 5} more")

        print(f"\n📁 Categories: {', '.join(categories)}")


def main():
    """Main demo entry point."""
    demo = RAGChatbotDemo()

    if not demo.initialize():
        sys.exit(1)

    try:
        # Run different demo scenarios
        demo.show_system_info()
        demo.run_sample_queries()
        demo.run_conversation_demo()
        demo.run_performance_test()

        print("\n🎉 All demos completed successfully!")
        print("\n💡 Next steps:")
        print("   • Run 'python main.py' for interactive mode")
        print("   • Try API server: 'python api.py'")
        print("   • Customize data in data/mock_summaries.json")

    except KeyboardInterrupt:
        print("\n\n👋 Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Demo error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
