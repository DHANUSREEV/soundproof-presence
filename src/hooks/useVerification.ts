import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddressFormData, VerificationResult } from "@/lib/constants";

interface VerificationCandidate {
  address: string;
  confidence: number;
}

interface VerifyAddressResponse {
  status: "verified" | "candidates";
  verified: boolean;
  digipin: string;
  verifiedAddress?: string;
  candidates?: VerificationCandidate[];
  primaryAddress?: string;
  city: string;
  confidence: number;
  matchType: string;
  sceneType: string;
  characteristicSounds: string[];
  validationToken: string;
  processingTimeMs: number;
  reason?: string;
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
        console.log("[useVerification] Calling verify-address function...");
        
        const { data, error: fnError } = await supabase.functions.invoke<VerifyAddressResponse>(
          "verify-address",
          {
            body: {
              rawAddress: addressData.fullAddress,
              city: addressData.city,
              pincode: addressData.pincode || null,
              audioBase64: audioBase64,
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

        console.log("[useVerification] Response:", data);

        // Convert API response to VerificationResult
        const result: VerificationResult = {
          verified: data.verified,
          confidence: data.confidence,
          digipin: data.digipin,
          formattedAddress: data.verifiedAddress || data.primaryAddress,
          city: data.city,
          reason: data.reason,
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
