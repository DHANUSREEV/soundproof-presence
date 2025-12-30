import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StepIndicator } from "@/components/StepIndicator";
import { AddressEntryScreen } from "@/components/AddressEntryScreen";
import { SoundRecordingScreen } from "@/components/SoundRecordingScreen";
import { VerificationResultScreen } from "@/components/VerificationResultScreen";
import { AnalyzingScreen } from "@/components/AnalyzingScreen";
import { AddressFormData, VerificationResult } from "@/lib/constants";
import { useVerification } from "@/hooks/useVerification";
import { toast } from "sonner";

type Screen = "address" | "recording" | "analyzing" | "result";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("address");
  const [addressData, setAddressData] = useState<AddressFormData | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  const { isVerifying, verifyAddress } = useVerification();

  const getStepNumber = () => {
    switch (currentScreen) {
      case "address": return 1;
      case "recording": return 2;
      case "analyzing": return 3;
      case "result": return 3;
      default: return 1;
    }
  };

  const handleAddressContinue = (data: AddressFormData) => {
    setAddressData(data);
    setCurrentScreen("recording");
  };

  const handleVerify = async (audioBase64: string | null) => {
    if (!addressData) return;
    
    setCurrentScreen("analyzing");
    
    const result = await verifyAddress(addressData, audioBase64);
    
    if (result) {
      setVerificationResult(result);
      setCurrentScreen("result");
    } else {
      toast.error("Verification failed. Please try again.");
      setCurrentScreen("recording");
    }
  };

  const handleRetry = () => {
    setVerificationResult(null);
    setCurrentScreen("recording");
  };

  const handleFinish = () => {
    setAddressData(null);
    setVerificationResult(null);
    setCurrentScreen("address");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-8">
        <StepIndicator currentStep={getStepNumber()} totalSteps={3} />
        
        <div className="flex-1 flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            {currentScreen === "address" && (
              <AddressEntryScreen 
                key="address"
                onContinue={handleAddressContinue} 
              />
            )}
            
            {currentScreen === "recording" && addressData && (
              <SoundRecordingScreen
                key="recording"
                addressData={addressData}
                onVerify={handleVerify}
                onBack={() => setCurrentScreen("address")}
              />
            )}
            
            {currentScreen === "analyzing" && addressData && (
              <AnalyzingScreen
                key="analyzing"
                addressData={addressData}
              />
            )}
            
            {currentScreen === "result" && addressData && verificationResult && (
              <VerificationResultScreen
                key="result"
                addressData={addressData}
                result={verificationResult}
                onRetry={handleRetry}
                onFinish={handleFinish}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;
