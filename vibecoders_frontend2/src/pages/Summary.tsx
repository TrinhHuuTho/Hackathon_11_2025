import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Sparkles,
  Save,
  Brain,
  Loader2,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

import GenerateSerivce from "@/util/generate.api";

const Summary = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      toast({
        title: "File đã tải lên",
        description: `${uploadedFile.name} đã sẵn sàng để tóm tắt`,
      });
    }
  };

  const handleSummary = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      // call API to get summary
      const data = await GenerateSerivce.getSummaryText(file);
      setSummary(data.summary);
      setIsLoading(false);
      setIsEditing(true);
      setIsSaved(false); // Reset saved state when new summary is generated
      toast({
        title: "Tóm tắt hoàn tất",
        description: "AI đã tạo bản tóm tắt từ file của bạn",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Lỗi tóm tắt",
        description: "Đã có lỗi xảy ra khi tóm tắt tài liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await GenerateSerivce.saveSummaryText(summary);
      toast({
        title: "Đã lưu",
        description: "Bản tóm tắt đã được lưu thành công",
      });
      setIsEditing(false);
      setIsSaved(true); // Mark as saved
    } catch (error) {
      toast({
        title: "Lỗi lưu",
        description: "Đã có lỗi xảy ra khi lưu bản tóm tắt. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!summary || summary.trim() === "") {
      toast({
        title: "Chưa có nội dung",
        description: "Vui lòng tạo tóm tắt trước khi tạo flashcards",
        variant: "destructive",
      });
      return;
    }

    if (!isSaved) {
      toast({
        title: "Chưa lưu nội dung",
        description: "Vui lòng lưu bản tóm tắt trước khi tạo flashcards",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingFlashcards(true);
    toast({
      title: "Đang tạo flashcards...",
      description: "AI đang phân tích và tạo flashcards từ nội dung này",
    });

    try {
      const response = await GenerateSerivce.generateFlashcards(summary, 10, [
        "definition",
        "question",
      ]);
      console.log("API response:", response);

      const flashcards = response.map((card: any) => ({
        id: card.id,
        question: card.front,
        answer: card.back,
        category: card.category || "General",
        isBookmarked: false,
        type: card.type,
        difficulty: card.difficulty,
      }));
      console.log("Generated flashcards:", flashcards);

      toast({
        title: "Tạo flashcards thành công!",
        description: `Đã tạo ${flashcards.length} flashcards từ nội dung tóm tắt`,
      });

      // Navigate to flashcards page with data
      navigate("/flashcards", {
        state: {
          flashcards: flashcards,
          setTitle: file?.name || "Flashcards từ tóm tắt",
          setDescription: "Bộ flashcards được tạo tự động từ tài liệu",
        },
      });
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Lỗi tạo flashcards",
        description:
          error.message ||
          "Đã có lỗi xảy ra khi tạo flashcards. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!summary || summary.trim() === "") {
      toast({
        title: "Chưa có nội dung",
        description: "Vui lòng tạo tóm tắt trước khi tạo quiz",
        variant: "destructive",
      });
      return;
    }

    if (!isSaved) {
      toast({
        title: "Chưa lưu nội dung",
        description: "Vui lòng lưu bản tóm tắt trước khi tạo quiz",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingQuiz(true);
    toast({
      title: "Đang tạo quiz...",
      description: "AI đang phân tích và tạo câu hỏi từ nội dung này",
    });

    try {
      const response = await GenerateSerivce.generateQuiz(summary, 10, [
        "fill_blank",
        "mcq",
        "tf",
      ]);
      console.log("Quiz API response:", response);

      toast({
        title: "Tạo quiz thành công!",
        description: `Đã tạo ${response.length} câu hỏi từ nội dung tóm tắt`,
      });

      // Navigate to quiz page with data
      navigate("/quiz", {
        state: {
          quizData: response,
          quizTitle: file?.name || "Quiz từ tóm tắt",
          quizDescription: "Bài kiểm tra được tạo tự động từ tài liệu",
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

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Tóm tắt tài liệu
          </h1>
          <p className="text-muted-foreground">
            Tải lên tài liệu và để AI tóm tắt cho bạn
          </p>
        </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <Card className="p-6 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label
                  htmlFor="file-upload"
                  className="flex-1 flex items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-smooth bg-muted/30"
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {file ? file.name : "Nhấn để tải lên tài liệu"}
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                </label>
              </div>

              <Button
                onClick={handleSummary}
                disabled={!file || isLoading}
                className="w-full bg-gradient-primary"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Đang tóm tắt...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Lấy nội dung từ tài liệu hoặc hình ảnh
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Summary Section */}
          {summary && (
            <Card className="p-6 shadow-soft animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Nội dung tóm tắt</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsEditing(!isEditing);
                        // When switching to edit mode, mark as not saved
                        if (!isEditing) {
                          setIsSaved(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      {isEditing ? "Hủy" : "Chỉnh sửa"}
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={handleSave}
                        size="sm"
                        className="bg-accent"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="min-h-[400px] resize-none"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{summary}</p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={handleGenerateFlashcards}
                    className="w-full bg-secondary"
                    size="lg"
                    disabled={isGeneratingFlashcards || !summary || !isSaved}
                  >
                    {isGeneratingFlashcards ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang tạo flashcards...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        {!isSaved
                          ? "Lưu tóm tắt trước khi tạo flashcard"
                          : "Tạo flashcard cho phần tóm tắt này"}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateQuiz}
                    className="w-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                    disabled={isGeneratingQuiz || !summary || !isSaved}
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang tạo quiz...
                      </>
                    ) : (
                      <>
                        <FileQuestion className="w-5 h-5 mr-2" />
                        {!isSaved
                          ? "Lưu tóm tắt trước khi tạo quiz"
                          : "Tạo bài Quiz từ phần tóm tắt này"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Summary;
