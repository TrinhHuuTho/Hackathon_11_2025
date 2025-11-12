import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface WorkoutRecord {
  id: string;
  image: string;
  score: number;
  feedback: string;
  notes: string;
  date: string;
}

export default function WorkoutHistoryPage() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);

  useEffect(() => {
    const savedRecords = localStorage.getItem("workoutHistory");
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem("workoutHistory", JSON.stringify(updatedRecords));
    toast.success("Đã xóa bài tập");
  };

  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Lịch sử tập luyện</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn chưa có bài tập nào được lưu. Hãy sử dụng tính năng Workout Tracker để tải ảnh và nhận đánh giá từ AI.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Lịch sử tập luyện</h1>
        <Badge variant="secondary" className="text-sm">
          {records.length} bài tập
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <Card key={record.id} className="bg-gradient-to-br from-card to-muted/30 overflow-hidden">
            <div className="relative aspect-video bg-muted overflow-hidden">
              <img 
                src={record.image} 
                alt="Workout" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(record.id)}>
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Đánh giá AI</CardTitle>
                <div className="flex items-center gap-1 text-secondary">
                  <Star className="w-4 h-4 fill-secondary" />
                  <span className="font-bold">{record.score}/10</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < record.score
                        ? "fill-secondary text-secondary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1 font-medium">Nhận xét AI</p>
                <p className="text-sm text-foreground">{record.feedback}</p>
              </div>

              {record.notes && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Ghi chú</p>
                  <p className="text-sm text-foreground">{record.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="w-3 h-3" />
                <span>{new Date(record.date).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
