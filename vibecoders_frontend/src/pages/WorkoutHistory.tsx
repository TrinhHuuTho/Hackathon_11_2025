import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar } from "lucide-react";
import { WorkoutRecord, getWorkoutHistoryApi } from "@/util/workoutTracker.api";
import { toast } from "sonner";

export default function WorkoutHistoryPage() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(6); 
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (page: number) => {
    try {
      const data = await getWorkoutHistoryApi(page, size);
      setRecords(data.content);
      setTotalPages(data.totalPages);
      setPage(data.pageable.pageNumber);
    } catch (err) {
      toast.error("Không thể tải lịch sử tập luyện");
    }
  };

  useEffect(() => {
    fetchHistory(0);
  }, []);

  const handlePrev = () => {
    if (page > 0) fetchHistory(page - 1);
  };

  const handleNext = () => {
    if (page + 1 < totalPages) fetchHistory(page + 1);
  };

  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Lịch sử tập luyện</h1>
        <p>Bạn chưa có bài tập nào được lưu.</p>
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
              <img src={record.fileUrl} alt="Workout" className="w-full h-full object-cover" />
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
                    className={`w-3 h-3 ${i < record.score ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1 font-medium">Nhận xét AI</p>
                <p className="text-sm text-foreground">{record.comment}</p>
              </div>

              {record.note && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Ghi chú</p>
                  <p className="text-sm text-foreground">{record.note}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="w-3 h-3" />
                <span>{new Date(record.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button onClick={handlePrev} disabled={page === 0}>
          Trước
        </Button>
        <span>
          Trang {page + 1} / {totalPages}
        </span>
        <Button onClick={handleNext} disabled={page + 1 >= totalPages}>
          Sau
        </Button>
      </div>
    </div>
  );
}
