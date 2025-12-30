import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, ArrowRight, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressFormData } from "@/lib/constants";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface SoundRecordingScreenProps {
  addressData: AddressFormData;
  onVerify: (audioBase64: string | null) => void;
  onBack: () => void;
}

export function SoundRecordingScreen({ 
  addressData, 
  onVerify, 
  onBack 
}: SoundRecordingScreenProps) {
  const {
    isRecording,
    recordingTime,
    hasRecording,
    audioBase64,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine sound level based on audio levels
  const averageLevel = audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length;
  const soundLevel = hasRecording 
    ? (averageLevel > 0.2 ? "ok" : "quiet")
    : null;

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleReRecord = () => {
    resetRecording();
  };

  const handleVerify = () => {
    onVerify(audioBase64);
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
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
          {isRecording && recordingTime >= 20 && (
            <p className="text-xs text-success mt-1">
              Good recording length! You can stop now.
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
          {soundLevel && !isRecording && (
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
          onClick={handleVerify}
          disabled={!canVerify || isRecording}
        >
          Verify Address
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
