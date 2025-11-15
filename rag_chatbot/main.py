#!/usr/bin/env python3
"""
RAG Chatbot Command-Line Interface

Provides interactive command-line interface cho RAG chatbot system.
"""

import os
import sys
import argparse
import logging
from typing import Optional
import uuid

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Import sau khi thêm path
from chat_engine import get_chat_engine
from retriever_optimized import get_document_retriever
from schemas import RAGChatRequest, ChatConfig, RetrievalConfig

# Setup logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class RAGChatCLI:
    """Command-line interface cho RAG chatbot."""

    def __init__(self, data_path: Optional[str] = None):
        """
        Initialize CLI với optional data path.

        Args:
            data_path: Path to JSON data file (sử dụng default nếu None)
        """
        self.data_path = data_path
        self.chat_engine = None
        self.current_conversation_id = None

    def initialize(self, force_rebuild: bool = False) -> bool:
        """
        Initialize RAG system.

        Args:
            force_rebuild: Force rebuild FAISS index

        Returns:
            True if successful, False otherwise
        """
        try:
            print("🚀 Initializing RAG Chatbot...")

            # Get retriever
            retriever = get_document_retriever(data_path=self.data_path)

            # Get chat engine
            self.chat_engine = get_chat_engine(retriever=retriever)

            # Initialize system
            self.chat_engine.initialize(force_rebuild_index=force_rebuild)

            # Get stats
            stats = self.chat_engine.get_stats()
            print(f"✅ System initialized successfully!")
            print(f"📚 Documents: {stats['retriever']['total_documents']}")
            print(f"🔍 Vectors: {stats['retriever'].get('total_vectors', 0)}")
            print(f"🤖 Model: {stats['llm_adapter']['model']}")

            return True

        except Exception as e:
            print(f"❌ Initialization failed: {e}")
            logger.error(f"Initialization error: {e}")
            return False

    def start_interactive_session(self):
        """Start interactive chat session."""
        if not self.chat_engine:
            print("❌ System not initialized. Run with --init first.")
            return

        print("\n" + "=" * 60)
        print("🤖 RAG CHATBOT - Interactive Mode")
        print("=" * 60)
        print("💡 Commands:")
        print("   /new      - Start new conversation")
        print("   /stats    - Show system statistics")
        print("   /config   - Show current configuration")
        print("   /topics   - List available topics")
        print("   /quit     - Exit chatbot")
        print("   /help     - Show this help")
        print("-" * 60)

        # Start new conversation
        self.current_conversation_id = str(uuid.uuid4())
        print(f"📝 Started conversation: {self.current_conversation_id[:8]}...")

        while True:
            try:
                # Get user input
                user_input = input("\n👤 You: ").strip()

                if not user_input:
                    continue

                # Handle commands
                if user_input.startswith("/"):
                    if self._handle_command(user_input):
                        continue
                    else:
                        break  # Quit command

                # Process chat
                response = self._process_chat(user_input)
                if response:
                    print(f"\n🤖 Assistant: {response.answer}")

                    # Show sources if available
                    if response.context.context_used and response.context.sources:
                        print(f"\n📎 Sources ({len(response.context.sources)}):")
                        for i, source in enumerate(response.context.sources[:3], 1):
                            print(
                                f"   {i}. {source['topic']} (similarity: {source['similarity_score']:.3f})"
                            )

                    print(f"⏱️ Processing time: {response.processing_time:.2f}s")

            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                logger.error(f"Interactive session error: {e}")

    def _handle_command(self, command: str) -> bool:
        """
        Handle CLI commands.

        Returns:
            True to continue, False to quit
        """
        command = command.lower().strip()

        if command == "/quit" or command == "/exit":
            print("👋 Goodbye!")
            return False

        elif command == "/help":
            print("\n💡 Available Commands:")
            print("   /new      - Start new conversation")
            print("   /stats    - Show system statistics")
            print("   /config   - Show current configuration")
            print("   /topics   - List available topics")
            print("   /quit     - Exit chatbot")
            print("   /help     - Show this help")

        elif command == "/new":
            self.current_conversation_id = str(uuid.uuid4())
            print(f"📝 Started new conversation: {self.current_conversation_id[:8]}...")

        elif command == "/stats":
            stats = self.chat_engine.get_stats()
            print("\n📊 System Statistics:")
            print(f"   Documents: {stats['retriever']['total_documents']}")
            print(f"   Vectors: {stats['retriever'].get('total_vectors', 0)}")
            print(f"   Conversations: {stats['conversations']['total_conversations']}")
            print(f"   Total messages: {stats['conversations']['total_messages']}")

        elif command == "/config":
            print("\n⚙️ Current Configuration:")
            print(f"   Data source: {self.data_path or 'default'}")
            print(
                f"   Conversation ID: {self.current_conversation_id[:8] if self.current_conversation_id else 'None'}..."
            )

        elif command == "/topics":
            try:
                retriever = self.chat_engine.retriever
                topics = retriever.list_all_topics()
                categories = retriever.list_all_categories()

                print(f"\n📚 Available Topics ({len(topics)}):")
                for i, topic in enumerate(topics[:10], 1):
                    print(f"   {i:2d}. {topic}")
                if len(topics) > 10:
                    print(f"   ... and {len(topics) - 10} more")

                print(f"\n📁 Categories ({len(categories)}):")
                for category in categories:
                    print(f"   • {category}")

            except Exception as e:
                print(f"❌ Error getting topics: {e}")

        else:
            print(f"❌ Unknown command: {command}")
            print("💡 Type /help for available commands")

        return True

    def _process_chat(self, query: str):
        """Process chat query và return response."""
        try:
            # Create request
            request = RAGChatRequest(
                query=query,
                retrieval_config=RetrievalConfig(),
                chat_config=ChatConfig(),
                conversation_id=self.current_conversation_id,
            )

            # Process with chat engine
            response = self.chat_engine.chat(request, self.current_conversation_id)
            return response

        except Exception as e:
            logger.error(f"Chat processing error: {e}")
            print(f"❌ Error processing your question: {e}")
            return None

    def single_query(self, query: str) -> None:
        """Process single query (non-interactive mode)."""
        if not self.chat_engine:
            print("❌ System not initialized.")
            return

        print(f"❓ Question: {query}")
        print("-" * 50)

        response = self._process_chat(query)
        if response:
            print(f"🤖 Answer: {response.answer}")

            if response.context.context_used:
                print(
                    f"\n📎 Found {response.context.retrieved_count} relevant documents"
                )

            print(f"\n⏱️ Processing time: {response.processing_time:.2f}s")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description="RAG Chatbot CLI")

    parser.add_argument("--data", "-d", help="Path to JSON data file")
    parser.add_argument(
        "--init", action="store_true", help="Initialize system and rebuild index"
    )
    parser.add_argument(
        "--rebuild", action="store_true", help="Force rebuild FAISS index"
    )
    parser.add_argument("--query", "-q", help="Single query (non-interactive)")
    parser.add_argument(
        "--interactive",
        "-i",
        action="store_true",
        help="Start interactive session (default)",
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable verbose logging"
    )

    args = parser.parse_args()

    # Setup logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Create CLI instance
    cli = RAGChatCLI(data_path=args.data)

    # Initialize system
    if not cli.initialize(force_rebuild=args.rebuild):
        sys.exit(1)

    # Run based on mode
    if args.query:
        # Single query mode
        cli.single_query(args.query)
    else:
        # Interactive mode (default)
        cli.start_interactive_session()


if __name__ == "__main__":
    main()
