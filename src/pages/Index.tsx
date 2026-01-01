import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StepIndicator } from "@/components/StepIndicator";
import { AddressEntryScreen } from "@/components/AddressEntryScreen";
import { SoundRecordingScreen } from "@/components/SoundRecordingScreen";
import { VerificationResultScreen } from "@/components/VerificationResultScreen";
import { AnalyzingScreen } from "@/components/AnalyzingScreen";
import { CandidateSelectionScreen } from "@/components/CandidateSelectionScreen";
import { AddressFormData, VerificationResult } from "@/lib/constants";
import { useVerification } from "@/hooks/useVerification";
import { toast } from "sonner";

type Screen = "address" | "recording" | "analyzing" | "candidates" | "result";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("address");
  const [addressData, setAddressData] = useState<AddressFormData | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  const { verifyAddress } = useVerification();

  const getStepNumber = () => {
    switch (currentScreen) {
      case "address": return 1;
      case "recording": return 2;
      case "analyzing": return 3;
      case "candidates": return 3;
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
      
      // Decision logic based on confidence
      if (result.verified && result.confidence >= 0.85) {
        // High confidence - directly verified
        setCurrentScreen("result");
      } else if (result.candidates && result.candidates.length > 0 && result.confidence >= 0.70) {
        // Medium confidence - show candidates for OTP-style selection
        setCurrentScreen("candidates");
      } else {
        // Low confidence - show failure
        setCurrentScreen("result");
      }
    } else {
      toast.error("Verification failed. Please try again.");
      setCurrentScreen("recording");
    }
  };

  const handleCandidateSelect = (index: number, address: string) => {
    if (!verificationResult) return;
    
    // Mark as confirmed with selected address
    setVerificationResult({
      ...verificationResult,
      verified: true,
      formattedAddress: address,
      verificationMethod: "manual",
      confidence: verificationResult.candidates?.[index]?.confidence || verificationResult.confidence,
    });
    setCurrentScreen("result");
    toast.success("Address confirmed successfully!");
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
            
            {currentScreen === "candidates" && addressData && verificationResult && (
              <CandidateSelectionScreen
                key="candidates"
                addressData={addressData}
                result={verificationResult}
                onSelect={handleCandidateSelect}
                onBack={handleRetry}
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