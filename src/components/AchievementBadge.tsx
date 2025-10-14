import { Award, TrendingUp, Zap, Target, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  type: "efficient_reordering" | "accurate_forecasting" | "supplier_excellence" | "inventory_master" | "quick_response" | "perfect_delivery";
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const achievementConfig = {
  efficient_reordering: {
    icon: Target,
    label: "Efficient Reordering",
    description: "Maintained optimal stock levels",
    color: "text-blue-500"
  },
  accurate_forecasting: {
    icon: TrendingUp,
    label: "Accurate Forecasting",
    description: "AI predictions within 5% accuracy",
    color: "text-purple-500"
  },
  supplier_excellence: {
    icon: Award,
    label: "Supplier Excellence",
    description: "Managed high-rated suppliers",
    color: "text-amber-500"
  },
  inventory_master: {
    icon: Trophy,
    label: "Inventory Master",
    description: "Zero stockouts for 30 days",
    color: "text-emerald-500"
  },
  quick_response: {
    icon: Zap,
    label: "Quick Response",
    description: "Resolved alerts within 24h",
    color: "text-orange-500"
  },
  perfect_delivery: {
    icon: Star,
    label: "Perfect Delivery",
    description: "100% on-time deliveries",
    color: "text-rose-500"
  }
};

export const AchievementBadge = ({ 
  type, 
  unlocked = false, 
  size = "md",
  showLabel = false 
}: AchievementBadgeProps) => {
  const config = achievementConfig[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };
  
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          sizeClasses[size],
          unlocked 
            ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary shadow-lg hover:scale-110 cursor-pointer" 
            : "bg-muted border-2 border-muted-foreground/20 grayscale opacity-50"
        )}
        title={unlocked ? config.description : "Locked"}
      >
        <Icon className={cn(iconSizes[size], unlocked ? config.color : "text-muted-foreground")} />
      </div>
      {showLabel && (
        <div className="text-center">
          <p className={cn("text-xs font-medium", unlocked ? "text-foreground" : "text-muted-foreground")}>
            {config.label}
          </p>
          {unlocked && (
            <p className="text-[10px] text-muted-foreground">{config.description}</p>
          )}
        </div>
      )}
    </div>
  );
};
