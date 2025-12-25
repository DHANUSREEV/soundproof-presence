import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressFormData } from "@/lib/constants";

interface SoundRecordingScreenProps {
  addressData: AddressFormData;
  onVerify: () => void;
  onBack: () => void;
}

export function SoundRecordingScreen({ 
  addressData, 
  onVerify, 
  onBack 
}: SoundRecordingScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [soundLevel, setSoundLevel] = useState<"ok" | "quiet" | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0.1));
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const simulateAudioLevels = useCallback(() => {
    if (!isRecording) return;
    
    setAudioLevels(prev => 
      prev.map(() => 0.1 + Math.random() * 0.9)
    );
    
    animationRef.current = requestAnimationFrame(simulateAudioLevels);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      animationRef.current = requestAnimationFrame(simulateAudioLevels);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevels(Array(20).fill(0.1));
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, simulateAudioLevels]);

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecording(true);
      // Simulate sound level detection
      setSoundLevel(Math.random() > 0.3 ? "ok" : "quiet");
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      setSoundLevel(null);
    }
  };

  const handleReRecord = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setSoundLevel(null);
    setIsRecording(false);
  };

  const canVerify = hasRecording && recordingTime >= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Record Sound at Your Location
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Record 20–30 seconds where you are. Mention nearby road, shop, or landmark if possible.
        </p>
      </div>

      <div className="elevated-card rounded-2xl p-6 space-y-6">
        {/* Waveform Visualization */}
        <div className="flex items-center justify-center gap-1 h-24 bg-muted/50 rounded-xl px-4">
          {audioLevels.map((level, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{ 
                height: `${level * 100}%`,
                backgroundColor: isRecording 
                  ? "hsl(var(--destructive))" 
                  : hasRecording 
                  ? "hsl(var(--success))" 
                  : "hsl(var(--muted-foreground))"
              }}
              transition={{ duration: 0.1 }}
              className="w-1.5 rounded-full"
              style={{ minHeight: "8px" }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center">
          <span className="text-4xl font-semibold tabular-nums text-foreground">
            {formatTime(recordingTime)}
          </span>
          {recordingTime > 0 && recordingTime < 10 && !isRecording && (
            <p className="text-xs text-warning mt-1">
              Minimum 10 seconds required
            </p>
          )}
        </div>

        {/* Record Button */}
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRecordToggle}
            className={`
              w-24 h-24 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-medium
              ${isRecording 
                ? "bg-destructive animate-pulse-ring" 
                : "bg-primary hover:bg-primary/90"
              }
            `}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-destructive-foreground fill-current" />
            ) : (
              <Mic className="w-10 h-10 text-primary-foreground" />
            )}
          </motion.button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isRecording ? "Tap to stop recording" : hasRecording ? "Recording complete" : "Tap to start recording"}
        </p>

        {/* Sound Level Status */}
        <AnimatePresence>
          {soundLevel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                ${soundLevel === "ok" 
                  ? "bg-success-soft text-success" 
                  : "bg-warning-soft text-warning"
                }
              `}
            >
              {soundLevel === "ok" ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Sound level OK</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="text-sm font-medium">Too quiet — home mode will be used</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 gap-2"
          onClick={handleReRecord}
          disabled={isRecording}
        >
          <RotateCcw className="w-4 h-4" />
          Re-record
        </Button>
        <Button 
          size="lg" 
          className="flex-1 gap-2"
          onClick={onVerify}
          disabled={!canVerify || isRecording}
        >
          Verify Address
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
