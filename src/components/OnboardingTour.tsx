import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  isActive: boolean;
}

export const OnboardingTour = ({ steps, onComplete, isActive }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const targetElement = document.querySelector(steps[currentStep].target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const pos = steps[currentStep].position || "bottom";
      
      let top = 0, left = 0;
      
      switch (pos) {
        case "bottom":
          top = rect.bottom + window.scrollY + 10;
          left = rect.left + window.scrollX;
          break;
        case "top":
          top = rect.top + window.scrollY - 150;
          left = rect.left + window.scrollX;
          break;
        case "right":
          top = rect.top + window.scrollY;
          left = rect.right + window.scrollX + 10;
          break;
        case "left":
          top = rect.top + window.scrollY;
          left = rect.left + window.scrollX - 310;
          break;
      }
      
      setPosition({ top, left });
      
      // Highlight target
      targetElement.classList.add("ring-2", "ring-primary", "ring-offset-2", "rounded-lg");
      
      return () => {
        targetElement.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-lg");
      };
    }
  }, [currentStep, isActive, steps]);

  if (!isActive || !steps[currentStep]) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onComplete} />
      <Card 
        className={cn(
          "fixed z-50 w-80 animate-scale-in",
          "shadow-2xl border-2 border-primary/20"
        )}
        style={{ top: position.top, left: position.left }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1" onClick={onComplete}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <h3 className="font-semibold mb-2">{steps[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{steps[currentStep].content}</p>
          
          <div className="flex items-center justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
