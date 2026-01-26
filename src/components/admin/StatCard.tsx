import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "gradient";
  gradientFrom?: string;
  gradientTo?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = "default",
  gradientFrom,
  gradientTo,
}: StatCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-md",
      variant === "gradient" && gradientFrom && gradientTo
        ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} border-transparent`
        : "bg-card/50 backdrop-blur-sm border-border/50 hover:border-border"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{displayValue}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs flex items-center gap-1 mt-1",
                  trend.positive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.positive ? "+" : ""}{trend.value}%
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            variant === "gradient" 
              ? "bg-white/10" 
              : "bg-primary/10"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              variant === "gradient" ? "text-foreground" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
