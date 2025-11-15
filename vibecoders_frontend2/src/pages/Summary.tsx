import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Sparkles,
  Save,
  Brain,
  Loader2,
  FileQuestion,
  X,
  FileText,
  Image as ImageIcon,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Editor, Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

import GenerateSerivce from "@/util/generate.api";

const Summary = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [ocrText, setOcrText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const editorRef = useRef<Editor | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFiles = Array.from(uploadedFiles);
      setFiles((prev) => [...prev, ...newFiles]);
      toast({
        title: "File đã tải lên",
        description: `Đã thêm ${newFiles.length} file${
          newFiles.length > 1 ? "s" : ""
        }`,
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Đã xóa file",
      description: "File đã được loại bỏ khỏi danh sách",
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const handleSummary = async () => {
    if (files.length === 0) return;

    setIsLoading(true);

    try {
      // call API to get summary from multiple files
      const data = await GenerateSerivce.getSummaryText(files);

      // Parse the summary if it's wrapped in JSON
      let summaryText = data.summary;

      // Check if summary contains JSON with title and summary fields
      if (summaryText && summaryText.includes("```json")) {
        // Extract JSON from markdown code block
        const jsonMatch = summaryText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsedData = JSON.parse(jsonMatch[1]);
            summaryText = parsedData.summary || summaryText;
          } catch (parseError) {
            console.warn("Could not parse JSON from summary:", parseError);
          }
        }
      }

      setSummary(summaryText);
      setIsLoading(false);
      setIsEditing(true);
      setIsSaved(false);
      toast({
        title: "Tóm tắt hoàn tất",
        description: `AI đã tạo bản tóm tắt từ ${files.length} file${
          files.length > 1 ? "s" : ""
        }`,
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
      // Get content from editor if in edit mode
      const content = editorRef.current?.getInstance().getMarkdown() || summary;
      setSummary(content);

      await GenerateSerivce.saveSummaryText(content);
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
          setTitle:
            files.length > 0
              ? `Flashcards từ ${files.length} tài liệu`
              : "Flashcards từ tóm tắt",
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
          quizTitle:
            files.length > 0
              ? `Quiz từ ${files.length} tài liệu`
              : "Quiz từ tóm tắt",
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
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-smooth bg-muted/30"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">
                    Nhấn để tải lên tài liệu hoặc hình ảnh
                  </span>
                  <span className="text-sm text-muted-foreground/70">
                    Hỗ trợ nhiều file: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    multiple
                  />
                </label>
              </div>

              {/* Display uploaded files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      File đã tải lên ({files.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiles([])}
                      className="text-destructive hover:text-destructive"
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0">
                            {file.type.startsWith("image/")
                              ? "Hình ảnh"
                              : "Tài liệu"}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="flex-shrink-0 ml-2 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSummary}
                disabled={files.length === 0 || isLoading}
                className="w-full bg-gradient-primary"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Đang tóm tắt {files.length} file
                    {files.length > 1 ? "s" : ""}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Lấy nội dung từ{" "}
                    {files.length > 0
                      ? `${files.length} file${files.length > 1 ? "s" : ""}`
                      : "tài liệu"}
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Summary Section */}
          {summary && (
            <Card className="p-6 shadow-soft animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (isEditing) {
                          // Save when toggling from edit mode
                          handleSave();
                        } else {
                          // Switch to edit mode
                          setIsEditing(true);
                          setIsSaved(false);
                          setTimeout(() => {
                            editorRef.current?.getInstance().focus();
                          }, 0);
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {isEditing ? "Lưu" : "Chỉnh sửa"}
                    </Button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="tui-editor-wrapper">
                    <Editor
                      ref={editorRef}
                      initialValue={summary || ""}
                      initialEditType="wysiwyg"
                      previewStyle="vertical"
                      height="500px"
                      useCommandShortcut={true}
                    />
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <Viewer
                      initialValue={summary || "Nội dung tóm tắt trống"}
                    />
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
