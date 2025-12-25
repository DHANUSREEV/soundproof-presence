import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, ShieldCheck, MapPin, Hash, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressFormData, VerificationResult, TAMIL_NADU_CITIES } from "@/lib/constants";

interface VerificationResultScreenProps {
  addressData: AddressFormData;
  result: VerificationResult;
  onRetry: () => void;
  onFinish: () => void;
}

export function VerificationResultScreen({
  addressData,
  result,
  onRetry,
  onFinish,
}: VerificationResultScreenProps) {
  const cityLabel = TAMIL_NADU_CITIES.find(c => c.value === addressData.city)?.label || addressData.city;

  if (result.verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-6"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-soft"
          >
            <CheckCircle2 className="w-12 h-12 text-success" />
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              Address Verified Successfully
            </h1>
            <p className="text-muted-foreground text-sm">
              Your presence at this location has been confirmed
            </p>
          </div>
        </div>

        <div className="elevated-card rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Verified Address
              </p>
              <p className="text-sm text-foreground mt-1">
                {addressData.fullAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                City
              </p>
              <p className="text-sm text-foreground mt-1">
                {cityLabel}
                {addressData.pincode && ` - ${addressData.pincode}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                DIGIPIN ID
              </p>
              <p className="text-sm font-mono text-foreground mt-1">
                {result.digipin || "TN-CHN-4891-7823"}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-soft text-success text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified by Sound
            </div>
          </div>
        </div>

        <Button size="xl" variant="success" className="w-full" onClick={onFinish}>
          Finish
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive-soft"
        >
          <XCircle className="w-12 h-12 text-destructive" />
        </motion.div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Unable to Verify Address
          </h1>
          <p className="text-muted-foreground text-sm">
            {result.reason || "Sound did not match location"}
          </p>
        </div>
      </div>

      <div className="elevated-card rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-destructive-soft">
            <XCircle className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Possible reasons:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Sound did not match expected location</li>
              <li>• Environment was too quiet</li>
              <li>• Recording quality was insufficient</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="xl" className="w-full gap-2" onClick={onRetry}>
          <RotateCcw className="w-5 h-5" />
          Try Recording Again
        </Button>
        <Button size="lg" variant="outline" className="w-full gap-2">
          <ArrowLeft className="w-4 h-4" />
          Use Alternate Verification
        </Button>
      </div>
    </motion.div>
  );
}
