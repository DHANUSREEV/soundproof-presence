import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music, MapPin, Search, CheckCircle } from "lucide-react";
import { AddressFormData, TAMIL_NADU_CITIES } from "@/lib/constants";

interface AnalyzingScreenProps {
  addressData: AddressFormData;
}

const ANALYSIS_STEPS = [
  { icon: Music, text: "Analyzing ambient sounds...", delay: 0 },
  { icon: MapPin, text: "Matching city audio profile...", delay: 1.5 },
  { icon: Search, text: "Verifying location signature...", delay: 3 },
  { icon: CheckCircle, text: "Generating DIGIPIN...", delay: 4.5 },
];

export function AnalyzingScreen({ addressData }: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const cityLabel = TAMIL_NADU_CITIES.find(c => c.value === addressData.city)?.label || addressData.city;

  useEffect(() => {
    const timers = ANALYSIS_STEPS.map((step, index) =>
      setTimeout(() => setCurrentStep(index), step.delay * 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 items-center"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Analyzing Sound
        </h1>
        <p className="text-muted-foreground text-sm">
          Processing audio from {cityLabel}
        </p>
      </div>

      <div className="elevated-card rounded-2xl p-8 w-full space-y-6">
        {/* Animated Sound Wave */}
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
              >
                <Music className="w-5 h-5 text-primary-foreground" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.4, 
                  x: 0 
                }}
                transition={{ delay: step.delay, duration: 0.3 }}
                className={`
                  flex items-center gap-3 py-2 px-3 rounded-lg transition-colors
                  ${isCurrent ? "bg-primary/10" : ""}
                `}
              >
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </motion.div>
                <span className={`text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.text}
                </span>
                {index < currentStep && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-success"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
