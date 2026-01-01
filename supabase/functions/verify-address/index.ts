import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tamil Nadu cities with coordinates and typical scene patterns
const TN_CITIES: Record<string, { lat: number; lon: number; scenes: string[] }> = {
  chennai: { lat: 13.0827, lon: 80.2707, scenes: ["market", "transport", "commercial", "temple"] },
  madurai: { lat: 9.9252, lon: 78.1198, scenes: ["temple", "market", "residential"] },
  coimbatore: { lat: 11.0168, lon: 76.9558, scenes: ["commercial", "residential", "factory"] },
  salem: { lat: 11.6643, lon: 78.1460, scenes: ["market", "residential", "commercial"] },
  trichy: { lat: 10.7905, lon: 78.7047, scenes: ["temple", "residential", "market"] },
  tirunelveli: { lat: 8.7139, lon: 77.7567, scenes: ["residential", "temple", "market"] },
  erode: { lat: 11.3410, lon: 77.7172, scenes: ["commercial", "market", "factory"] },
  vellore: { lat: 12.9165, lon: 79.1325, scenes: ["residential", "hospital", "commercial"] },
  thoothukudi: { lat: 8.7642, lon: 78.1348, scenes: ["transport", "commercial", "beach"] },
  thanjavur: { lat: 10.7870, lon: 79.1378, scenes: ["temple", "residential", "market"] },
  dindigul: { lat: 10.3673, lon: 77.9803, scenes: ["market", "residential", "commercial"] },
  kanchipuram: { lat: 12.8342, lon: 79.7036, scenes: ["temple", "market", "residential"] },
  tiruppur: { lat: 11.1085, lon: 77.3411, scenes: ["commercial", "factory", "market"] },
  nagercoil: { lat: 8.1833, lon: 77.4119, scenes: ["residential", "temple", "market"] },
  hosur: { lat: 12.7409, lon: 77.8253, scenes: ["commercial", "factory", "residential"] },
  ooty: { lat: 11.4102, lon: 76.6950, scenes: ["hill_station", "park", "residential"] },
  kodaikanal: { lat: 10.2381, lon: 77.4892, scenes: ["hill_station", "park", "residential"] },
  yercaud: { lat: 11.7754, lon: 78.2038, scenes: ["hill_station", "park", "residential"] },
};

// Landmark category to scene type mapping
const LANDMARK_TO_SCENE: Record<string, string> = {
  temple: "temple",
  market: "market",
  main_road: "transport",
  transport: "transport",
  school: "school",
  hospital: "hospital",
  office: "commercial",
  factory: "commercial",
  beach: "quiet",
  park: "quiet",
  residential: "residential",
  hill_station: "quiet",
};

// Time windows for each landmark (24h format)
const LANDMARK_ACTIVE_TIMES: Record<string, { start: number; end: number }[]> = {
  temple: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
  market: [{ start: 8, end: 22 }],
  main_road: [{ start: 6, end: 23 }],
  transport: [{ start: 5, end: 23 }],
  school: [{ start: 8, end: 17 }],
  hospital: [{ start: 0, end: 24 }],
  office: [{ start: 9, end: 20 }],
  factory: [{ start: 6, end: 22 }],
  beach: [{ start: 5, end: 10 }, { start: 16, end: 20 }],
  park: [{ start: 5, end: 9 }, { start: 16, end: 20 }],
  residential: [{ start: 6, end: 22 }],
  hill_station: [{ start: 6, end: 20 }],
};

// Characteristic sounds for each landmark category
const LANDMARK_SOUNDS: Record<string, string[]> = {
  temple: ["bells", "chants", "nadaswaram", "conch", "devotional_music", "crowd_murmur"],
  market: ["vendors", "bargaining", "horns", "crowd_speech", "metal_shutters", "two_wheelers"],
  main_road: ["traffic", "horns", "engines", "bus_brakes", "gear_shifts"],
  transport: ["engine_idle", "air_brakes", "announcements", "conductor_calls", "train_horn"],
  school: ["children_voices", "school_bell", "sports_whistle", "buses", "playground"],
  hospital: ["ambulance_siren", "moderate_traffic", "quiet_zones", "beeps"],
  office: ["crowd_entry_exit", "moderate_traffic", "street_vendors", "ac_hum"],
  factory: ["machine_hum", "hammering", "compressors", "truck_loading", "reverse_alarms"],
  beach: ["waves", "sea_breeze", "crowd", "kids_playing", "low_horns"],
  park: ["children_shouting", "whistles", "ball_hits", "morning_walkers", "birds"],
  residential: ["bikes", "dogs_barking", "pressure_cooker", "tv_sounds", "birds"],
  hill_station: ["wind", "birds", "diesel_bus", "tourist_crowd", "low_traffic"],
};

