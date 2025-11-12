import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip 
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WorkoutDay {
  day: string;
  completed: boolean;
  planned: boolean;
}

interface WeekData {
  week: string;
  completed: number;
  planned: number;
}

export const Dashboard = () => {
  const [currentWeek, setCurrentWeek] = useState<WorkoutDay[]>([
    { day: "Thứ 2", completed: true, planned: true },
    { day: "Thứ 3", completed: true, planned: true },
    { day: "Thứ 4", completed: false, planned: true },
    { day: "Thứ 5", completed: false, planned: true },
    { day: "Thứ 6", completed: false, planned: true },
    { day: "Thứ 7", completed: false, planned: false },
    { day: "Chủ nhật", completed: false, planned: false },
  ]);

  const [weekHistory] = useState<WeekData[]>([
    { week: "Tuần 1", completed: 4, planned: 5 },
    { week: "Tuần 2", completed: 5, planned: 5 },
    { week: "Tuần 3", completed: 3, planned: 5 },
    { week: "Tuần 4", completed: 4, planned: 5 },
  ]);

  const toggleWorkout = (index: number) => {
    setCurrentWeek(prev => prev.map((day, i) => 
      i === index ? { ...day, completed: !day.completed } : day
    ));
  };

  const completedThisWeek = currentWeek.filter(d => d.completed).length;
  const plannedThisWeek = currentWeek.filter(d => d.planned).length;
  const missedThisWeek = plannedThisWeek - completedThisWeek;
  const completionRate = plannedThisWeek > 0 ? (completedThisWeek / plannedThisWeek) * 100 : 0;

  const avgCompleted = weekHistory.reduce((sum, w) => sum + w.completed, 0) / weekHistory.length;
  const avgPlanned = weekHistory.reduce((sum, w) => sum + w.planned, 0) / weekHistory.length;
  const avgCompletionRate = (avgCompleted / avgPlanned) * 100;

  const showAlert = missedThisWeek >= 2;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Tuần này</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{completedThisWeek}/{plannedThisWeek}</p>
          <p className="text-sm text-muted-foreground mt-1">buổi tập hoàn thành</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Tỷ lệ hoàn thành</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{completionRate.toFixed(0)}%</p>
          <Progress value={completionRate} className="mt-2" />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-muted">
              <CheckCircle2 className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Trung bình 4 tuần</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{avgCompletionRate.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground mt-1">{avgCompleted.toFixed(1)}/{avgPlanned.toFixed(1)} buổi/tuần</p>
        </Card>
      </div>

      {/* Alert for missed workouts */}
      {showAlert && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Cần điều chỉnh kế hoạch</AlertTitle>
          <AlertDescription className="text-destructive/90">
            Bạn đã bỏ {missedThisWeek} buổi tập tuần này. Hãy xem gợi ý bên dưới để điều chỉnh lịch tập phù hợp hơn.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Week Tracker */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-secondary/80">
            <Calendar className="w-5 h-5 text-secondary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Lịch tập tuần này</h2>
        </div>
        
        <div className="space-y-3">
          {currentWeek.map((day, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                day.planned
                  ? day.completed
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/50 border-border"
                  : "bg-muted/30 border-border/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                {day.planned && (
                  <Checkbox
                    checked={day.completed}
                    onCheckedChange={() => toggleWorkout(index)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                )}
                <span className={`font-medium ${day.planned ? "text-foreground" : "text-muted-foreground"}`}>
                  {day.day}
                </span>
              </div>
              {day.planned && (
                <span className={`text-sm ${day.completed ? "text-primary" : "text-muted-foreground"}`}>
                  {day.completed ? "Đã hoàn thành ✓" : "Chưa tập"}
                </span>
              )}
              {!day.planned && (
                <span className="text-sm text-muted-foreground">Ngày nghỉ</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Progress Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Tiến độ 4 tuần</h2>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Đã tập" />
            <Bar dataKey="planned" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} name="Kế hoạch" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Suggestions when missing workouts */}
      {showAlert && (
        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Lightbulb className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Gợi ý điều chỉnh</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">🎯 Giảm số buổi tập</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Thay vì tập {plannedThisWeek} buổi/tuần, hãy thử giảm xuống 3 buổi với cường độ cao hơn.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Tạo kế hoạch 3 buổi/tuần
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">⏱️ Rút ngắn thời gian tập</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Chuyển sang các bài tập HIIT 20-30 phút thay vì 60 phút để dễ duy trì hơn.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Xem bài tập HIIT
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">🏠 Tập tại nhà</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Thử các bài tập không cần thiết bị để tiết kiệm thời gian di chuyển đến phòng gym.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Chọn bài tập tại nhà
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">🌅 Thay đổi khung giờ tập</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Nếu khó khăn vào buổi tối, hãy thử tập vào buổi sáng hoặc giờ trưa.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Điều chỉnh lịch tập
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};