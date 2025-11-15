import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";
import FlashcardItem from "@/components/FlashcardItem";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { sampleFlashcardSets } from "@/data/flashcards";
import { Flashcard } from "@/types/flashcard";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import GenerateService from "@/util/generate.api";

export default function Flashcards() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Check if there's data from navigation state
  const navigationData = location.state as {
    flashcards?: Flashcard[];
    setTitle?: string;
    setDescription?: string;
  } | null;

  const [flashcardSet, setFlashcardSet] = useState({
    id: navigationData ? 999 : sampleFlashcardSets[0].id,
    title: navigationData?.setTitle || sampleFlashcardSets[0].title,
    description:
      navigationData?.setDescription || sampleFlashcardSets[0].description,
    cards: navigationData?.flashcards || sampleFlashcardSets[0].cards,
    progress: 0,
  });

  const [cards, setCards] = useState<Flashcard[]>(flashcardSet.cards);

  const totalCards = cards.length;
  const progress = ((currentCardIndex + 1) / totalCards) * 100;

  useEffect(() => {
    // Update cards when navigation data changes
    if (navigationData?.flashcards) {
      setFlashcardSet({
        id: 999,
        title: navigationData.setTitle || "Flashcards từ tóm tắt",
        description:
          navigationData.setDescription || "Bộ flashcards được tạo tự động",
        cards: navigationData.flashcards,
        progress: 0,
      });
      setCards(navigationData.flashcards);
      setCurrentCardIndex(0);
    }
  }, [navigationData]);

  useEffect(() => {
    // Load bookmarked cards from localStorage
    const savedBookmarks = localStorage.getItem("flashcard-bookmarks");
    if (savedBookmarks) {
      const bookmarkedIds = JSON.parse(savedBookmarks);
      setCards((prevCards) =>
        prevCards.map((card) => ({
          ...card,
          isBookmarked: bookmarkedIds.includes(card.id),
        }))
      );
    }
  }, [flashcardSet.cards]);

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
  };

  const handleToggleBookmark = (cardId: number) => {
    setCards((prevCards) => {
      const updatedCards = prevCards.map((card) =>
        card.id === cardId
          ? { ...card, isBookmarked: !card.isBookmarked }
          : card
      );

      // Save to localStorage
      const bookmarkedIds = updatedCards
        .filter((card) => card.isBookmarked)
        .map((card) => card.id);
      localStorage.setItem(
        "flashcard-bookmarks",
        JSON.stringify(bookmarkedIds)
      );

      return updatedCards;
    });
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    toast({
      title: "Đang tạo bài quiz...",
      description: "AI đang phân tích và tạo câu hỏi từ flashcards",
    });

    try {
      // Combine all flashcard content for quiz generation
      const allContent = cards
        .map((card) => `${card.question}\n${card.answer}`)
        .join("\n\n");

      console.log("All Content for Quiz Generation:", allContent);

      const response = await GenerateService.generateQuiz(allContent, 10, [
        "fill_blank",
        "mcq",
        "tf",
      ]);

      console.log("Quiz Generation Response:", response);

      // Check if response is array or has data property
      const quizData = Array.isArray(response) ? response : response.data || [];

      toast({
        title: "Tạo quiz thành công!",
        description: `Đã tạo ${quizData.length} câu hỏi`,
      });

      // Navigate to quiz page with data
      navigate("/quiz", {
        state: {
          quizData: quizData,
          quizTitle: `Quiz từ ${flashcardSet.title}`,
          quizDescription: "Bài quiz được tạo từ bộ flashcards",
        },
      });
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Lỗi tạo quiz",
        description:
          error.message || "Đã có lỗi xảy ra khi tạo quiz. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const currentCard = cards[currentCardIndex];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 -m-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {flashcardSet.title}
            </h1>
            <p className="text-gray-600">{flashcardSet.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Thẻ {currentCardIndex + 1} / {totalCards}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Flashcard */}
          <div className="mb-8">
            <FlashcardItem
              card={currentCard}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 p-0 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 p-0 shadow-md hover:shadow-lg transition-all hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentCardIndex === totalCards - 1}
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 p-0 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Generate Quiz Button - Show when on last card */}
          {currentCardIndex === totalCards - 1 && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    🎉 Bạn đã hoàn thành bộ flashcards!
                  </h3>
                  <p className="text-gray-600">
                    Kiểm tra kiến thức của bạn với bài quiz được tạo tự động
                  </p>
                </div>
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang tạo quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Tạo bài Quiz ngay
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Bookmarked Cards Count */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {cards.filter((card) => card.isBookmarked).length} thẻ đã lưu
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
