import { useState } from "react";
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
} from "lucide-react";
import {
  flashcardHistory,
  savedFlashcards,
  quizHistory,
  feedbackHistory,
} from "@/data/history";
import { cn } from "@/lib/utils";

export default function History() {
  const [selectedTab, setSelectedTab] = useState("flashcards");

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

  // Calculate stats
  const avgFlashcardScore = Math.round(
    flashcardHistory.reduce((acc, item) => acc + item.score, 0) /
      flashcardHistory.length
  );
  const avgQuizScore = Math.round(
    quizHistory.reduce(
      (acc, quiz) => acc + (quiz.score / quiz.totalQuestions) * 100,
      0
    ) / quizHistory.length
  );
  const passedQuizzes = quizHistory.filter((q) => q.passed).length;

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
            value={flashcardHistory.length}
            description="Bộ flashcards đã học"
            icon={<Library className="w-8 h-8 text-blue-600" />}
            trend="up"
            trendValue={`Điểm TB: ${avgFlashcardScore}%`}
            borderColor="border-blue-100"
          />

          <StatCard
            title="Thẻ đã lưu"
            value={savedFlashcards.length}
            description="Thẻ đã đánh dấu"
            icon={<Bookmark className="w-8 h-8 text-orange-600" />}
            trend="up"
            trendValue="Sẵn sàng ôn tập"
            borderColor="border-orange-100"
          />

          <StatCard
            title="Bài tập"
            value={quizHistory.length}
            description="Bài tập đã làm"
            icon={<Brain className="w-8 h-8 text-purple-600" />}
            trend="up"
            trendValue={`${passedQuizzes}/${quizHistory.length} đạt`}
            borderColor="border-purple-100"
          />

          <StatCard
            title="Feedback"
            value={feedbackHistory.length}
            description="Feedback đã nhận"
            icon={<MessageSquare className="w-8 h-8 text-green-600" />}
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
            {flashcardHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {item.setTitle}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.completedAt)}
                      </CardDescription>
                    </div>
                    <Badge
                      className={cn(
                        "text-sm font-semibold",
                        item.score >= 90
                          ? "bg-green-100 text-green-700"
                          : item.score >= 70
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      )}
                    >
                      {item.score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {item.cardsStudied} / {item.totalCards} thẻ đã học
                      </span>
                      <span>
                        {Math.round(
                          (item.cardsStudied / item.totalCards) * 100
                        )}
                        % hoàn thành
                      </span>
                    </div>
                    <Progress
                      value={(item.cardsStudied / item.totalCards) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="gap-2">
                        Học lại
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Saved Flashcards */}
          <TabsContent value="saved" className="space-y-4">
            {savedFlashcards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {card.question}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(card.savedAt)}
                        </span>
                        <Badge variant="outline">{card.category}</Badge>
                      </CardDescription>
                    </div>
                    <Bookmark className="w-5 h-5 text-orange-500 fill-current" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {card.answer}
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Từ bộ: {card.setTitle}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Quiz History */}
          <TabsContent value="quizzes" className="space-y-4">
            {quizHistory.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(quiz.completedAt)}
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4" />
                        {quiz.timeSpent} phút
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
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-blue-600">
                          {quiz.score}/{quiz.totalQuestions}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="font-semibold">
                            {Math.round(
                              (quiz.score / quiz.totalQuestions) * 100
                            )}
                            %
                          </div>
                          <div>Điểm đạt được</div>
                        </div>
                      </div>
                      <Badge
                        className={
                          quiz.passed
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"
                        }
                      >
                        {quiz.passed ? "Đạt" : "Chưa đạt"}
                      </Badge>
                    </div>
                    <Progress
                      value={(quiz.score / quiz.totalQuestions) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="gap-2">
                        Xem chi tiết
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Feedback History */}
          <TabsContent value="feedback" className="space-y-4">
            {feedbackHistory.map((feedback) => (
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
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
