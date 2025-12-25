import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronDown, Navigation } from "lucide-react";
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
import { TAMIL_NADU_CITIES, AddressFormData, CityValue } from "@/lib/constants";

interface AddressEntryScreenProps {
  onContinue: (data: AddressFormData) => void;
}

export function AddressEntryScreen({ onContinue }: AddressEntryScreenProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    fullAddress: "",
    city: "",
    pincode: "",
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
      className="flex flex-col gap-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-2">
          <MapPin className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Address Verification
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your address details to begin verification
        </p>
      </div>

      <div className="elevated-card rounded-2xl p-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Full Address
          </Label>
          <Textarea
            id="address"
            placeholder="No. 4, Kannu Nagar, Nesapakkam, Opp. Maha Textile"
            value={formData.fullAddress}
            onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
            className={`min-h-[100px] resize-none ${errors.fullAddress ? "border-destructive" : ""}`}
          />
          {errors.fullAddress && (
            <p className="text-xs text-destructive">{errors.fullAddress}</p>
          )}
        </div>

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
        Your location will be verified using ambient sound analysis
      </p>
    </motion.div>
  );
}
