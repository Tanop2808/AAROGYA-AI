"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in Next.js
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

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

interface OpenStreetMapProps {
  pharmacies: Pharmacy[];
  userLat: number | null;
  userLng: number | null;
  onLocationFound?: (lat: number, lng: number) => void;
  onLocationError?: (error: string) => void;
  height?: number;
}

export default function OpenStreetMap({
  pharmacies,
  userLat,
  userLng,
  onLocationFound,
  onLocationError,
  height = 250,
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [locationPermission, setLocationPermission] = useState<"prompt" | "granted" | "denied">("prompt");

  // Request user location
  useEffect(() => {
    if (userLat && userLng) return;

    if (!navigator.geolocation) {
      console.log("Geolocation not supported, using default location");
      setLocationPermission("denied");
      return;
    }

    setLocationPermission("prompt");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Location found:", latitude, longitude);
        onLocationFound?.(latitude, longitude);
        setLocationPermission("granted");
      },
      (error) => {
        console.log("Location error:", error.message);
        // Don't show error banner, just use default location
        setLocationPermission("denied");
        // Don't call onLocationError - let the map still work with defaults
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, [userLat, userLng, onLocationFound, onLocationError]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const defaultCenter: [number, number] = userLat && userLng ? [userLat, userLng] : [19.0760, 72.8777]; // Default: Mumbai, India

    mapInstance.current = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: userLat && userLng ? 14 : 12,
      zoomControl: true,
      attributionControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Store user marker reference
    mapInstance.current.userMarker = null;
  }, []);

  // Update user location marker when location changes
  useEffect(() => {
    if (!mapInstance.current || !userLat || !userLng) return;

    // Remove old user marker if exists
    if (mapInstance.current.userMarker) {
      mapInstance.current.userMarker.remove();
      if (mapInstance.current.userCircle) {
        mapInstance.current.userCircle.remove();
      }
    }

    // Create user location icon
    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: `<div style="
        width: 18px;
        height: 18px;
        background: #4285F4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(66,133,244,0.7);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    // Add marker
    mapInstance.current.userMarker = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(mapInstance.current)
      .bindPopup("<b>📍 Your Location</b>")
      .openPopup();

    // Add accuracy circle
    mapInstance.current.userCircle = L.circle([userLat, userLng], {
      radius: 300,
      color: "#4285F4",
      fillColor: "#4285F4",
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(mapInstance.current);

    // Pan map to user location
    mapInstance.current.setView([userLat, userLng], 14, { animate: true, duration: 1 });

    console.log("✅ User location marker added to map");
  }, [userLat, userLng]);

  // Add pharmacy markers
  useEffect(() => {
    if (!mapInstance.current || pharmacies.length === 0) return;

    // Clear existing markers
    mapInstance.current.markers?.forEach((marker: any) => mapInstance.current.removeLayer(marker));
    mapInstance.current.markers = [];

    const markers: any[] = [];
    const bounds = L.latLngBounds([]);

    // Add user location to bounds
    if (userLat && userLng) {
      bounds.extend([userLat, userLng]);
    }

    pharmacies.forEach((pharmacy) => {
      if (!pharmacy.lat || !pharmacy.lng) return;

      // Create custom marker icon with color
      const markerColor = pharmacy.inStock ? "#1E8449" : "#C0392B";
      const markerIcon_html = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5s12.5-19.1 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${markerColor}"/>
          <circle cx="12.5" cy="12.5" r="5" fill="white"/>
        </svg>
      `;

      const customIcon = L.divIcon({
        html: markerIcon_html,
        className: "pharmacy-marker",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
      });

      const marker = L.marker([pharmacy.lat, pharmacy.lng], { icon: customIcon })
        .addTo(mapInstance.current);

      // Add popup with pharmacy info
      const popupContent = `
        <div style="padding: 8px; min-width: 200px; font-family: 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: bold; color: #1A2332;">${pharmacy.name || pharmacy.storeName}</h3>
          <p style="margin: 3px 0; font-size: 11px; color: #6B7C93;">📍 ${pharmacy.village}</p>
          ${pharmacy.address && pharmacy.address !== "Address not available" ? `<p style="margin: 3px 0; font-size: 11px; color: #6B7C93;">🏠 ${pharmacy.address}</p>` : ""}
          ${pharmacy.phone && pharmacy.phone !== "N/A" ? `<p style="margin: 3px 0; font-size: 11px; color: #6B7C93;">📞 ${pharmacy.phone}</p>` : ""}
          ${pharmacy.opening_hours && pharmacy.opening_hours !== "Check locally" ? `<p style="margin: 3px 0; font-size: 11px; color: #6B7C93;">🕐 ${pharmacy.opening_hours}</p>` : ""}
          <p style="margin: 3px 0;">
            <span style="background: ${pharmacy.type === "Govt Free" ? "#E8F8EF" : "#EBF4FD"}; color: ${pharmacy.type === "Govt Free" ? "#1E8449" : "#1B6CA8"}; padding: 2px 8px; border-radius: 8px; font-weight: bold; font-size: 10px;">${pharmacy.type}</span>
          </p>
          <p style="margin: 6px 0 0; font-size: 11px; font-weight: bold; color: #1B6CA8;">
            📏 ${pharmacy.distanceKm} km away
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.push(marker);
      bounds.extend([pharmacy.lat, pharmacy.lng]);
    });

    mapInstance.current.markers = markers;

    // Fit map to show all markers
    if (markers.length > 0 || (userLat && userLng)) {
      mapInstance.current.fitBounds(bounds, { padding: [30, 30] });
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
          zIndex: 1,
        }}
      />
      {locationPermission === "denied" && false && (
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
          zIndex: 1000,
        }}>
          📍 Location access denied. Enable it for accurate results.
        </div>
      )}
    </div>
  );
}
