import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Award
} from "lucide-react";
import {
  recentQuizzes,
  popularTheories,
  popularQuestions,
  learningStreak,
  userProgress
} from "@/data/dashboard";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short"
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
                <h1 className="text-3xl font-bold text-gray-800">
                  Trang chủ
                </h1>
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
              <p className="text-xs text-gray-500 mt-1">
                Kiên trì mỗi ngày!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quizzes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Bài kiểm tra gần đây
              </h2>
            </div>
            <Button variant="ghost" className="gap-2">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-all border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{quiz.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDate(quiz.completedAt)}
                      </CardDescription>
                    </div>
                    {quiz.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{quiz.subject}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {quiz.score}/{quiz.totalQuestions}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({Math.round((quiz.score / quiz.totalQuestions) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={(quiz.score / quiz.totalQuestions) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="gap-2">
                        Xem chi tiết
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <Card key={theory.id} className="hover:shadow-lg transition-all group cursor-pointer border-2">
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
              <Card key={item.id} className="hover:shadow-lg transition-all border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{item.question}</CardTitle>
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
                    <p className="text-sm font-semibold text-blue-900 mb-2">Câu trả lời:</p>
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
