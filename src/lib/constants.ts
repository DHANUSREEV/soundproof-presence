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
  { value: "ooty", label: "Ooty (Udhagamandalam)" },
  { value: "kodaikanal", label: "Kodaikanal" },
  { value: "yercaud", label: "Yercaud" },
] as const;

export type CityValue = typeof TAMIL_NADU_CITIES[number]["value"];

// 12 Landmark categories as per Tamil Nadu patterns
export const LANDMARK_CATEGORIES = [
  { value: "temple", label: "Temple / Church / Mosque", icon: "🛕" },
  { value: "market", label: "Market / Bazaar / Commercial street", icon: "🏪" },
  { value: "main_road", label: "Main road / Junction / Traffic signal", icon: "🚦" },
  { value: "transport", label: "Bus stand / Auto stand / Railway station", icon: "🚌" },
  { value: "school", label: "School / College / Tuition centre", icon: "🏫" },
  { value: "hospital", label: "Hospital / Clinic / Pharmacy", icon: "🏥" },
  { value: "office", label: "Office / IT park / Government office", icon: "🏢" },
  { value: "factory", label: "Factory / Industrial area / Workshop", icon: "🏭" },
  { value: "beach", label: "Beach / Seashore / Riverfront", icon: "🏖️" },
  { value: "park", label: "Park / Playground / Open ground", icon: "🌳" },
  { value: "residential", label: "Residential street / Apartment", icon: "🏠" },
  { value: "hill_station", label: "Hill station / Ghat road", icon: "⛰️" },
] as const;

export type LandmarkCategory = typeof LANDMARK_CATEGORIES[number]["value"];

// Time windows when each landmark has meaningful sound (24h format)
export const LANDMARK_ACTIVE_TIMES: Record<LandmarkCategory, { start: number; end: number }[]> = {
  temple: [{ start: 5, end: 9 }, { start: 17, end: 21 }], // 5-9 AM, 5-9 PM
  market: [{ start: 8, end: 22 }], // 8 AM - 10 PM
  main_road: [{ start: 6, end: 23 }], // 6 AM - 11 PM
  transport: [{ start: 5, end: 23 }], // 5 AM - 11 PM
  school: [{ start: 8, end: 17 }], // 8 AM - 5 PM
  hospital: [{ start: 0, end: 24 }], // 24x7
  office: [{ start: 9, end: 20 }], // 9 AM - 8 PM
  factory: [{ start: 6, end: 22 }], // Shift-dependent
  beach: [{ start: 5, end: 10 }, { start: 16, end: 20 }], // Morning & evening
  park: [{ start: 5, end: 9 }, { start: 16, end: 20 }], // Morning walkers & evening
  residential: [{ start: 6, end: 22 }], // Day to late evening
  hill_station: [{ start: 6, end: 20 }], // Daylight hours
};

// Characteristic sounds for each landmark type
export const LANDMARK_SOUNDS: Record<LandmarkCategory, string[]> = {
  temple: ["bells", "chants", "nadaswaram", "mridangam", "conch", "devotional_music"],
  market: ["vendors", "bargaining", "horns", "crowd_speech", "metal_shutters", "two_wheelers"],
  main_road: ["traffic", "horns", "engines", "bus_brakes", "gear_shifts"],
  transport: ["engine_idle", "air_brakes", "announcements", "conductor_calls", "trolley_wheels"],
  school: ["children_voices", "school_bell", "sports_whistle", "buses", "playground"],
  hospital: ["ambulance_siren", "moderate_traffic", "announcements", "quiet_zones"],
  office: ["crowd_entry_exit", "moderate_traffic", "street_vendors", "ac_hum"],
  factory: ["machine_hum", "hammering", "compressors", "truck_loading", "reverse_alarms", "shift_siren"],
  beach: ["waves", "sea_breeze", "crowd", "kids_playing", "vendors", "low_horns"],
  park: ["children_shouting", "whistles", "ball_hits", "morning_walkers", "birds"],
  residential: ["bikes", "dogs_barking", "pressure_cooker", "tv_sounds", "birds", "ambient"],
  hill_station: ["wind", "birds", "diesel_bus", "tourist_crowd", "low_traffic"],
};

export interface AddressFormData {
  fullAddress: string;
  city: CityValue | "";
  pincode: string;
  landmarkText: string;
  landmarkCategory: LandmarkCategory | "";
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  digipin?: string;
  formattedAddress?: string;
  city?: string;
  reason?: string;
  matchType?: string;
  sceneType?: string;
  verificationMethod?: "sound" | "location" | "manual" | "confirmed";
  characteristicSounds?: string[];
  candidates?: { address: string; confidence: number }[];
  isActiveTime?: boolean;
}
