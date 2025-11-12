import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Activity, Target, Utensils, Calendar, Edit, ExternalLink, Video, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type Goal = "lose" | "gain" | "maintain";
type DietaryPreference = "none" | "low-carb" | "vegetarian" | "vegan" | "keto" | "paleo";
type WeekDay = "Thứ 2" | "Thứ 3" | "Thứ 4" | "Thứ 5" | "Thứ 6" | "Thứ 7" | "Chủ nhật";

interface Exercise {
  name: string;
  description: string;
  sets: string;
  reps: string;
  youtubeUrl: string;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealsByDay {
  [key: string]: Meal[];
}

interface BMIResult {
  bmi: number;
  category: string;
  schedule: WorkoutDay[];
  meals: MealsByDay;
}

export const BMICalculator = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>("none");
  const [excludedFoods, setExcludedFoods] = useState("");
  const [healthConditions, setHealthConditions] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [selectedDay, setSelectedDay] = useState<WeekDay>("Thứ 2");

  const calculateBMI = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100;
    
    if (!weightNum || !heightNum) {
      toast.error("Vui lòng nhập đầy đủ cân nặng và chiều cao");
      return;
    }

    const bmi = weightNum / (heightNum * heightNum);
    const category = 
      bmi < 18.5 ? "Thiếu cân" :
      bmi < 25 ? "Bình thường" :
      bmi < 30 ? "Thừa cân" : "Béo phì";

    const goalType: Goal = goal.toLowerCase().includes("giảm") ? "lose" :
      goal.toLowerCase().includes("tăng") ? "gain" : "maintain";

