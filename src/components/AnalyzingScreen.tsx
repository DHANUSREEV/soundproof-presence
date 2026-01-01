import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music, MapPin, Search, CheckCircle, Navigation, Clock, Building } from "lucide-react";
import { AddressFormData, TAMIL_NADU_CITIES, LANDMARK_CATEGORIES, LANDMARK_ACTIVE_TIMES } from "@/lib/constants";

interface AnalyzingScreenProps {
  addressData: AddressFormData;
}

export function AnalyzingScreen({ addressData }: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [sceneConfidence, setSceneConfidence] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<"checking" | "found" | "unavailable">("checking");

  const cityLabel = TAMIL_NADU_CITIES.find(c => c.value === addressData.city)?.label || addressData.city;
  const landmarkInfo = LANDMARK_CATEGORIES.find(l => l.value === addressData.landmarkCategory);
  
  // Check if current time is within active hours
  const currentHour = new Date().getHours();
  const activeWindows = addressData.landmarkCategory 
    ? LANDMARK_ACTIVE_TIMES[addressData.landmarkCategory as keyof typeof LANDMARK_ACTIVE_TIMES] 
    : [];
  const isActiveTime = activeWindows?.some(w => currentHour >= w.start && currentHour < w.end) ?? true;

  const ANALYSIS_STEPS = [
    { icon: Music, text: "Analyzing ambient sounds...", detail: "Detecting patterns" },
    { icon: Building, text: `Matching ${landmarkInfo?.label.split("/")[0] || "landmark"}...`, detail: `Scene confidence: ${sceneConfidence}%` },
    { icon: Navigation, text: "Verifying location...", detail: gpsStatus === "found" ? "GPS: ✓ <100m" : "GPS: checking..." },
    { icon: CheckCircle, text: "Generating DIGIPIN...", detail: "Finalizing" },
  ];

  useEffect(() => {
    // Simulate progressive analysis
    const timers = [
      setTimeout(() => setCurrentStep(1), 800),
      setTimeout(() => {
        setSceneConfidence(Math.floor(75 + Math.random() * 20));
        setCurrentStep(2);
      }, 2000),
      setTimeout(() => {
        setGpsStatus(Math.random() > 0.2 ? "found" : "unavailable");
        setCurrentStep(3);
      }, 3200),
      setTimeout(() => setCurrentStep(4), 4200),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 items-center"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Analyzing Sound
        </h1>
        <p className="text-muted-foreground text-sm">
          Processing audio from {cityLabel}
        </p>
      </div>

      {/* Time indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isActiveTime ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
      }`}>
        <Clock className="w-3.5 h-3.5" />
        {isActiveTime ? "Active hours for this landmark" : "Outside peak hours - using GPS fallback"}
      </div>

      <div className="elevated-card rounded-2xl p-6 w-full space-y-5">
        {/* Animated Sound Wave */}
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-14 h-14 rounded-full bg-primary/40 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
              >
                <Music className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-accent/50 rounded-lg p-2.5">
            <Music className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-xs font-medium text-foreground">Scene</p>
            <p className="text-[10px] text-muted-foreground">
              {currentStep >= 2 ? `${sceneConfidence}%` : "..."}
            </p>
          </div>
          <div className="bg-accent/50 rounded-lg p-2.5">
            <Navigation className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-xs font-medium text-foreground">GPS</p>
            <p className="text-[10px] text-muted-foreground">
              {gpsStatus === "found" ? "✓ <100m" : gpsStatus === "unavailable" ? "—" : "..."}
            </p>
          </div>
          <div className="bg-accent/50 rounded-lg p-2.5">
            <Building className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-xs font-medium text-foreground">Landmark</p>
            <p className="text-[10px] text-muted-foreground">
              {landmarkInfo?.icon || "🏠"}
            </p>
          </div>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-2">
          {ANALYSIS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index < currentStep;
            const isCurrent = index === currentStep - 1;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: isActive || isCurrent ? 1 : 0.4 }}
                className={`
                  flex items-center gap-3 py-2 px-3 rounded-lg transition-colors
                  ${isCurrent ? "bg-primary/10" : ""}
                `}
              >
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0 }}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.text}
                  </span>
                </div>
                {isActive && !isCurrent && (
                  <span className="text-success text-sm">✓</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / ANALYSIS_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
