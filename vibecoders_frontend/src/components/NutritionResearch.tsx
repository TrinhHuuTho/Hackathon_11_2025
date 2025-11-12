import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MealSuggestion {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const NutritionResearch = () => {
  const [image, setImage] = useState<string | null>("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400");
  const [researchText, setResearchText] = useState("Salad rau củ với ức gà");
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([
    {
      name: "Salad Ức Gà Nướng",
      ingredients: ["Ức gà", "Xà lách", "Cà chua", "Dưa chuột", "Dầu olive"],
      calories: 350,
      protein: 35,
      carbs: 15,
      fat: 18
    },
    {
      name: "Cơm Gạo Lứt Gà",
      ingredients: ["Gạo lứt", "Ức gà luộc", "Bông cải xanh"],
      calories: 420,
      protein: 32,
      carbs: 45,
      fat: 8
    }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        toast({
          title: "Đã tải ảnh",
          description: "Nhấn 'Phân tích' để nhận gợi ý món ăn",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = () => {
    // Simulate AI analysis
    const mockSuggestions: MealSuggestion[] = [
      {
        name: "Salad Ức Gà Quinoa",
        ingredients: ["Ức gà", "Quinoa", "Cà chua bi", "Dưa leo", "Dầu olive"],
        calories: 420,
        protein: 35,
        carbs: 38,
        fat: 12
      },
      {
        name: "Cơm Gạo Lứt Cá Hồi",
        ingredients: ["Cá hồi", "Gạo lứt", "Bông cải xanh", "Cà rốt"],
        calories: 520,
        protein: 32,
        carbs: 48,
        fat: 18
      },
      {
        name: "Smoothie Bowl Protein",
        ingredients: ["Chuối", "Whey protein", "Yến mạch", "Quả mọng", "Hạnh nhân"],
        calories: 380,
        protein: 28,
        carbs: 42,
        fat: 10
      }
    ];

    setSuggestions(mockSuggestions);
    toast({
      title: "Phân tích hoàn tất",
      description: `Đã tạo ${mockSuggestions.length} gợi ý món ăn`,
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30 shadow-[var(--shadow-elegant)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Nghiên Cứu Dinh Dưỡng</h2>
      </div>

      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="image">
            <ImagePlus className="w-4 h-4 mr-2" />
            Tải ảnh
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="w-4 h-4 mr-2" />
            Nhập text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="space-y-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors">
            {image ? (
              <img src={image} alt="Food" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ImagePlus className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Tải ảnh thực phẩm hoặc nghiên cứu</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Chọn ảnh
          </Button>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Textarea
            value={researchText}
            onChange={(e) => setResearchText(e.target.value)}
            placeholder="Nhập thông tin nghiên cứu dinh dưỡng, thành phần, hoặc yêu cầu đặc biệt..."
            className="min-h-[200px]"
          />
        </TabsContent>
      </Tabs>

      <Button
        onClick={analyzeMeal}
        className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
        disabled={!image && !researchText}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Phân tích & Gợi ý món ăn
      </Button>

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-500">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gợi ý món ăn phù hợp
          </h3>
          {suggestions.map((meal, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border hover:border-primary/50 transition-colors"
            >
              <h4 className="font-semibold text-foreground mb-2">{meal.name}</h4>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {meal.ingredients.map((ingredient, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Calo</p>
                  <p className="text-sm font-semibold text-secondary">{meal.calories}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-sm font-semibold text-foreground">{meal.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-sm font-semibold text-foreground">{meal.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="text-sm font-semibold text-foreground">{meal.fat}g</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
