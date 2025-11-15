import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Star, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { SaveWorkoutRequest, uploadMediaApi,saveWorkoutApi } from "@/util/workoutTracker.api";

export const WorkoutTracker = () => {
  const [image, setImage] = useState<string | null>("https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("Tư thế tốt! Lưng thẳng, hơi thở đều. Cần chú ý: Đầu gối không vượt quá mũi chân khi squat.");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const { toast } = useToast();


  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const type = file.type.startsWith("video") ? "video" : "image";
  setMediaType(type);
  setMediaFile(file);
  const reader = new FileReader();
  reader.onloadend = () => {
    setMedia(reader.result as string);
  };
  reader.readAsDataURL(file);
  };

  const handleCheckWorkout = async () => {
  if (!mediaFile) {
    return toast({
      title: "Chưa chọn file",
      description: "Vui lòng tải lên ảnh hoặc video trước",
    });
  }

  try {
    const result = await uploadMediaApi(mediaFile);

    setScore(result.point);
    setFeedback(result.comment);

    toast({
      title: "Đã phân tích!",
      description: "AI đã xử lý file của bạn",
    });
  } catch (err) {
    toast({
      title: "Lỗi",
      description: "Không thể phân tích file",
    });
  }
};

    const handleSaveWorkout = async () => {
      if (!mediaFile || score === null) {
        sonnerToast.error("Vui lòng tải file và nhận đánh giá trước khi lưu");
        return;
      }

      const workoutData: SaveWorkoutRequest = {
        score,
        comment: feedback,
        note: notes,
      };

      try {
        const res = await saveWorkoutApi(workoutData, [mediaFile]);
        sonnerToast.success("Đã lưu bài tập vào lịch sử!");
        setNotes("");
      } catch (err) {
        sonnerToast.error("Lưu thất bại, thử lại");
      }
    };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30 shadow-[var(--shadow-elegant)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-secondary/80">
          <Camera className="w-5 h-5 text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Theo Dõi Tập Luyện</h2>
      </div>

      <div className="space-y-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors">
          {media ? (
            mediaType === "image" ? (
              <img src={media} className="w-full h-full object-cover" />
            ) : (
              <video
                src={media}
                controls
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tải ảnh hoặc video tập luyện</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleMediaUpload}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90"
        >
          <Camera className="w-4 h-4 mr-2" />
          Chụp / Tải ảnh
        </Button>
        <Button
          onClick={handleCheckWorkout}
          className="w-full bg-primary hover:opacity-90"
        >
          🔍 Kiểm Tra
        </Button>
        {score !== null && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Điểm đánh giá</p>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < score
                          ? "fill-secondary text-secondary"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                {score}/10
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Nhận xét AI</p>
              <p className="text-sm text-foreground">{feedback}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Phản hồi của bạn
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thêm feedback để AI cải thiện trong lần sau..."
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleSaveWorkout}
              className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu vào lịch sử
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
