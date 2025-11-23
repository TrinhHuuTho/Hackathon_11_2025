import { useState, useEffect } from "react";
import { Flashcard } from "@/types/flashcard";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import GenerateService from "@/util/generate.api";
import { useToast } from "@/components/ui/use-toast";

interface FlashcardItemProps {
  card: Flashcard;
  onToggleBookmark: (cardId: number) => void;
}

export default function FlashcardItem({
  card,
  onToggleBookmark,
}: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If card is not yet bookmarked, save it to review
    if (!card.isBookmarked) {
      try {
        await GenerateService.saveCardToReview({
          front: card.question,
          back: card.answer,
        });

        toast({
          title: "Đã lưu thẻ!",
          description: "Thẻ đã được thêm vào danh sách ôn tập",
        });
      } catch (error) {
        console.error("Error saving card:", error);
        toast({
          title: "Lỗi lưu thẻ",
          description: "Không thể lưu thẻ. Vui lòng thử lại.",
          variant: "destructive",
        });
        return; // Don't toggle bookmark if API call failed
      }
    }

    onToggleBookmark(card.id);
  };

  return (
    <div className="perspective-1000 w-full h-[400px]" onClick={handleFlip}>
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8">
          <button
            onClick={handleBookmark}
            className={cn(
              "absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-gray-100",
              card.isBookmarked ? "text-yellow-500" : "text-gray-400"
            )}
          >
            {card.isBookmarked ? (
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <Bookmark className="w-6 h-6" />
            )}
          </button>

          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
            {card.question}
          </h3>

          <p className="text-sm text-gray-500 mt-auto">
            Nhấn để xem câu trả lời
          </p>
        </div>

        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 rotate-y-180">
          <button
            onClick={handleBookmark}
            className={cn(
              "absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-white/20",
              card.isBookmarked ? "text-yellow-300" : "text-white/70"
            )}
          >
            {card.isBookmarked ? (
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <Bookmark className="w-6 h-6" />
            )}
          </button>

          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <p className="text-white text-lg leading-relaxed text-center">
            {card.answer}
          </p>

          <p className="text-sm text-white/70 mt-auto">
            Nhấn để quay lại câu hỏi
          </p>
        </div>
      </div>
    </div>
  );
}
