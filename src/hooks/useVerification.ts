import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddressFormData, VerificationResult } from "@/lib/constants";

interface VerifyAddressResponse {
  status: "verified" | "candidates" | "retry";
  verified: boolean;
  digipin: string | null;
  verifiedAddress?: string;
  formattedAddress?: string;
  candidates?: { address: string; confidence: number }[];
  primaryAddress?: string;
  city: string;
  confidence: number;
  matchType: string;
  sceneType: string;
  characteristicSounds?: string[];
  validationToken: string;
  processingTimeMs: number;
  reason?: string;
  verificationMethod?: "sound" | "location" | "manual";
  isActiveTime?: boolean;
}

interface UseVerificationReturn {
  isVerifying: boolean;
  error: string | null;
  verifyAddress: (
    addressData: AddressFormData,
    audioBase64: string | null
  ) => Promise<VerificationResult | null>;
}

export function useVerification(): UseVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAddress = useCallback(
    async (
      addressData: AddressFormData,
      audioBase64: string | null
    ): Promise<VerificationResult | null> => {
      setIsVerifying(true);
      setError(null);

      try {
        console.log("[useVerification] Calling verify-address with landmark:", addressData.landmarkCategory);
        
        // Get current local hour for time-aware verification
        const localHour = new Date().getHours();
        
        const { data, error: fnError } = await supabase.functions.invoke<VerifyAddressResponse>(
          "verify-address",
          {
            body: {
              rawAddress: addressData.fullAddress,
              city: addressData.city,
              pincode: addressData.pincode || null,
              landmarkText: addressData.landmarkText || null,
              landmarkCategory: addressData.landmarkCategory || "residential",
              audioBase64: audioBase64,
              localTime: localHour,
              sessionId: `session_${Date.now()}`,
            },
          }
        );

        if (fnError) {
          console.error("[useVerification] Function error:", fnError);
          throw new Error(fnError.message || "Verification failed");
        }

        if (!data) {
          throw new Error("No response from verification service");
        }

        console.log("[useVerification] Response:", data.status, data.confidence, data.verificationMethod);

        // Convert API response to VerificationResult
        const result: VerificationResult = {
          verified: data.verified,
          confidence: data.confidence,
          digipin: data.digipin || undefined,
          formattedAddress: data.formattedAddress || data.verifiedAddress || data.primaryAddress,
          city: data.city,
          reason: data.reason,
          matchType: data.matchType,
          sceneType: data.sceneType,
          verificationMethod: data.verificationMethod,
          characteristicSounds: data.characteristicSounds,
          candidates: data.candidates,
        };

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Verification failed";
        console.error("[useVerification] Error:", errorMessage);
        setError(errorMessage);
        return null;
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  return {
    isVerifying,
    error,
    verifyAddress,
  };
}
