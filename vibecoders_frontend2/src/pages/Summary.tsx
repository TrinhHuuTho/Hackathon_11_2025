import { useState } from "react";
import { Upload, Sparkles, Save, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

const Summary = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

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
    // Simulate AI summary
    setTimeout(() => {
      setSummary(`Tóm tắt nội dung từ file "${file.name}":\n\nĐây là một bản tóm tắt tự động được tạo bởi AI. Nội dung chính bao gồm:\n\n1. Các khái niệm chính\n2. Điểm quan trọng cần nhớ\n3. Kết luận và ứng dụng thực tế\n\nBạn có thể chỉnh sửa nội dung này theo ý muốn.`);
      setIsLoading(false);
      setIsEditing(true);
      toast({
        title: "Tóm tắt hoàn tất",
        description: "AI đã tạo bản tóm tắt từ file của bạn",
      });
    }, 2000);
  };

  const handleSave = () => {
    toast({
      title: "Đã lưu",
      description: "Bản tóm tắt đã được lưu thành công",
    });
    setIsEditing(false);
  };

  const handleGenerateQuiz = () => {
    toast({
      title: "Đang tạo câu hỏi...",
      description: "AI đang tạo bài kiểm tra từ nội dung này",
    });
    // Navigate to quiz page or generate quiz
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Tóm tắt tài liệu</h1>
          <p className="text-muted-foreground">Tải lên tài liệu và để AI tóm tắt cho bạn</p>
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
                    accept=".pdf,.doc,.docx,.txt"
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
                    Tóm tắt với AI
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
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="sm"
                    >
                      {isEditing ? "Xem" : "Chỉnh sửa"}
                    </Button>
                    {isEditing && (
                      <Button onClick={handleSave} size="sm" className="bg-accent">
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

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleGenerateQuiz}
                    className="w-full bg-secondary"
                    size="lg"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Tạo câu hỏi kiểm tra
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
