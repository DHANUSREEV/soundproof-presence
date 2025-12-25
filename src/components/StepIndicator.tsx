import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          VibeTrace
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: currentStep === index + 1 ? 1.2 : 1,
                backgroundColor: 
                  index + 1 < currentStep 
                    ? "hsl(var(--success))" 
                    : index + 1 === currentStep 
                    ? "hsl(var(--primary))" 
                    : "hsl(var(--muted))",
              }}
              transition={{ duration: 0.2 }}
              className="w-2.5 h-2.5 rounded-full"
            />
            {index < totalSteps - 1 && (
              <div 
                className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                  index + 1 < currentStep ? "bg-success" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
