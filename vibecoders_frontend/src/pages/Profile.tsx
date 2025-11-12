import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, Activity, Utensils, Calendar, Video, Target, Heart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SavedPlan {
  personalInfo: {
    weight: string;
    height: string;
    goal: string;
    dietaryPreference: string;
    excludedFoods: string;
    healthConditions: string;
  };
  bmiResult: {
    bmi: number;
    category: string;
  };
  workoutDescription: string;
  schedule: Array<{
    day: string;
    exercises: Array<{
      name: string;
      description: string;
      sets: string;
      reps: string;
      youtubeUrl: string;
    }>;
  }>;
  meals: {
    [key: string]: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  };
  savedAt: string;
}

export default function ProfilePage() {
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    const plan = localStorage.getItem("savedWorkoutPlan");
    if (plan) {
      setSavedPlan(JSON.parse(plan));
    }
  }, []);

  if (!savedPlan) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Hồ sơ cá nhân</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn chưa lưu kế hoạch tập luyện nào. Vui lòng tạo và lưu kế hoạch từ trang BMI & Workout Plan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Hồ sơ cá nhân</h1>
        <Badge variant="secondary" className="text-sm">
          Cập nhật: {new Date(savedPlan.savedAt).toLocaleDateString("vi-VN")}
        </Badge>
      </div>

      {/* Personal Information */}
      <Card className="bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cân nặng</p>
              <p className="text-lg font-semibold text-foreground">{savedPlan.personalInfo.weight} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Chiều cao</p>
              <p className="text-lg font-semibold text-foreground">{savedPlan.personalInfo.height} cm</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Mục tiêu</p>
            <p className="text-foreground">{savedPlan.personalInfo.goal}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nhu cầu ăn uống</p>
            <Badge variant="outline">{savedPlan.personalInfo.dietaryPreference}</Badge>
          </div>

          {savedPlan.personalInfo.excludedFoods && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Không sử dụng thực phẩm</p>
              <p className="text-foreground">{savedPlan.personalInfo.excludedFoods}</p>
            </div>
          )}

          {savedPlan.personalInfo.healthConditions && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" />
                Tình trạng sức khỏe
              </p>
              <p className="text-foreground">{savedPlan.personalInfo.healthConditions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BMI Result */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Chỉ số BMI</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                {savedPlan.bmiResult.bmi}
              </p>
              <p className="text-lg font-medium text-foreground mt-1">{savedPlan.bmiResult.category}</p>
            </div>
            <Activity className="w-16 h-16 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Workout Description */}
      {savedPlan.workoutDescription && (
        <Card className="bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Mô tả kế hoạch tập luyện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{savedPlan.workoutDescription}</p>
          </CardContent>
        </Card>
      )}

      {/* Workout Schedule */}
      <Card className="bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Lịch tập luyện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {savedPlan.schedule.map((day, dayIdx) => (
              <AccordionItem key={dayIdx} value={`day-${dayIdx}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{day.day}</span>
                    <span className="text-sm text-muted-foreground">({day.exercises.length} bài tập)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {day.exercises.map((exercise, exIdx) => (
                      <div key={exIdx} className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                          <a
                            href={exercise.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary-glow transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            Xem video
                          </a>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-foreground">
                            <strong>Sets:</strong> {exercise.sets}
                          </span>
                          <span className="text-foreground">
                            <strong>Reps:</strong> {exercise.reps}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Meal Plan */}
      <Card className="bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-secondary" />
            Thực đơn dinh dưỡng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysOfWeek.map((day) => (
            savedPlan.meals[day] && savedPlan.meals[day].length > 0 && (
              <div key={day} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {day}
                </h3>
                <div className="space-y-2">
                  {savedPlan.meals[day].map((meal, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="font-semibold text-foreground mb-2">{meal.name}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                          {meal.calories} kcal
                        </span>
                        <span>Protein: {meal.protein}g</span>
                        <span>Carbs: {meal.carbs}g</span>
                        <span>Fat: {meal.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-foreground">Tổng dinh dưỡng</p>
                    <span className="text-lg font-bold text-secondary">
                      {savedPlan.meals[day].reduce((sum, meal) => sum + meal.calories, 0)} kcal
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                    <div>Protein: {savedPlan.meals[day].reduce((sum, m) => sum + m.protein, 0)}g</div>
                    <div>Carbs: {savedPlan.meals[day].reduce((sum, m) => sum + m.carbs, 0)}g</div>
                    <div>Fat: {savedPlan.meals[day].reduce((sum, m) => sum + m.fat, 0)}g</div>
                  </div>
                </div>
              </div>
            )
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
