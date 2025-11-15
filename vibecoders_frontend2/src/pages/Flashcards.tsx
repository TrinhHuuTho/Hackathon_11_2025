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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    numQuestions: 10,
    questionTypes: {
      fill_blank: true,
      mcq: true,
      tf: true,
    },
  });

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
    // Validate configuration
    const selectedTypes = Object.entries(quizConfig.questionTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);

    if (selectedTypes.length === 0) {
      toast({
        title: "Vui lòng chọn loại câu hỏi",
        description: "Bạn cần chọn ít nhất một loại câu hỏi",
        variant: "destructive",
      });
      return;
    }

    if (quizConfig.numQuestions < 1 || quizConfig.numQuestions > 50) {
      toast({
        title: "Số lượng câu hỏi không hợp lệ",
        description: "Số lượng câu hỏi phải từ 1 đến 50",
        variant: "destructive",
      });
      return;
    }

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
      console.log("Quiz Config:", {
        numQuestions: quizConfig.numQuestions,
        types: selectedTypes,
      });

      const response = await GenerateService.generateQuiz(
        allContent,
        quizConfig.numQuestions,
        selectedTypes
      );

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

          {/* Generate Quiz Form - Show when on last card */}
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

                {!showQuizForm ? (
                  <Button
                    onClick={() => setShowQuizForm(true)}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Cấu hình bài Quiz
                  </Button>
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow-md text-left max-w-md mx-auto">
                    {/* Number of questions */}
                    <div className="mb-6">
                      <Label
                        htmlFor="numQuestions"
                        className="text-gray-700 font-semibold mb-2 block"
                      >
                        Số lượng câu hỏi
                      </Label>
                      <Input
                        id="numQuestions"
                        type="number"
                        min={1}
                        max={50}
                        value={quizConfig.numQuestions}
                        onChange={(e) =>
                          setQuizConfig({
                            ...quizConfig,
                            numQuestions: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Từ 1 đến 50 câu
                      </p>
                    </div>

                    {/* Question types */}
                    <div className="mb-6">
                      <Label className="text-gray-700 font-semibold mb-3 block">
                        Loại câu hỏi
                      </Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="fill_blank"
                            checked={quizConfig.questionTypes.fill_blank}
                            onCheckedChange={(checked) =>
                              setQuizConfig({
                                ...quizConfig,
                                questionTypes: {
                                  ...quizConfig.questionTypes,
                                  fill_blank: checked as boolean,
                                },
                              })
                            }
                          />
                          <label
                            htmlFor="fill_blank"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Điền khuyết
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mcq"
                            checked={quizConfig.questionTypes.mcq}
                            onCheckedChange={(checked) =>
                              setQuizConfig({
                                ...quizConfig,
                                questionTypes: {
                                  ...quizConfig.questionTypes,
                                  mcq: checked as boolean,
                                },
                              })
                            }
                          />
                          <label
                            htmlFor="mcq"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Nhiều lựa chọn
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tf"
                            checked={quizConfig.questionTypes.tf}
                            onCheckedChange={(checked) =>
                              setQuizConfig({
                                ...quizConfig,
                                questionTypes: {
                                  ...quizConfig.questionTypes,
                                  tf: checked as boolean,
                                },
                              })
                            }
                          />
                          <label
                            htmlFor="tf"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Đúng/Sai
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowQuizForm(false)}
                        variant="outline"
                        className="flex-1"
                        disabled={isGeneratingQuiz}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleGenerateQuiz}
                        disabled={isGeneratingQuiz}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                      >
                        {isGeneratingQuiz ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Tạo Quiz
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
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
