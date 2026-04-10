"use client";

import { useEffect, useState } from "react";

interface GoogleMapsLoaderProps {
  onLoad: () => void;
  onError?: (error: string) => void;
}

export default function GoogleMapsLoader({ onLoad, onError }: GoogleMapsLoaderProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((window as any).google?.maps) {
      onLoad();
      setLoading(false);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    
    if (!apiKey) {
      onError?.("Google Maps API key is missing. Add it to .env.local");
      setLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      onLoad();
      setLoading(false);
    };
    script.onerror = () => {
      onError?.("Failed to load Google Maps script");
      setLoading(false);
    };
    document.head.appendChild(script);
  }, [onLoad, onError]);

  return null;
}
