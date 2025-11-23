import { useState, useEffect } from "react";
import { QuizQuestion } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestionItemProps {
  question: QuizQuestion;
  questionNumber: number;
  onAnswer: (questionId: string, answer: string) => void;
  userAnswer?: string;
  showResult?: boolean;
  isCorrect?: boolean;
}

export default function QuizQuestionItem({
  question,
  questionNumber,
  onAnswer,
  userAnswer,
  showResult,
  isCorrect,
}: QuizQuestionItemProps) {
  const [answer, setAnswer] = useState(userAnswer || "");

  // Sync local state with userAnswer prop when it changes
  useEffect(() => {
    setAnswer(userAnswer || "");
  }, [userAnswer, question.id]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    onAnswer(question.id, value);
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case "fill_blank":
        return "Điền vào chỗ trống";
      case "mcq":
        return "Trắc nghiệm";
      case "tf":
        return "Đúng/Sai";
      default:
        return "";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all",
        showResult &&
          (isCorrect
            ? "border-green-500 bg-green-50"
            : "border-red-500 bg-red-50")
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                Câu {questionNumber}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {getQuestionTypeLabel()}
              </span>
            </div>
            <CardTitle className="text-lg">{question.stem}</CardTitle>
          </div>
          {showResult && (
            <div>
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Fill in the blank */}
        {question.type === "fill_blank" && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Nhập câu trả lời..."
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={showResult}
              className={cn(
                showResult &&
                  (isCorrect ? "border-green-500" : "border-red-500")
              )}
            />
            {showResult && !isCorrect && (
              <p className="text-sm text-red-600">
                Đáp án đúng:{" "}
                <span className="font-semibold">{question.answer}</span>
              </p>
            )}
          </div>
        )}

        {/* Multiple choice */}
        {question.type === "mcq" && question.options && (
          <RadioGroup
            value={answer}
            onValueChange={handleAnswerChange}
            disabled={showResult}
          >
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                    answer === option && "bg-blue-50 border-blue-300",
                    showResult &&
                      option === question.answer &&
                      "bg-green-50 border-green-300",
                    showResult &&
                      answer === option &&
                      option !== question.answer &&
                      "bg-red-50 border-red-300"
                  )}
                >
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${index}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                  {showResult && option === question.answer && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* True/False */}
        {question.type === "tf" && question.options && (
          <RadioGroup
            value={answer}
            onValueChange={handleAnswerChange}
            disabled={showResult}
          >
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                    answer === option && "bg-blue-50 border-blue-400",
                    showResult &&
                      option === question.answer &&
                      "bg-green-50 border-green-400",
                    showResult &&
                      answer === option &&
                      option !== question.answer &&
                      "bg-red-50 border-red-400"
                  )}
                >
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${index}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {option}
                  </Label>
                  {showResult && option === question.answer && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}
