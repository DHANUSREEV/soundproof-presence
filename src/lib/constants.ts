export const TAMIL_NADU_CITIES = [
  { value: "chennai", label: "Chennai" },
  { value: "madurai", label: "Madurai" },
  { value: "coimbatore", label: "Coimbatore" },
  { value: "salem", label: "Salem" },
  { value: "trichy", label: "Tiruchirappalli (Trichy)" },
  { value: "tirunelveli", label: "Tirunelveli" },
  { value: "erode", label: "Erode" },
  { value: "vellore", label: "Vellore" },
  { value: "thoothukudi", label: "Thoothukudi" },
  { value: "thanjavur", label: "Thanjavur" },
  { value: "dindigul", label: "Dindigul" },
  { value: "kanchipuram", label: "Kanchipuram" },
  { value: "tiruppur", label: "Tiruppur" },
  { value: "nagercoil", label: "Nagercoil" },
  { value: "hosur", label: "Hosur" },
] as const;

export type CityValue = typeof TAMIL_NADU_CITIES[number]["value"];

export interface AddressFormData {
  fullAddress: string;
  city: CityValue | "";
  pincode: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence?: number;
  digipin?: string;
  formattedAddress?: string;
  city?: string;
  reason?: string;
}
