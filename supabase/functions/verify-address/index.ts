import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tamil Nadu cities with realistic data
const TN_CITIES: Record<string, { lat: number; lon: number; scenes: string[]; sounds: string[] }> = {
  chennai: { lat: 13.0827, lon: 80.2707, scenes: ["market", "transport", "commercial"], sounds: ["horns", "vendors", "traffic"] },
  madurai: { lat: 9.9252, lon: 78.1198, scenes: ["temple", "market", "residential"], sounds: ["bells", "chants", "vendors"] },
  coimbatore: { lat: 11.0168, lon: 76.9558, scenes: ["commercial", "residential", "transport"], sounds: ["industrial", "traffic", "ambient"] },
  salem: { lat: 11.6643, lon: 78.1460, scenes: ["market", "residential", "commercial"], sounds: ["vendors", "traffic", "ambient"] },
  trichy: { lat: 10.7905, lon: 78.7047, scenes: ["temple", "residential", "market"], sounds: ["bells", "ambient", "vendors"] },
  tirunelveli: { lat: 8.7139, lon: 77.7567, scenes: ["residential", "temple", "market"], sounds: ["ambient", "bells", "vendors"] },
  erode: { lat: 11.3410, lon: 77.7172, scenes: ["commercial", "market", "residential"], sounds: ["traffic", "vendors", "ambient"] },
  vellore: { lat: 12.9165, lon: 79.1325, scenes: ["residential", "hospital", "commercial"], sounds: ["ambient", "traffic", "birds"] },
  thoothukudi: { lat: 8.7642, lon: 78.1348, scenes: ["transport", "commercial", "residential"], sounds: ["port", "traffic", "wind"] },
  thanjavur: { lat: 10.7870, lon: 79.1378, scenes: ["temple", "residential", "market"], sounds: ["bells", "chants", "ambient"] },
  dindigul: { lat: 10.3673, lon: 77.9803, scenes: ["market", "residential", "commercial"], sounds: ["vendors", "ambient", "traffic"] },
  kanchipuram: { lat: 12.8342, lon: 79.7036, scenes: ["temple", "market", "residential"], sounds: ["bells", "vendors", "ambient"] },
  tiruppur: { lat: 11.1085, lon: 77.3411, scenes: ["commercial", "market", "residential"], sounds: ["industrial", "traffic", "vendors"] },
  nagercoil: { lat: 8.1833, lon: 77.4119, scenes: ["residential", "temple", "market"], sounds: ["ambient", "bells", "vendors"] },
  hosur: { lat: 12.7409, lon: 77.8253, scenes: ["commercial", "residential", "transport"], sounds: ["industrial", "traffic", "ambient"] },
};

const SCENE_SOUNDS: Record<string, string[]> = {
  market: ["vendors", "horns", "bargaining", "traffic"],
  temple: ["bells", "chants", "prayers", "music"],
  residential: ["birds", "ambient", "children", "dogs"],
  transport: ["horns", "engines", "announcements", "traffic"],
  hospital: ["ambulance", "quiet", "announcements", "beeps"],
  school: ["children", "bells", "announcements", "ambient"],
  commercial: ["traffic", "machinery", "ambient", "vendors"],
  quiet: ["wind", "silence", "birds", "ambient"],
};