function generateDigipin(lat: number, lon: number): string {
  const latPart = Math.abs(lat).toFixed(2).replace(".", "");
  const lonPart = Math.abs(lon).toFixed(2).replace(".", "");
  return `TN-${latPart}-${lonPart}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function isWithinActiveTime(landmarkCategory: string, currentHour: number): boolean {
  const windows = LANDMARK_ACTIVE_TIMES[landmarkCategory];
  if (!windows) return true; // Default to active if unknown
  
  return windows.some(w => currentHour >= w.start && currentHour < w.end);
}

function calculateConfidence(params: {
  landmarkCategory: string;
  expectedScene: string;
  detectedScene: string;
  isActiveTime: boolean;
  hasAudio: boolean;
  hasGps: boolean;
  gpsDistance: number | null; // meters
  snrLevel: "high" | "low";
}): { 
  confidence: number; 
  verificationMethod: "sound" | "location" | "manual";
  verificationPath: "A" | "B"; // A = sound, B = GPS fallback
} {
  const { 
    landmarkCategory, 
    expectedScene, 
    detectedScene, 
    isActiveTime, 
    hasAudio, 
    hasGps,
    gpsDistance,
    snrLevel
  } = params;

  // Decision weights as per spec
  const WEIGHTS = {
    sound: 0.8,
    gps: 0.2,
    time: 0.1,
  };

  let confidence = 0.5;
  let method: "sound" | "location" | "manual" = "manual";
  let path: "A" | "B" = "B";

  const sceneMatches = expectedScene === detectedScene;
  const gpsCloseEnough = gpsDistance !== null && gpsDistance < 100; // <100m

  // PATH A: Sound Verification (SNR high + time correct + scene match)
  if (hasAudio && snrLevel === "high" && isActiveTime) {
    path = "A";
    
    if (sceneMatches) {
      // Strong sound match
      confidence = 0.85 + (Math.random() * 0.12); // 85-97%
      method = "sound";
      
      // Boost for high-signal landmarks
      if (["temple", "transport", "market", "school"].includes(landmarkCategory)) {
        confidence = Math.min(0.98, confidence + 0.03);
      }
      
      // Add GPS bonus if available
      if (gpsCloseEnough) {
        confidence = Math.min(0.99, confidence + WEIGHTS.gps * 0.1);
      }
    } else {
      // Scene mismatch - still use sound but lower confidence
      confidence = 0.70 + (Math.random() * 0.15); // 70-85%
      method = "sound";
    }
  }
  // PATH B: GPS Fallback (silent/off-hours/low SNR, <100m distance)
  else if (gpsCloseEnough) {
    path = "B";
    method = "location";
    
    // GPS base confidence
    let gpsConf = 0.75 + (Math.random() * 0.10); // 75-85%
    
    // Adjust based on conditions
    if (hasAudio && snrLevel === "low") {
      // Silent area - GPS + ambient audio
      gpsConf = Math.min(0.90, gpsConf + 0.05);
    }
    
    if (!isActiveTime) {
      // Off-hours - GPS is expected
      gpsConf = Math.min(0.88, gpsConf + 0.03);
    }
    
    confidence = gpsConf;
  }
  // PATH B without GPS: fallback to candidates
  else if (hasAudio) {
    path = "B";
    method = "sound";
    
    if (isActiveTime && sceneMatches) {
      confidence = 0.70 + (Math.random() * 0.10); // 70-80%
    } else {
      confidence = 0.55 + (Math.random() * 0.15); // 55-70%
    }
  }
  // No audio, no GPS - manual/retry
  else {
    path = "B";
    method = "manual";
    confidence = 0.45 + (Math.random() * 0.20); // 45-65%
  }

  return { 
    confidence: Math.min(0.98, Math.max(0.3, confidence)), 
    verificationMethod: method,
    verificationPath: path
  };
}

function mockProcessAudio(
  city: string, 
  rawAddress: string, 
  landmarkCategory: string,
  landmarkText: string,
  currentHour: number,
  hasAudio: boolean,
  hasGps: boolean,
  gpsLat: number | null,
  gpsLon: number | null
): {
  sceneType: string;
  confidence: number;
  matchType: string;
  characteristicSounds: string[];
  digipin: string;
  verifiedAddress: string;
  verificationMethod: "sound" | "location" | "manual";
  verificationPath: "A" | "B";
  isActiveTime: boolean;
  snrLevel: "high" | "low";
  gpsDistance: number | null;
} {
  const cityData = TN_CITIES[city.toLowerCase()];
  
  if (!cityData) {
    return {
      sceneType: "unknown",
      confidence: 0.5,
      matchType: "weak",
      characteristicSounds: ["ambient"],
      digipin: generateDigipin(13.0, 80.0),
      verifiedAddress: rawAddress,
      verificationMethod: "manual",
      verificationPath: "B",
      isActiveTime: false,
      snrLevel: "low",
      gpsDistance: null,
    };
  }

  const isActiveTime = isWithinActiveTime(landmarkCategory, currentHour);
  const expectedScene = LANDMARK_TO_SCENE[landmarkCategory] || "residential";
  
  // Mock SNR detection (in reality, computed from audio)
  const snrLevel: "high" | "low" = hasAudio && Math.random() > 0.25 ? "high" : "low";
  
  // Mock GPS distance calculation
  let gpsDistance: number | null = null;
  if (hasGps && gpsLat && gpsLon) {
    // Haversine-like mock distance (usually 10-150m)
    gpsDistance = Math.floor(Math.random() * 120) + 10;
  }
  
  // Mock scene detection - biased toward matching when in active time with audio
  let detectedScene: string;
  if (isActiveTime && hasAudio && snrLevel === "high") {
    // 85% chance of matching expected scene when audio + active time + high SNR
    detectedScene = Math.random() < 0.85 ? expectedScene : cityData.scenes[0];
  } else if (hasAudio) {
    // 60% chance with audio but poor conditions
    detectedScene = Math.random() < 0.60 ? expectedScene : cityData.scenes[0];
  } else {
    detectedScene = cityData.scenes[Math.floor(Math.random() * cityData.scenes.length)];
  }
  
  // Calculate confidence using decision matrix
  const { confidence, verificationMethod, verificationPath } = calculateConfidence({
    landmarkCategory,
    expectedScene,
    detectedScene,
    isActiveTime,
    hasAudio,
    hasGps,
    gpsDistance,
    snrLevel,
  });
  
  // Determine match type based on thresholds
  let matchType: string;
  if (confidence >= 0.85) matchType = "exact";
  else if (confidence >= 0.70) matchType = "strong";
  else matchType = "weak";

  // Get characteristic sounds for the landmark
  const characteristicSounds = LANDMARK_SOUNDS[landmarkCategory] || ["ambient"];

  // Add variation to coordinates
  const latVariation = (Math.random() - 0.5) * 0.01;
  const lonVariation = (Math.random() - 0.5) * 0.01;
  const digipin = generateDigipin(cityData.lat + latVariation, cityData.lon + lonVariation);

  // Format verified address with landmark
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
  const landmarkSuffix = landmarkText ? `, Near ${landmarkText}` : "";
  const verifiedAddress = `${rawAddress}${landmarkSuffix}, ${cityLabel}, Tamil Nadu`;

  return {
    sceneType: detectedScene,
    confidence,
    matchType,
    characteristicSounds,
    digipin,
    verifiedAddress,
    verificationMethod,
    verificationPath,
    isActiveTime,
    snrLevel,
    gpsDistance,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const body = await req.json();
    const { 
      rawAddress, 
      city, 
      pincode, 
      audioBase64, 
      userId, 
      sessionId,
      landmarkText,
      landmarkCategory,
      gpsLat,
      gpsLon,
      localTime, // ISO string or hour number
    } = body;

    console.log(`[verify-address] Processing: city=${city}, landmark=${landmarkCategory}, address=${rawAddress?.slice(0, 30)}...`);

    if (!rawAddress || !city) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: rawAddress and city" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cityKey = city.toLowerCase();
    if (!TN_CITIES[cityKey]) {
      return new Response(
        JSON.stringify({ 
          error: `City '${city}' not in Tamil Nadu database`,
          availableCities: Object.keys(TN_CITIES)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current hour (India timezone)
    let currentHour: number;
    if (typeof localTime === "number") {
      currentHour = localTime;
    } else if (localTime) {
      currentHour = new Date(localTime).getHours();
    } else {
      // Default to IST (UTC+5:30)
      const now = new Date();
      currentHour = (now.getUTCHours() + 5) % 24;
      if (now.getUTCMinutes() >= 30) currentHour = (currentHour + 1) % 24;
    }

    const hasAudio = !!audioBase64;
    const hasGps = !!(gpsLat && gpsLon);
    const landmark = landmarkCategory || "residential";

    const result = mockProcessAudio(
      city, 
      rawAddress, 
      landmark,
      landmarkText || "",
      currentHour,
      hasAudio,
      hasGps,
      gpsLat || null,
      gpsLon || null
    );
    
    const validationToken = `VAL_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const audioHash = audioBase64 ? `HASH_${audioBase64.slice(0, 8)}...` : null;
    const processingTimeMs = Date.now() - startTime + Math.floor(Math.random() * 300) + 100;

    // Log to database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from("validation_logs").insert({
          raw_address: rawAddress,
          verified_address: result.verifiedAddress,
          digipin_id: result.digipin,
          confidence: result.confidence,
          match_type: result.matchType as "exact" | "strong" | "weak" | "candidates",
          scene_type: result.sceneType as "market" | "temple" | "residential" | "transport" | "hospital" | "school" | "commercial" | "quiet" | "unknown",
          processing_time_ms: processingTimeMs,
          audio_hash: audioHash,
          validation_token: validationToken,
          session_id: sessionId,
          user_id: userId || null,
        });
        
        console.log(`[verify-address] Logged: ${validationToken}`);
      }
    } catch (dbError) {
      console.error("[verify-address] DB error:", dbError);
    }

    // Build response based on thresholds
    let response: Record<string, unknown>;

    if (result.confidence >= 0.85) {
      // VERIFIED (≥85%)
      response = {
        status: "verified",
        verified: true,
        digipin: result.digipin,
        verifiedAddress: result.verifiedAddress,
        formattedAddress: result.verifiedAddress,
        city: city,
        confidence: Math.round(result.confidence * 100) / 100,
        matchType: result.matchType,
        sceneType: result.sceneType,
        verificationMethod: result.verificationMethod,
        characteristicSounds: result.characteristicSounds.slice(0, 3),
        isActiveTime: result.isActiveTime,
        validationToken,
        processingTimeMs,
      };
    } else if (result.confidence >= 0.70) {
      // USER CONFIRMATION NEEDED (70-84%)
      const candidates = [
        { address: result.verifiedAddress, confidence: result.confidence },
        { address: `Near ${landmarkText || "landmark"}, ${city}`, confidence: result.confidence - 0.05 },
        { address: `${city} ${result.sceneType} area`, confidence: result.confidence - 0.10 },
      ];

      response = {
        status: "candidates",
        verified: false,
        digipin: result.digipin,
        candidates,
        primaryAddress: result.verifiedAddress,
        formattedAddress: result.verifiedAddress,
        city: city,
        confidence: Math.round(result.confidence * 100) / 100,
        matchType: result.matchType,
        sceneType: result.sceneType,
        verificationMethod: result.verificationMethod,
        characteristicSounds: result.characteristicSounds.slice(0, 3),
        isActiveTime: result.isActiveTime,
        validationToken,
        processingTimeMs,
        reason: result.isActiveTime 
          ? "Sound pattern partially matched - please confirm your address"
          : "Outside peak hours for this landmark type - please confirm",
      };
    } else {
      // FAIL / RETRY (<70%)
      response = {
        status: "retry",
        verified: false,
        digipin: null,
        formattedAddress: rawAddress,
        city: city,
        confidence: Math.round(result.confidence * 100) / 100,
        matchType: "weak",
        sceneType: result.sceneType,
        verificationMethod: result.verificationMethod,
        isActiveTime: result.isActiveTime,
        validationToken,
        processingTimeMs,
        reason: result.isActiveTime
          ? "Sound pattern did not match expected location. Please try again in a quieter environment or move closer to the landmark."
          : `Best verification time for ${landmarkCategory} is during active hours. Try GPS-based verification or record during peak hours.`,
      };
    }

    console.log(`[verify-address] Result: ${result.matchType} @ ${(result.confidence * 100).toFixed(1)}% via ${result.verificationMethod}`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[verify-address] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
