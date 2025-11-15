import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import {
  Library,
  Bookmark,
  Brain,
  MessageSquare,
  Clock,
  Calendar,
  Award,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFlashCardHistory,
  getQuizHistory,
  getFlashCardById,
  getQuizById,
} from "@/util/history.api";
import { FlashCard, QuizAnswerDto } from "@/types/history";

export default function History() {
  const [selectedTab, setSelectedTab] = useState("flashcards");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAnswerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFlashcards, setExpandedFlashcards] = useState<Set<string>>(
    new Set()
  );
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(
    new Set()
  );
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [flashcardData, quizData] = await Promise.all([
          getFlashCardHistory(),
          getQuizHistory(),
        ]);
        setFlashcards(flashcardData);
        setQuizzes(quizData);
      } catch (err) {
        console.error("Error loading history:", err);
        setError("Không thể tải lịch sử. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-700 border-green-300";
      case "good":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "average":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "needs-improvement":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "average":
        return "Trung bình";
      case "needs-improvement":
        return "Cần cải thiện";
      default:
        return status;
    }
  };

  // Calculate quiz score and pass rate
  const calculateQuizStats = (quiz: QuizAnswerDto) => {
    // Check if quiz data is available
    if (!quiz.quizSets || !quiz.quizSets.questions || !quiz.userAnswers) {
      return {
        correctAnswers: 0,
        totalQuestions: 0,
        percentage: 0,
        passed: false,
      };
    }

    const totalQuestions = quiz.quizSets.questions.length;
    let correctAnswers = 0;

    quiz.quizSets.questions.forEach((question, index) => {
      if (quiz.userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= 70; // 70% to pass

    return {
      correctAnswers,
      totalQuestions,
      percentage,
      passed,
    };
  };

  // Calculate stats
  const savedFlashcardsCount = flashcards.filter((fc) => fc.isSaved).length;
  const totalFlashcards = flashcards.length;
  const totalQuizzes = quizzes.length;
  const passedQuizzes = quizzes.filter((quiz) => {
    const stats = calculateQuizStats(quiz);
    return stats.passed;
  }).length;

  const avgQuizScore =
    quizzes.length > 0
      ? Math.round(
          quizzes.reduce((acc, quiz) => {
            const stats = calculateQuizStats(quiz);
            return acc + stats.percentage;
          }, 0) / quizzes.length
        )
      : 0;

  // Toggle flashcard details
  const toggleFlashcardDetails = async (id: string) => {
    if (expandedFlashcards.has(id)) {
      // Collapse
      setExpandedFlashcards((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      // Expand - fetch details if needed
      setExpandedFlashcards((prev) => new Set(prev).add(id));

      // Check if we already have full details
      const flashcard = flashcards.find((fc) => fc.id === id);
      if (!flashcard?.cards || flashcard.cards.length === 0) {
        setLoadingDetails((prev) => new Set(prev).add(id));
        try {
          const detail = await getFlashCardById(id);
          // Update the flashcard in the list with full details
          setFlashcards((prev) =>
            prev.map((fc) => (fc.id === id ? detail : fc))
          );
        } catch (error) {
          console.error("Error loading flashcard details:", error);
        } finally {
          setLoadingDetails((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    }
  };

  // Toggle quiz details
  const toggleQuizDetails = async (id: string) => {
    if (expandedQuizzes.has(id)) {
      // Collapse
      setExpandedQuizzes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      // Expand
      setExpandedQuizzes((prev) => new Set(prev).add(id));

      // Always fetch fresh details when expanding
      const quiz = quizzes.find((q) => q.id === id);
      const needsFetch =
        !quiz?.quizSets?.questions ||
        quiz.quizSets.questions.length === 0 ||
        !quiz.quizSets.title;

      if (needsFetch) {
        setLoadingDetails((prev) => new Set(prev).add(id));
        try {
          const detail = await getQuizById(id);
          // Update the quiz in the list with full details
          setQuizzes((prev) => prev.map((q) => (q.id === id ? detail : q)));
        } catch (error) {
          console.error("Error loading quiz details:", error);
          // Collapse on error
          setExpandedQuizzes((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } finally {
          setLoadingDetails((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    }
  };
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải lịch sử...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg font-semibold mb-2">
              Đã xảy ra lỗi
            </p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Lịch sử học tập
              </h1>
              <p className="text-gray-600">
                Xem lại quá trình học tập và tiến độ của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Flashcards"
            value={totalFlashcards}
            description="Bộ flashcards đã tạo"
            icon={<Library className="w-8 h-8 text-blue-600" />}
            trend="up"
            trendValue={`${totalFlashcards} bộ thẻ`}
            borderColor="border-blue-100"
          />

          <StatCard
            title="Thẻ đã lưu"
            value={savedFlashcardsCount}
            description="Thẻ đã đánh dấu"
            icon={<Bookmark className="w-8 h-8 text-orange-600" />}
            trend="up"
            trendValue="Sẵn sàng ôn tập"
            borderColor="border-orange-100"
          />

          <StatCard
            title="Bài tập"
            value={totalQuizzes}
            description="Bài tập đã làm"
            icon={<Brain className="w-8 h-8 text-purple-600" />}
            trend="up"
            trendValue={`${passedQuizzes}/${totalQuizzes} đạt`}
            borderColor="border-purple-100"
          />

          <StatCard
            title="Quiz Score"
            value={`${avgQuizScore}%`}
            description="Điểm trung bình"
            icon={<Award className="w-8 h-8 text-green-600" />}
            trend="up"
            trendValue={`Điểm TB: ${avgQuizScore}%`}
            borderColor="border-green-100"
          />
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="flashcards" className="gap-2">
              <Library className="w-4 h-4" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Đã lưu
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <Brain className="w-4 h-4" />
              Bài tập
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Flashcards History */}
          <TabsContent value="flashcards" className="space-y-4">
            {flashcards.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Library className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có flashcard nào</p>
                </CardContent>
              </Card>
            ) : (
              flashcards.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {item.type || "Flashcard Set"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge
                        className={cn(
                          "text-sm font-semibold",
                          item.isSaved
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {item.isSaved ? "Đã lưu" : "Chưa lưu"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{item.cards.length} thẻ</span>
                        <span>Loại: {item.type}</span>
                      </div>
                      <Progress value={100} className="h-2" />

                      {/* Expandable Details */}
                      {expandedFlashcards.has(item.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {loadingDetails.has(item.id) ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                Danh sách thẻ ({item.cards.length})
                              </h4>
                              {item.cards.map((card, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200"
                                >
                                  <div className="flex items-start gap-2 mb-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      #{idx + 1}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800 mb-2">
                                        {card.front}
                                      </p>
                                      <div className="bg-white p-3 rounded border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                          {card.back}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Cập nhật: {formatDate(item.updatedAt)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => toggleFlashcardDetails(item.id)}
                        >
                          {expandedFlashcards.has(item.id)
                            ? "Ẩn chi tiết"
                            : "Xem chi tiết"}
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              expandedFlashcards.has(item.id) && "rotate-180"
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Saved Flashcards */}
          <TabsContent value="saved" className="space-y-4">
            {flashcards.filter((fc) => fc.isSaved).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có flashcard đã lưu nào</p>
                </CardContent>
              </Card>
            ) : (
              flashcards
                .filter((fc) => fc.isSaved)
                .map((card) => (
                  <Card
                    key={card.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {card.type || "Saved Flashcard"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(card.createdAt)}
                            </span>
                            <Badge variant="outline">
                              {card.cards.length} thẻ
                            </Badge>
                          </CardDescription>
                        </div>
                        <Bookmark className="w-5 h-5 text-orange-500 fill-current" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {card.cards.slice(0, 2).map((c, idx) => (
                          <div
                            key={idx}
                            className="bg-blue-50 p-3 rounded-lg border border-blue-100"
                          >
                            <p className="text-sm font-semibold text-gray-800 mb-1">
                              {c.front}
                            </p>
                            <p className="text-sm text-gray-600">{c.back}</p>
                          </div>
                        ))}
                        {card.cards.length > 2 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{card.cards.length - 2} thẻ khác
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* Quiz History */}
          <TabsContent value="quizzes" className="space-y-4">
            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có bài quiz nào</p>
                </CardContent>
              </Card>
            ) : (
              quizzes.map((quiz) => {
                const stats = calculateQuizStats(quiz);
                return (
                  <Card
                    key={quiz.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {quiz.quizSets?.title || "Bài Quiz"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            {stats.totalQuestions > 0
                              ? `${stats.totalQuestions} câu hỏi`
                              : "Đang tải..."}
                          </CardDescription>
                        </div>
                        {stats.totalQuestions > 0 &&
                          (stats.passed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500" />
                          ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-blue-600">
                              {stats.correctAnswers}/{stats.totalQuestions}
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="font-semibold">
                                {stats.percentage}%
                              </div>
                              <div>Điểm đạt được</div>
                            </div>
                          </div>
                          <Badge
                            className={
                              stats.passed
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-red-100 text-red-700 border-red-300"
                            }
                          >
                            {stats.passed ? "Đạt" : "Chưa đạt"}
                          </Badge>
                        </div>
                        <Progress value={stats.percentage} className="h-2" />
                        {/* Expandable Quiz Details */}
                        {expandedQuizzes.has(quiz.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {loadingDetails.has(quiz.id) ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600">
                                  Đang tải chi tiết...
                                </span>
                              </div>
                            ) : quiz.quizSets?.questions &&
                              quiz.quizSets.questions.length > 0 ? (
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                <h4 className="font-semibold text-gray-800 mb-3">
                                  Chi tiết câu hỏi ({stats.totalQuestions})
                                </h4>
                                {quiz.quizSets.questions.map(
                                  (question, idx) => {
                                    const userAnswer = quiz.userAnswers[idx];
                                    const isCorrect =
                                      userAnswer === question.correctAnswer;

                                    return (
                                      <div
                                        key={idx}
                                        className={cn(
                                          "p-4 rounded-lg border-2",
                                          isCorrect
                                            ? "bg-green-50 border-green-200"
                                            : "bg-red-50 border-red-200"
                                        )}
                                      >
                                        <div className="flex items-start gap-2 mb-3">
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "text-xs",
                                              isCorrect
                                                ? "bg-green-100 text-green-700 border-green-300"
                                                : "bg-red-100 text-red-700 border-red-300"
                                            )}
                                          >
                                            #{idx + 1}
                                          </Badge>
                                          {isCorrect ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                          ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                          )}
                                          <div className="flex-1">
                                            <p className="font-semibold text-gray-800 mb-3">
                                              {question.question}
                                            </p>

                                            <div className="space-y-2">
                                              {question.options.map(
                                                (option, optIdx) => {
                                                  const isUserAnswer =
                                                    option === userAnswer;
                                                  const isCorrectOption =
                                                    option ===
                                                    question.correctAnswer;

                                                  return (
                                                    <div
                                                      key={optIdx}
                                                      className={cn(
                                                        "p-2 rounded border text-sm",
                                                        isCorrectOption &&
                                                          "bg-green-100 border-green-300 font-semibold",
                                                        isUserAnswer &&
                                                          !isCorrectOption &&
                                                          "bg-red-100 border-red-300",
                                                        !isUserAnswer &&
                                                          !isCorrectOption &&
                                                          "bg-white border-gray-200"
                                                      )}
                                                    >
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-mono">
                                                          {String.fromCharCode(
                                                            65 + optIdx
                                                          )}
                                                          .
                                                        </span>
                                                        <span>{option}</span>
                                                        {isCorrectOption && (
                                                          <Badge className="ml-auto bg-green-600 text-white text-xs">
                                                            Đúng
                                                          </Badge>
                                                        )}
                                                        {isUserAnswer &&
                                                          !isCorrectOption && (
                                                            <Badge className="ml-auto bg-red-600 text-white text-xs">
                                                              Bạn chọn
                                                            </Badge>
                                                          )}
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-center py-4">
                                <p className="text-gray-500">
                                  Không có dữ liệu chi tiết
                                </p>
                              </div>
                            )}
                          </div>
                        )}{" "}
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => toggleQuizDetails(quiz.id)}
                          >
                            {expandedQuizzes.has(quiz.id)
                              ? "Ẩn chi tiết"
                              : "Xem chi tiết"}
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                expandedQuizzes.has(quiz.id) && "rotate-180"
                              )}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Feedback History */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Chức năng feedback đang được phát triển
                </p>
              </CardContent>
            </Card>
            {/* Placeholder for future feedback feature
            {[].map((feedback) => (
              <Card
                key={feedback.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {feedback.assignmentTitle}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Nộp: {formatDate(feedback.submittedAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Chấm: {formatDate(feedback.gradedAt)}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(feedback.status)}>
                      {getStatusText(feedback.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-gray-800">
                          {feedback.score}/{feedback.maxScore}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={(feedback.score / feedback.maxScore) * 100}
                          className="h-3"
                        />
                      </div>
                      <span className="text-lg font-semibold text-blue-600">
                        {Math.round((feedback.score / feedback.maxScore) * 100)}
                        %
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-700">
                          Nhận xét của giảng viên:
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {feedback.feedback}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="gap-2">
                        Xem bài làm
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))} */}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
