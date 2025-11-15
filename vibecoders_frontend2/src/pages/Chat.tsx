import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Avatar } from "@/components/ui/avatar";
import { postChatMessage, ApiChatResponse } from "@/util/chat.api"; 

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn với việc học tập, giải đáp thắc mắc, và hỗ trợ tạo nội dung học. Bạn muốn tôi giúp gì?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // TODO: Thay thế "user@example.com" bằng thông tin người dùng đã đăng nhập
      const userEmail = "user@example.com"; 

      const response: ApiChatResponse = await postChatMessage( // Thêm kiểu dữ liệu cho response
        currentInput,
        userEmail,
        conversationId
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer, // Sử dụng câu trả lời từ API
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // --- CẬP NHẬT: Dùng đúng tên trường JSON ---
      setConversationId(response.conversation_id); 

    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Xin lỗi, tôi đã gặp lỗi. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // ... (Phần return JSX giữ nguyên y hệt)
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Trợ lý AI</h1>
          <p className="text-muted-foreground">Hỏi đáp và hỗ trợ học tập thông minh</p>
        </div>

        <Card className="flex-1 flex flex-col shadow-soft overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 bg-gradient-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.role === "user" && (
                  <Avatar className="w-8 h-8 bg-primary flex items-center justify-center text-white font-semibold">
                    U
                  </Avatar>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <Avatar className="w-8 h-8 bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Hỏi bất cứ điều gì..."
                className="flex-1"
                disabled={isTyping} 
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping} 
                className="bg-gradient-primary"
                size="icon"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Chat;