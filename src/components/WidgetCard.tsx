import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  onRemove?: () => void;
  onExpand?: () => void;
  isDraggable?: boolean;
  icon?: ReactNode;
}

export const WidgetCard = ({ 
  title, 
  children, 
  className, 
  onRemove, 
  onExpand,
  isDraggable = false,
  icon
}: WidgetCardProps) => {
  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200 group", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          {isDraggable && (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          {icon && <div className="text-primary">{icon}</div>}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onExpand && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onExpand}>
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
