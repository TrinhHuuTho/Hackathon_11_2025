import { MainLayout } from "@/components/Layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  MessageCircle,
  ThumbsUp,
  ArrowRight,
  Flame,
  Target,
  Award,
  RotateCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  recentQuizzes,
  popularTheories,
  popularQuestions,
  learningStreak,
  userProgress,
} from "@/data/dashboard";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenerateService from "@/util/generate.api";
import { QuizAnswerDto } from "@/types/history";

export default function Dashboard() {
  const navigate = useNavigate();
  const [notPassedQuizzes, setNotPassedQuizzes] = useState<QuizAnswerDto[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return difficulty;
    }
  };

  const calculateQuizStats = (quiz: QuizAnswerDto) => {
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
      if (quiz.userAnswers[index] === question.answer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= 70;

    return {
      correctAnswers,
      totalQuestions,
      percentage,
      passed,
    };
  };

  useEffect(() => {
    const onboarding = localStorage.getItem("onboarding");

    // Redirect if onboarding is not completed
    // Cases: null (not set), "false", or any value that's not "true"
    // if (!onboarding || onboarding === "false") {
    //   navigate("/onboarding", { replace: true });
    // }

    // Load not passed quizzes
    const loadNotPassedQuizzes = async () => {
      try {
        setLoadingQuizzes(true);
        const data = await GenerateService.getNotPassedQuizzes();
        setNotPassedQuizzes(data);
      } catch (error) {
        console.error("Error loading not passed quizzes:", error);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    loadNotPassedQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Trang chủ</h1>
                <p className="text-gray-600">
                  Chào mừng trở lại! Hãy tiếp tục hành trình học tập của bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Flame className="w-8 h-8 text-orange-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {learningStreak.currentStreak}
                  </div>
                  <p className="text-xs text-gray-600">ngày liên tiếp</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-gray-700">Chuỗi học tập</p>
              <p className="text-xs text-gray-500 mt-1">
                Cao nhất: {learningStreak.longestStreak} ngày
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Target className="w-8 h-8 text-blue-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProgress.averageScore}%
                  </div>
                  <p className="text-xs text-gray-600">điểm TB</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-gray-700">Thành tích</p>
              <p className="text-xs text-gray-500 mt-1">
                {userProgress.totalQuizzes} bài quiz
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BookOpen className="w-8 h-8 text-purple-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {userProgress.inProgressCourses}
                  </div>
                  <p className="text-xs text-gray-600">đang học</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-gray-700">Khóa học</p>
              <p className="text-xs text-gray-500 mt-1">
                {userProgress.completedCourses} hoàn thành
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Award className="w-8 h-8 text-green-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {learningStreak.totalDays}
                  </div>
                  <p className="text-xs text-gray-600">ngày học</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-gray-700">Tổng cộng</p>
              <p className="text-xs text-gray-500 mt-1">Kiên trì mỗi ngày!</p>
            </CardContent>
          </Card>
        </div>

        {/* Not Passed Quizzes - Main Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RotateCw className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Các bài kiểm tra chưa đạt được. Thử kiểm tra lại.
              </h2>
            </div>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() =>
                navigate("/history", { state: { tab: "not-passed" } })
              }
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {loadingQuizzes ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Đang tải bài kiểm tra...</p>
              </div>
            </div>
          ) : notPassedQuizzes.length === 0 ? (
            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  🎉 Tuyệt vời! Bạn đã vượt qua tất cả các bài kiểm tra
                </h3>
                <p className="text-gray-600">
                  Không có bài kiểm tra nào cần làm lại. Hãy tiếp tục phát huy!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notPassedQuizzes.map((quiz) => {
                const stats = calculateQuizStats(quiz);
                return (
                  <Card
                    key={quiz.id}
                    className="hover:shadow-lg transition-all border-2 border-red-200 bg-gradient-to-br from-red-50 to-white"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <CardTitle className="text-lg">
                              {quiz.quizSets?.title || "Bài Quiz"}
                            </CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {stats.totalQuestions} câu hỏi
                          </CardDescription>
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                          Chưa đạt - {stats.percentage}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-red-600">
                              {stats.correctAnswers}/{stats.totalQuestions}
                            </span>
                            <span className="text-sm text-gray-600">
                              ({stats.percentage}%)
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-600">Cần đạt</div>
                            <div className="text-sm font-semibold text-orange-600">
                              70%
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={stats.percentage}
                          className="h-2 bg-red-100"
                        />
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-red-700">Sai: </span>
                              <span className="font-bold text-red-800">
                                {stats.totalQuestions - stats.correctAnswers}{" "}
                                câu
                              </span>
                            </div>
                            <div className="text-orange-700 font-semibold">
                              Thiếu {70 - stats.percentage}% để đạt
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() =>
                              navigate("/history", {
                                state: { tab: "not-passed" },
                              })
                            }
                          >
                            Chi tiết
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                            onClick={() => {
                              navigate("/quiz", {
                                state: {
                                  quizData: quiz.quizSets.questions,
                                  quizTitle:
                                    quiz.quizSets?.title || "Làm lại Quiz",
                                  quizDescription:
                                    "Làm lại để cải thiện kết quả",
                                  isRetake: true,
                                },
                              });
                            }}
                          >
                            <RotateCw className="w-4 h-4" />
                            Làm lại
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Popular Theories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Lý thuyết phổ biến dành cho bạn
              </h2>
            </div>
            <Button variant="ghost" className="gap-2">
              Khám phá thêm
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularTheories.map((theory) => (
              <Card
                key={theory.id}
                className="hover:shadow-lg transition-all group cursor-pointer border-2"
              >
                <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {theory.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {theory.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getDifficultyColor(theory.difficulty)}>
                      {getDifficultyText(theory.difficulty)}
                    </Badge>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {theory.estimatedTime} phút
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {theory.views}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" size="sm">
                    Học ngay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Questions */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Câu hỏi phổ biến cho bạn
              </h2>
            </div>
            <Button variant="ghost" className="gap-2">
              Xem thêm
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {popularQuestions.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-all border-2"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {item.question}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Badge variant="outline">{item.category}</Badge>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {item.askedCount} lượt hỏi
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {item.helpfulCount} hữu ích
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      Câu trả lời:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      Hỏi lần cuối: {formatDate(item.lastAsked)}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Chi tiết
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
