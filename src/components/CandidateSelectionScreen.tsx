import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, MapPin, Check, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressFormData, VerificationResult, TAMIL_NADU_CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CandidateSelectionScreenProps {
  addressData: AddressFormData;
  result: VerificationResult;
  onSelect: (index: number, address: string) => void;
  onBack: () => void;
}

export function CandidateSelectionScreen({
  addressData,
  result,
  onSelect,
  onBack,
}: CandidateSelectionScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const cityLabel = TAMIL_NADU_CITIES.find(c => c.value === addressData.city)?.label || addressData.city;

  const candidates = result.candidates || [
    { address: addressData.fullAddress, confidence: result.confidence },
    { address: `${addressData.fullAddress}, Near ${addressData.landmarkText || "Main Road"}`, confidence: result.confidence - 0.05 },
    { address: `${cityLabel} - ${addressData.pincode || "600001"}`, confidence: result.confidence - 0.10 },
    { address: `${addressData.landmarkText || "Local Area"}, ${cityLabel}`, confidence: result.confidence - 0.15 },
  ];

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onSelect(selectedIndex, candidates[selectedIndex].address);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning-soft"
        >
          <HelpCircle className="w-9 h-9 text-warning" />
        </motion.div>
        
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            Select Your Address
          </h1>
          <p className="text-muted-foreground text-sm">
            We found {candidates.length} possible matches. Please confirm.
          </p>
        </div>
      </div>

      {/* Confidence indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(result.confidence * 100)}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full bg-warning rounded-full"
          />
        </div>
        <span>{Math.round(result.confidence * 100)}% match confidence</span>
      </div>

      {/* Candidate list - OTP style */}
      <div className="space-y-2.5">
        {candidates.map((candidate, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08 }}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-accent/50",
              selectedIndex === index
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Number indicator */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-colors",
                  selectedIndex === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {selectedIndex === index ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Address content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  selectedIndex === index ? "text-foreground" : "text-foreground/80"
                )}>
                  {candidate.address}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(candidate.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              
              {/* Arrow */}
              <ChevronRight className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                selectedIndex === index ? "text-primary" : "text-muted-foreground/50"
              )} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Scene info */}
      {result.sceneType && (
        <div className="text-center text-xs text-muted-foreground">
          Detected scene: <span className="font-medium capitalize">{result.sceneType}</span>
          {result.characteristicSounds && result.characteristicSounds.length > 0 && (
            <span> • Sounds: {result.characteristicSounds.slice(0, 2).join(", ")}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          size="xl"
          className="w-full gap-2"
          onClick={handleConfirm}
          disabled={selectedIndex === null}
        >
          <Check className="w-5 h-5" />
          Confirm Selection
        </Button>
        
        <Button
          size="lg"
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Record Again
        </Button>
      </div>
    </motion.div>
  );
}