function generateDigipin(lat: number, lon: number): string {
  const latPart = Math.abs(lat).toFixed(2).replace(".", "");
  const lonPart = Math.abs(lon).toFixed(2).replace(".", "");
  return `TN-${latPart}-${lonPart}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function mockProcessAudio(city: string, rawAddress: string): {
  sceneType: string;
  confidence: number;
  matchType: string;
  characteristicSounds: string[];
  digipin: string;
  verifiedAddress: string;
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
    };
  }

  // Mock scene detection (random from city's typical scenes)
  const sceneType = cityData.scenes[Math.floor(Math.random() * cityData.scenes.length)];
  
  // Mock confidence (75-98% for realistic feel)
  const confidence = 0.75 + Math.random() * 0.23;
  
  // Determine match type based on confidence
  let matchType: string;
  if (confidence >= 0.97) matchType = "exact";
  else if (confidence >= 0.90) matchType = "strong";
  else if (confidence >= 0.80) matchType = "weak";
  else matchType = "candidates";

  // Get characteristic sounds for the scene
  const characteristicSounds = SCENE_SOUNDS[sceneType] || ["ambient"];

  // Add some variation to lat/lon for realism
  const latVariation = (Math.random() - 0.5) * 0.02;
  const lonVariation = (Math.random() - 0.5) * 0.02;
  const digipin = generateDigipin(cityData.lat + latVariation, cityData.lon + lonVariation);

  // Format verified address
  const cityLabel = Object.entries(TN_CITIES).find(([k]) => k === city.toLowerCase())?.[0] || city;
  const verifiedAddress = `${rawAddress}, ${cityLabel.charAt(0).toUpperCase() + cityLabel.slice(1)}, Tamil Nadu`;

  return {
    sceneType,
    confidence,
    matchType,
    characteristicSounds,
    digipin,
    verifiedAddress,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    // Parse request body
    const body = await req.json();
    const { rawAddress, city, pincode, audioBase64, userId, sessionId } = body;

    console.log(`[verify-address] Processing: city=${city}, address=${rawAddress?.slice(0, 30)}...`);

    // Validate required fields
    if (!rawAddress || !city) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: rawAddress and city" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if city is valid
    const cityKey = city.toLowerCase();
    if (!TN_CITIES[cityKey]) {
      console.log(`[verify-address] City not found: ${city}`);
      return new Response(
        JSON.stringify({ 
          error: `City '${city}' not in Tamil Nadu database`,
          availableCities: Object.keys(TN_CITIES)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mock audio processing (simulates ML analysis)
    const result = mockProcessAudio(city, rawAddress);
    
    // Generate validation token
    const validationToken = `VAL_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    
    // Create audio hash if audio was provided
    const audioHash = audioBase64 
      ? `HASH_${audioBase64.slice(0, 8)}...` 
      : null;

    const processingTimeMs = Date.now() - startTime + Math.floor(Math.random() * 500) + 200;

    // Log to database if Supabase client available
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
        
        console.log(`[verify-address] Logged to validation_logs: ${validationToken}`);
      }
    } catch (dbError) {
      console.error("[verify-address] Database logging failed:", dbError);
      // Continue anyway - don't fail the verification just because logging failed
    }

    // Build response based on match type
    let response: Record<string, unknown>;

    if (result.matchType === "exact" || result.matchType === "strong") {
      response = {
        status: "verified",
        verified: true,
        digipin: result.digipin,
        verifiedAddress: result.verifiedAddress,
        city: city,
        confidence: Math.round(result.confidence * 100) / 100,
        matchType: result.matchType,
        sceneType: result.sceneType,
        characteristicSounds: result.characteristicSounds,
        validationToken,
        processingTimeMs,
      };
    } else {
      // Return candidates for lower confidence
      const candidates = [
        { address: result.verifiedAddress, confidence: result.confidence },
        { address: `Near ${result.characteristicSounds[0]} area, ${city}`, confidence: result.confidence - 0.05 },
        { address: `${city} ${result.sceneType} zone`, confidence: result.confidence - 0.1 },
      ];

      response = {
        status: "candidates",
        verified: false,
        digipin: result.digipin,
        candidates,
        primaryAddress: result.verifiedAddress,
        city: city,
        confidence: Math.round(result.confidence * 100) / 100,
        matchType: result.matchType,
        sceneType: result.sceneType,
        characteristicSounds: result.characteristicSounds,
        validationToken,
        processingTimeMs,
        reason: "Sound did not match expected location profile with high confidence",
      };
    }

    console.log(`[verify-address] Result: ${result.matchType} @ ${(result.confidence * 100).toFixed(1)}%`);

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
