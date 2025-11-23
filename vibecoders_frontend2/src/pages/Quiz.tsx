import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import QuizQuestionItem from "@/components/QuizQuestionItem";
import { QuizQuestion, QuizState, QuizAnswerDto } from "@/types/quiz";
import GenerateService from "@/util/generate.api";
import { useAuth } from "@/contexts/AuthContext";

type QuestionType =
  | "true-false"
  | "multiple-choice"
  | "multiple-answer"
  | "fill-blank";

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  userAnswer?: string | string[];
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    type: "true-false",
    question: "Trí tuệ nhân tạo (AI) chỉ có thể thực hiện các tác vụ đơn giản?",
    correctAnswer: "false",
  },
  {
    id: 2,
    type: "multiple-choice",
    question: "Thuật toán học máy nào được sử dụng phổ biến nhất?",
    options: [
      "Linear Regression",
      "Decision Trees",
      "Neural Networks",
      "K-Means",
    ],
    correctAnswer: "Neural Networks",
  },
  {
    id: 3,
    type: "multiple-answer",
    question: "Chọn các loại học máy (Machine Learning) phổ biến:",
    options: [
      "Supervised Learning",
      "Unsupervised Learning",
      "Reinforcement Learning",
      "Deep Frying",
    ],
    correctAnswer: [
      "Supervised Learning",
      "Unsupervised Learning",
      "Reinforcement Learning",
    ],
  },
  {
    id: 4,
    type: "fill-blank",
    question:
      "_______ là quá trình huấn luyện mô hình AI bằng dữ liệu có nhãn.",
    correctAnswer: "supervised learning",
  },
  {
    id: 5,
    type: "true-false",
    question: "Deep Learning là một nhánh con của Machine Learning?",
    correctAnswer: "true",
  },
  {
    id: 6,
    type: "multiple-choice",
    question: "Ngôn ngữ lập trình nào được sử dụng nhiều nhất trong AI?",
    options: ["Java", "Python", "C++", "JavaScript"],
    correctAnswer: "Python",
  },
  {
    id: 7,
    type: "multiple-answer",
    question: "Chọn các framework phổ biến cho Deep Learning:",
    options: ["TensorFlow", "PyTorch", "React", "Keras", "Angular"],
    correctAnswer: ["TensorFlow", "PyTorch", "Keras"],
  },
  {
    id: 8,
    type: "fill-blank",
    question:
      "_______ là kỹ thuật để tránh overfitting bằng cách thêm penalty vào loss function.",
    correctAnswer: "regularization",
  },
];

const Quiz = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get quiz data from navigation state
  const navigationData = location.state as QuizState | null;

  const [questions, setQuestions] = useState<QuizQuestion[]>(
    navigationData?.quizData || []
  );
  const [quizTitle, setQuizTitle] = useState(
    navigationData?.quizTitle || "Bài kiểm tra"
  );
  const [quizDescription, setQuizDescription] = useState(
    navigationData?.quizDescription || ""
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (navigationData?.quizData) {
      setQuestions(navigationData.quizData);
      setQuizTitle(navigationData.quizTitle || "Bài kiểm tra");
      setQuizDescription(navigationData.quizDescription || "");
      setCurrentIndex(0);
      setAnswers({});
      setIsSubmitted(false);
    }
  }, [navigationData]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id]?.toLowerCase().trim();
      const correctAnswer = q.answer.toLowerCase().trim();

      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsSubmitted(true);

    console.log("User Answers:", answers);
    console.log(
      "Correct Answers:",
      questions.map((q) => ({ id: q.id, answer: q.answer }))
    );

    // Save quiz and answers to backend
    try {
      const quizAnswerData: QuizAnswerDto = {
        quizSets: {
          questions: questions,
        },
        userAnswers: questions.map((q) => answers[q.id] || ""),
        passed: correctCount >= questions.length * 0.5,
      };

      console.log("Quiz Answer Data to be saved:", quizAnswerData);

      await GenerateService.saveQuizAnswer(quizAnswerData);
      console.log("Quiz and answers saved successfully");
    } catch (error) {
      console.error("Error saving quiz and answers:", error);
      // Don't show error to user, just log it
    }

    toast({
      title: "Đã nộp bài!",
      description: `Bạn đạt ${correctCount}/${questions.length} câu đúng`,
    });
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const isQuestionAnswered = (questionId: string) => {
    return answers[questionId] !== undefined && answers[questionId] !== "";
  };

  const isAnswerCorrect = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return false;
    const userAnswer = answers[questionId]?.toLowerCase().trim();
    const correctAnswer = question.answer.toLowerCase().trim();
    return userAnswer === correctAnswer;
  };

  if (questions.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không có câu hỏi nào
          </h2>
          <p className="text-gray-600">
            Vui lòng tạo quiz từ flashcards hoặc tóm tắt
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{quizTitle}</h1>
              <p className="text-gray-600">{quizDescription}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Câu {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        {!isSubmitted ? (
          <>
            <QuizQuestionItem
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              onAnswer={handleAnswer}
              userAnswer={answers[currentQuestion.id]}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                size="lg"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Câu trước
              </Button>

              <div className="text-sm text-gray-600">
                {Object.keys(answers).length} / {totalQuestions} câu đã trả lời
              </div>

              {currentIndex < totalQuestions - 1 ? (
                <Button onClick={handleNext} size="lg">
                  Câu tiếp
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={Object.keys(answers).length !== totalQuestions}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Nộp bài
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  🎉 Kết quả bài kiểm tra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {score}/{totalQuestions}
                  </div>
                  <p className="text-xl text-gray-600">
                    Bạn đạt {Math.round((score / totalQuestions) * 100)}% điểm
                  </p>
                  <Progress
                    value={(score / totalQuestions) * 100}
                    className="h-3 mt-4"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleRetry} size="lg" variant="outline">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Làm lại
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Review Answers */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Xem lại đáp án
              </h2>
              {questions.map((question, index) => (
                <QuizQuestionItem
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  onAnswer={handleAnswer}
                  userAnswer={answers[question.id]}
                  showResult={true}
                  isCorrect={isAnswerCorrect(question.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Quiz;
