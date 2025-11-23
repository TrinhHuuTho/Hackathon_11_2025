import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  borderColor?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  borderColor = "border-gray-100",
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case "neutral":
        return <Minus className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card
      className={cn("border-2 transition-shadow hover:shadow-lg", borderColor)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {icon}
          {trend && getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        {trendValue && (
          <p className={cn("text-xs font-medium", getTrendColor())}>
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
