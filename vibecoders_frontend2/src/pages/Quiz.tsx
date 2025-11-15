import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

type QuestionType = "true-false" | "multiple-choice" | "multiple-answer" | "fill-blank";

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
    options: ["Linear Regression", "Decision Trees", "Neural Networks", "K-Means"],
    correctAnswer: "Neural Networks",
  },
  {
    id: 3,
    type: "multiple-answer",
    question: "Chọn các loại học máy (Machine Learning) phổ biến:",
    options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Deep Frying"],
    correctAnswer: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"],
  },
  {
    id: 4,
    type: "fill-blank",
    question: "_______ là quá trình huấn luyện mô hình AI bằng dữ liệu có nhãn.",
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
    question: "_______ là kỹ thuật để tránh overfitting bằng cách thêm penalty vào loss function.",
    correctAnswer: "regularization",
  },
];

const Quiz = () => {
  const [questions] = useState<Question[]>(sampleQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string | string[]) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const handleMultipleAnswerToggle = (option: string) => {
    const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(a => a !== option)
      : [...currentAnswers, option];
    handleAnswer(newAnswers);
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

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      const correctAnswer = q.correctAnswer;

      if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
        const sortedUser = [...userAnswer].sort();
        const sortedCorrect = [...correctAnswer].sort();
        if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
          correctCount++;
        }
      } else if (typeof userAnswer === "string" && typeof correctAnswer === "string") {
        if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
          correctCount++;
        }
      }
    });
    setScore(correctCount);
    setIsSubmitted(true);
    toast({
      title: "Đã nộp bài!",
      description: `Bạn đạt ${correctCount}/${questions.length} câu đúng`,
    });
  };

  const renderQuestion = () => {
    const userAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case "true-false":
        return (
          <RadioGroup value={userAnswer as string} onValueChange={handleAnswer}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="text-lg cursor-pointer">Đúng</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="text-lg cursor-pointer">Sai</Label>
            </div>
          </RadioGroup>
        );

      case "multiple-choice":
        return (
          <RadioGroup value={userAnswer as string} onValueChange={handleAnswer}>
            {currentQuestion.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="text-lg cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple-answer":
        const selectedAnswers = (userAnswer as string[]) || [];
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Chọn tất cả đáp án đúng:</p>
            {currentQuestion.options?.map((option, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-smooth"
              >
                <Checkbox
                  id={`multi-${idx}`}
                  checked={selectedAnswers.includes(option)}
                  onCheckedChange={() => handleMultipleAnswerToggle(option)}
                />
                <Label htmlFor={`multi-${idx}`} className="text-lg cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "fill-blank":
        return (
          <Input
            type="text"
            placeholder="Nhập câu trả lời..."
            value={(userAnswer as string) || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            className="text-lg"
          />
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Bài kiểm tra</h1>
          <p className="text-muted-foreground">
            Kiểm tra kiến thức của bạn với các câu hỏi do AI tạo ra
          </p>
        </div>

        {!isSubmitted ? (
          <Card className="p-8 shadow-soft">
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                <span>
                  Câu {currentIndex + 1} / {questions.length}
                </span>
                <span>{Object.keys(answers).length} câu đã trả lời</span>
              </div>

              {/* Question */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {currentIndex + 1}
                  </span>
                  <h2 className="text-2xl font-semibold flex-1">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="ml-11 space-y-3">{renderQuestion()}</div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Câu trước
                </Button>

                {currentIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length !== questions.length}
                    className="bg-gradient-primary"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Nộp bài
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-primary">
                    Câu tiếp
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 shadow-soft text-center animate-fade-in">
            <div className="space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>
                <p className="text-muted-foreground">Bạn đã hoàn thành bài kiểm tra</p>
              </div>
              <div className="text-5xl font-bold text-primary">
                {score}/{questions.length}
              </div>
              <p className="text-xl">
                Điểm số: {Math.round((score / questions.length) * 100)}%
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentIndex(0);
                  setAnswers({});
                }}
                className="bg-gradient-primary"
                size="lg"
              >
                Làm lại
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Quiz;
