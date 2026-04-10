"use client";

import { useEffect, useRef, useState } from "react";

interface Pharmacy {
  id: string;
  name: string;
  village: string;
  lat: number;
  lng: number;
  distanceKm: number;
  type: string;
  inStock: boolean;
  phone: string;
}

interface GoogleMapProps {
  pharmacies: Pharmacy[];
  userLat: number | null;
  userLng: number | null;
  onLocationFound?: (lat: number, lng: number) => void;
  onLocationError?: (error: string) => void;
  height?: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleMap({
  pharmacies,
  userLat,
  userLng,
  onLocationFound,
  onLocationError,
  height = 250,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const [locationPermission, setLocationPermission] = useState<"prompt" | "granted" | "denied">("prompt");

  // Request user location
  useEffect(() => {
    if (userLat && userLng) return; // Already have location

    if (!navigator.geolocation) {
      onLocationError?.("Geolocation is not supported by your browser");
      setLocationPermission("denied");
      return;
    }

    setLocationPermission("prompt");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFound?.(latitude, longitude);
        setLocationPermission("granted");
      },
      (error) => {
        let message = "Unable to get your location";
        if (error.code === 1) {
          message = "Location permission denied. Please enable location access.";
          setLocationPermission("denied");
        } else if (error.code === 2) {
          message = "Location unavailable";
          setLocationPermission("denied");
        }
        onLocationError?.(message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [userLat, userLng, onLocationFound, onLocationError]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const defaultCenter = userLat && userLng ? { lat: userLat, lng: userLng } : { lat: 30.3782, lng: 76.3641 }; // Default: Nabha, Punjab

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "simplified" }] },
        { featureType: "transit", stylers: [{ visibility: "simplified" }] },
      ],
    });

    // Add user location marker
    if (userLat && userLng) {
      new window.google.maps.Marker({
        position: { lat: userLat, lng: userLng },
        map: googleMapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Your Location",
      });

      // Add accuracy circle
      new window.google.maps.Circle({
        map: googleMapRef.current,
        center: { lat: userLat, lng: userLng },
        radius: 500,
        fillColor: "#4285F4",
        fillOpacity: 0.1,
        strokeColor: "#4285F4",
        strokeOpacity: 0.3,
        strokeWeight: 1,
      });
    }
  }, [userLat, userLng]);

  // Add pharmacy markers
  useEffect(() => {
    if (!googleMapRef.current || !window.google?.maps) return;

    // Clear existing markers
    googleMapRef.current.markers?.forEach((marker: any) => marker.setMap(null));
    googleMapRef.current.markers = [];

    const markers: any[] = [];

    pharmacies.forEach((pharmacy) => {
      if (!pharmacy.lat || !pharmacy.lng) return;

      const markerColor = pharmacy.inStock ? "#1E8449" : "#C0392B";

      const marker = new window.google.maps.Marker({
        position: { lat: pharmacy.lat, lng: pharmacy.lng },
        map: googleMapRef.current,
        icon: {
          path: "M27.648,-10.000 C27.648,-4.477 23.170,0.000 17.648,0.000 C12.126,0.000 7.648,-4.477 7.648,-10.000 C7.648,-16.000 0.000,-26.000 0.000,-26.000 C0.000,-26.000 -7.648,-16.000 -7.648,-10.000 C-7.648,-4.477 -12.126,0.000 -17.648,0.000 C-23.170,0.000 -27.648,-4.477 -27.648,-10.000 C-27.648,-16.000 -20.000,-28.000 -20.000,-34.000 C-20.000,-41.000 -15.000,-46.000 0.000,-54.000 C15.000,-46.000 20.000,-41.000 20.000,-34.000 C20.000,-28.000 27.648,-16.000 27.648,-10.000 Z",
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 0.5,
          anchor: new window.google.maps.Point(0, -27),
        },
        title: pharmacy.name,
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px; font-family: sans-serif;">
            <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: bold; color: #1A2332;">${pharmacy.name}</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #6B7C93;">📍 ${pharmacy.village}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #6B7C93;">📞 ${pharmacy.phone}</p>
            <p style="margin: 4px 0; font-size: 12px;">
              <span style="background: ${pharmacy.type === "Govt Free" ? "#E8F8EF" : "#EBF4FD"}; color: ${pharmacy.type === "Govt Free" ? "#1E8449" : "#1B6CA8"}; padding: 2px 8px; border-radius: 8px; font-weight: bold; font-size: 11px;">${pharmacy.type}</span>
            </p>
            <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold; color: ${pharmacy.inStock ? "#1E8449" : "#C0392B"};">
              ${pharmacy.inStock ? "✓ In Stock" : "✗ Out of Stock"}
            </p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markers.push(marker);
    });

    googleMapRef.current.markers = markers;

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      if (userLat && userLng) {
        bounds.extend({ lat: userLat, lng: userLng });
      }
      markers.forEach((m) => bounds.extend(m.getPosition()));
      googleMapRef.current.fitBounds(bounds, { top: 30, bottom: 30, left: 30, right: 30 });
    }
  }, [pharmacies, userLat, userLng]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={mapRef}
        style={{
          height,
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #DDE3EC",
        }}
      />
      {locationPermission === "denied" && (
        <div style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          right: 10,
          background: "#FDEDED",
          color: "#C0392B",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          textAlign: "center",
        }}>
          📍 Location access denied. Enable it for accurate results.
        </div>
      )}
    </div>
  );
}
