import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import pandaMascot from "@/assets/fitness-panda-mascot.png";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const mockBotResponses = [
  "Tuyệt vời! Tôi có thể giúp bạn với lịch tập luyện và dinh dưỡng. Bạn cần tư vấn gì?",
  "Để đạt được mục tiêu fitness, bạn cần kết hợp tập luyện đều đặn và chế độ ăn uống khoa học!",
  "Tôi có thể gợi ý cho bạn các bài tập phù hợp với mục tiêu của bạn.",
  "Hãy nhớ uống đủ nước và nghỉ ngơi hợp lý nhé!",
  "Bạn có muốn xem thực đơn dinh dưỡng cho hôm nay không?",
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là trợ lý fitness của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: mockBotResponses[Math.floor(Math.random() * mockBotResponses.length)],
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Panda Mascot */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="relative group"
          aria-label="Open chat"
        >
          <div className="relative">
            <img
              src={pandaMascot}
              alt="Fitness Panda Mascot"
              className="w-20 h-20 rounded-full drop-shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full" />
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tôi có thể giúp gì cho bạn?
          </div>
        </button>
      </div>

      {/* Chat Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] bg-background border rounded-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-3">
              <img
                src={pandaMascot}
                alt="Fitness Panda"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold">Trợ lý Fitness</h3>
                <p className="text-xs opacity-90">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
