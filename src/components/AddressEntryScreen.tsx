import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TAMIL_NADU_CITIES, LANDMARK_CATEGORIES, AddressFormData, CityValue, LandmarkCategory } from "@/lib/constants";

interface AddressEntryScreenProps {
  onContinue: (data: AddressFormData) => void;
}

export function AddressEntryScreen({ onContinue }: AddressEntryScreenProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    fullAddress: "",
    city: "",
    pincode: "",
    landmarkText: "",
    landmarkCategory: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
    
    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = "Address is required";
    }
    
    if (!formData.city) {
      newErrors.city = "Please select a city";
    }

    if (!formData.landmarkCategory) {
      newErrors.landmarkCategory = "Please select a nearby landmark type";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onContinue(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-2">
          <MapPin className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Address Verification
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your address and nearby landmark for sound-based verification
        </p>
      </div>

      <div className="elevated-card rounded-2xl p-5 space-y-4">
        {/* Full Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Full Address
          </Label>
          <Textarea
            id="address"
            placeholder="No. 4, Kannu Nagar, Nesapakkam, Opp. Maha Textile"
            value={formData.fullAddress}
            onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
            className={`min-h-[80px] resize-none ${errors.fullAddress ? "border-destructive" : ""}`}
          />
          {errors.fullAddress && (
            <p className="text-xs text-destructive">{errors.fullAddress}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            City
          </Label>
          <Select
            value={formData.city}
            onValueChange={(value: CityValue) => setFormData({ ...formData, city: value })}
          >
            <SelectTrigger className={`w-full ${errors.city ? "border-destructive" : ""}`}>
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              {TAMIL_NADU_CITIES.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city}</p>
          )}
        </div>

        {/* Landmark Category */}
        <div className="space-y-2">
          <Label htmlFor="landmarkCategory" className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Nearby Landmark Type
          </Label>
          <Select
            value={formData.landmarkCategory}
            onValueChange={(value: LandmarkCategory) => setFormData({ ...formData, landmarkCategory: value })}
          >
            <SelectTrigger className={`w-full ${errors.landmarkCategory ? "border-destructive" : ""}`}>
              <SelectValue placeholder="What's near your address?" />
            </SelectTrigger>
            <SelectContent>
              {LANDMARK_CATEGORIES.map((landmark) => (
                <SelectItem key={landmark.value} value={landmark.value}>
                  <span className="flex items-center gap-2">
                    <span>{landmark.icon}</span>
                    <span>{landmark.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.landmarkCategory && (
            <p className="text-xs text-destructive">{errors.landmarkCategory}</p>
          )}
        </div>

        {/* Landmark Text (optional) */}
        <div className="space-y-2">
          <Label htmlFor="landmarkText" className="text-sm font-medium">
            Landmark Name <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="landmarkText"
            type="text"
            placeholder="e.g., Meenakshi Temple, CMBT Bus Stand"
            value={formData.landmarkText}
            onChange={(e) => setFormData({ ...formData, landmarkText: e.target.value })}
          />
        </div>

        {/* Pincode */}
        <div className="space-y-2">
          <Label htmlFor="pincode" className="text-sm font-medium">
            Pincode <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="pincode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="600089"
            value={formData.pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, pincode: value });
            }}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button 
          onClick={handleSubmit} 
          size="xl" 
          className="w-full gap-3"
        >
          <Navigation className="w-5 h-5" />
          Continue to Record Sound
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground px-4">
        Sound verification works best during active hours for your landmark type
      </p>
    </motion.div>
  );
}