    const schedules: Record<Goal, WorkoutDay[]> = {
      lose: [
        {
          day: "Thứ 2",
          exercises: [
            { name: "Chạy bộ", description: "Chạy với tốc độ vừa phải để đốt cháy calo", sets: "1", reps: "30 phút", youtubeUrl: "https://www.youtube.com/watch?v=gLVZ_s6uYOs" },
            { name: "Burpees", description: "Bài tập toàn thân giúp đốt cháy mạnh", sets: "3", reps: "15 lần", youtubeUrl: "https://www.youtube.com/watch?v=TU8QYVW0gDU" }
          ]
        },
        {
          day: "Thứ 4",
          exercises: [
            { name: "HIIT Cardio", description: "Tập luyện cường độ cao xen kẽ", sets: "5", reps: "3 phút", youtubeUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI" },
            { name: "Mountain Climbers", description: "Động tác leo núi tại chỗ", sets: "3", reps: "20 lần", youtubeUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM" }
          ]
        },
        {
          day: "Thứ 6",
          exercises: [
            { name: "Bơi lội", description: "Bơi các kiểu để đốt cháy toàn thân", sets: "1", reps: "40 phút", youtubeUrl: "https://www.youtube.com/watch?v=5HLW2AI1Oio" },
            { name: "Jump Rope", description: "Nhảy dây tốc độ nhanh", sets: "3", reps: "2 phút", youtubeUrl: "https://www.youtube.com/watch?v=FJmRQ5iTXKE" }
          ]
        }
      ],
      gain: [
        {
          day: "Thứ 2",
          exercises: [
            { name: "Bench Press", description: "Đẩy tạ nằm để phát triển ngực", sets: "4", reps: "8-10 lần", youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg" },
            { name: "Shoulder Press", description: "Đẩy tạ vai để tăng cơ vai", sets: "4", reps: "10-12 lần", youtubeUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog" }
          ]
        },
        {
          day: "Thứ 3",
          exercises: [
            { name: "Squat", description: "Gánh tạ ngồi xổm tăng cơ chân", sets: "4", reps: "8-10 lần", youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8" },
            { name: "Deadlift", description: "Nâng tạ đất phát triển toàn thân", sets: "4", reps: "6-8 lần", youtubeUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q" }
          ]
        },
        {
          day: "Thứ 5",
          exercises: [
            { name: "Pull-ups", description: "Kéo xà đơn tăng cơ lưng", sets: "4", reps: "8-12 lần", youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g" },
            { name: "Barbell Row", description: "Chèo tạ đòn phát triển lưng", sets: "4", reps: "10-12 lần", youtubeUrl: "https://www.youtube.com/watch?v=9efgcAjQe7E" }
          ]
        }
      ],
      maintain: [
        {
          day: "Thứ 2",
          exercises: [
            { name: "Jogging", description: "Chạy bộ nhẹ nhàng duy trì sức khỏe", sets: "1", reps: "30 phút", youtubeUrl: "https://www.youtube.com/watch?v=gLVZ_s6uYOs" },
            { name: "Plank", description: "Chống tay tăng cường cơ core", sets: "3", reps: "45 giây", youtubeUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw" }
          ]
        },
        {
          day: "Thứ 4",
          exercises: [
            { name: "Push-ups", description: "Chống đẩy cơ bản", sets: "3", reps: "15 lần", youtubeUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
            { name: "Lunges", description: "Động tác lunge chân trước", sets: "3", reps: "12 lần mỗi chân", youtubeUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U" }
          ]
        },
        {
          day: "Thứ 6",
          exercises: [
            { name: "Cycling", description: "Đạp xe trong nhà hoặc ngoài trời", sets: "1", reps: "40 phút", youtubeUrl: "https://www.youtube.com/watch?v=jdQvlEzTKpM" },
            { name: "Yoga Flow", description: "Yoga các tư thế cơ bản", sets: "1", reps: "30 phút", youtubeUrl: "https://www.youtube.com/watch?v=v7AYKMP6rOE" }
          ]
        }
      ]
    };

    const getMealsByDay = (): MealsByDay => {
      const weekDays: WeekDay[] = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
      const mealsByDay: MealsByDay = {};

      weekDays.forEach(day => {
        let baseMeals: Meal[] = [];
        
        if (goalType === "lose") {
          baseMeals = [
            { name: "Sáng: Yến mạch + trứng luộc + sinh tố xanh", calories: 350, protein: 20, carbs: 40, fat: 12 },
            { name: "Trưa: Cơm gạo lứt + ức gà + rau xào", calories: 450, protein: 35, carbs: 45, fat: 10 },
            { name: "Chiều: Sinh tố protein + hạnh nhân", calories: 200, protein: 15, carbs: 20, fat: 8 },
            { name: "Tối: Cá hồi + salad + bông cải xanh", calories: 400, protein: 30, carbs: 25, fat: 18 }
          ];
        } else if (goalType === "gain") {
          baseMeals = [
            { name: "Sáng: Bánh mì + trứng + bơ + sữa", calories: 550, protein: 25, carbs: 60, fat: 20 },
            { name: "Trưa: Cơm trắng + thịt bò + rau + dầu oliu", calories: 700, protein: 40, carbs: 75, fat: 22 },
            { name: "Chiều: Sữa chua Hy Lạp + chuối + yến mạch + mật ong", calories: 400, protein: 20, carbs: 55, fat: 12 },
            { name: "Tối: Gà + khoai lang + rau + hạt", calories: 650, protein: 45, carbs: 65, fat: 18 }
          ];
        } else {
          baseMeals = [
            { name: "Sáng: Yến mạch + hoa quả + sữa hạt", calories: 400, protein: 15, carbs: 55, fat: 12 },
            { name: "Trưa: Cơm + thịt/cá + rau + dầu ăn", calories: 550, protein: 30, carbs: 60, fat: 15 },
            { name: "Chiều: Sữa chua + hạt dinh dưỡng", calories: 250, protein: 12, carbs: 25, fat: 10 },
            { name: "Tối: Salad + thịt nạc + quinoa", calories: 450, protein: 28, carbs: 40, fat: 14 }
          ];
        }

        // Adjust based on dietary preferences
        if (dietaryPreference === "vegetarian" || dietaryPreference === "vegan") {
          baseMeals = baseMeals.map(meal => ({
            ...meal,
            name: meal.name
              .replace(/thịt bò|thịt nạc|gà|ức gà|cá hồi/gi, "đậu phụ/tempeh")
              .replace(/trứng/gi, "đậu phụ")
          }));
        }

        if (dietaryPreference === "low-carb" || dietaryPreference === "keto") {
          baseMeals = baseMeals.map(meal => ({
            ...meal,
            name: meal.name.replace(/cơm|bánh mì|khoai lang|yến mạch/gi, "rau củ ít tinh bột"),
            carbs: Math.floor(meal.carbs * 0.3),
            fat: meal.fat + Math.floor(meal.carbs * 0.5)
          }));
        }

        mealsByDay[day] = baseMeals;
      });

      return mealsByDay;
    };

    setResult({
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      schedule: schedules[goalType],
      meals: getMealsByDay()
    });

    toast.success("Đã tạo kế hoạch tập luyện và dinh dưỡng cho bạn!");
  };

  const handleSavePlan = () => {
    if (!result) return;
    
    const planData = {
      personalInfo: {
        weight,
        height,
        goal,
        dietaryPreference,
        excludedFoods,
        healthConditions,
      },
      bmiResult: {
        bmi: result.bmi,
        category: result.category,
      },
      workoutDescription,
      schedule: result.schedule,
      meals: result.meals,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem("savedWorkoutPlan", JSON.stringify(planData));
    toast.success("Đã lưu kế hoạch tập luyện thành công!");
  };

  const handleEditMeal = (day: WeekDay, index: number) => {
    navigate("/nutrition");
    toast.info("Sử dụng tính năng Nutrition Research để tìm món ăn thay thế");
  };

  const handleDeleteMeal = (day: WeekDay, index: number) => {
    if (!result) return;
    const updatedMeals = { ...result.meals };
    updatedMeals[day] = updatedMeals[day].filter((_, i) => i !== index);
    setResult({ ...result, meals: updatedMeals });
    toast.success("Đã xóa món ăn");
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30 shadow-[var(--shadow-elegant)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Tính BMI & Kế Hoạch</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Cân nặng (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height">Chiều cao (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="goal">Mục tiêu</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ví dụ: Giảm cân, tăng cơ, duy trì sức khỏe..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dietary">Nhu cầu ăn uống</Label>
            <Select value={dietaryPreference} onValueChange={(value) => setDietaryPreference(value as DietaryPreference)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có</SelectItem>
                <SelectItem value="low-carb">Low-carb</SelectItem>
                <SelectItem value="vegetarian">Ăn chay</SelectItem>
                <SelectItem value="vegan">Ăn thuần chay</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="excludedFoods">Không sử dụng các loại thực phẩm</Label>
          <Textarea
            id="excludedFoods"
            value={excludedFoods}
            onChange={(e) => setExcludedFoods(e.target.value)}
            placeholder="Ví dụ: Thịt bò, hải sản, sữa, các loại đậu..."
            className="mt-1 min-h-[60px]"
          />
        </div>

        <div>
          <Label htmlFor="health">Tình trạng sức khỏe</Label>
          <Textarea
            id="health"
            value={healthConditions}
            onChange={(e) => setHealthConditions(e.target.value)}
            placeholder="Ví dụ: Tiểu đường, huyết áp cao, vấn đề tim mạch..."
            className="mt-1 min-h-[60px]"
          />
        </div>
      </div>

      <Button 
        onClick={calculateBMI} 
        className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
      >
        Tính toán & Lập kế hoạch
      </Button>

      {result && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-500">
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary-glow/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Chỉ số BMI của bạn</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {result.bmi}
            </p>
            <p className="text-sm font-medium text-foreground">{result.category}</p>
          </div>

          <div>
            <Label htmlFor="workoutDesc">Mô tả kế hoạch tập luyện</Label>
            <Textarea
              id="workoutDesc"
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết về kế hoạch tập luyện của bạn..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule">
                <Target className="w-4 h-4 mr-2" />
                Lịch tập
              </TabsTrigger>
              <TabsTrigger value="meals">
                <Utensils className="w-4 h-4 mr-2" />
                Thực đơn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-3 mt-4">
              <Accordion type="single" collapsible className="w-full">
                {result.schedule.map((day, dayIdx) => (
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
                          <div key={exIdx} className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
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
            </TabsContent>

            <TabsContent value="meals" className="space-y-3 mt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <Label htmlFor="daySelect" className="text-sm text-muted-foreground">Chọn ngày trong tuần</Label>
                  <Select value={selectedDay} onValueChange={(value) => setSelectedDay(value as WeekDay)}>
                    <SelectTrigger id="daySelect" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Thứ 2">Thứ 2</SelectItem>
                      <SelectItem value="Thứ 3">Thứ 3</SelectItem>
                      <SelectItem value="Thứ 4">Thứ 4</SelectItem>
                      <SelectItem value="Thứ 5">Thứ 5</SelectItem>
                      <SelectItem value="Thứ 6">Thứ 6</SelectItem>
                      <SelectItem value="Thứ 7">Thứ 7</SelectItem>
                      <SelectItem value="Chủ nhật">Chủ nhật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate("/nutrition")}
                  className="gap-2 ml-4 mt-6"
                >
                  <ExternalLink className="w-4 h-4" />
                  Nutrition Research
                </Button>
              </div>
              
              {result.meals[selectedDay]?.map((meal, idx) => (
                <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-foreground flex-1">{meal.name}</p>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditMeal(selectedDay, idx)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMeal(selectedDay, idx)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                      {meal.calories} kcal
                    </span>
                    <span>Protein: {meal.protein}g</span>
                    <span>Carbs: {meal.carbs}g</span>
                    <span>Fat: {meal.fat}g</span>
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-foreground">
                    Tổng dinh dưỡng {selectedDay}
                  </p>
                  <span className="text-lg font-bold text-secondary">
                    {result.meals[selectedDay]?.reduce((sum, meal) => sum + meal.calories, 0) || 0} kcal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                  <div>Protein: {result.meals[selectedDay]?.reduce((sum, m) => sum + m.protein, 0) || 0}g</div>
                  <div>Carbs: {result.meals[selectedDay]?.reduce((sum, m) => sum + m.carbs, 0) || 0}g</div>
                  <div>Fat: {result.meals[selectedDay]?.reduce((sum, m) => sum + m.fat, 0) || 0}g</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleSavePlan}
            className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90 transition-opacity"
          >
            Lưu kế hoạch
          </Button>
        </div>
      )}
    </Card>
  );
};
