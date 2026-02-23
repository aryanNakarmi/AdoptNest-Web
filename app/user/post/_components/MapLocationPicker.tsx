"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { HiLocationMarker } from "react-icons/hi";

interface LocationValue {
  address: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  value: LocationValue | null;
  onChange: (location: LocationValue) => void;
}

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 }; // Kathmandu

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    return data.results?.[0]?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google?.maps) { resolve(); return; }
    if (document.getElementById("gmap-script")) {
      document.getElementById("gmap-script")!.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export default function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [address, setAddress] = useState(value?.address ?? "");
  const [pinPos, setPinPos] = useState(value ?? DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    setPinPos({ lat, lng });
    setLoading(true);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onChange({ address: addr, lat, lng });
    setLoading(false);
  }, [onChange]);

  useEffect(() => {
    if (!mapDivRef.current) return;

    loadGoogleMapsScript().then(() => {
      if (mapRef.current) return;
      const start = value ?? DEFAULT_CENTER;

      const map = new (window as any).google.maps.Map(mapDivRef.current, {
        center: { lat: start.lat, lng: start.lng },
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
        ],
      });

      mapRef.current = map;

      // Pathao style: pin stays fixed, map moves under it
      map.addListener("idle", () => {
        const center = map.getCenter();
        updateLocation(center.lat(), center.lng());
      });

      // Auto-detect user GPS on load
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          map.setZoom(17);
        },
        () => {} // stay on Kathmandu if denied
      );
    });
  }, []);

  const handleGetGPS = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current.setZoom(17);
        setGettingGPS(false);
      },
      () => setGettingGPS(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full h-72 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Fixed center pin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative -mt-8">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-2 bg-black/20 rounded-full blur-sm" />
            <div className="flex flex-col items-center drop-shadow-lg">
              <div className="w-10 h-10 rounded-full bg-red-600 border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <div className="w-0.5 h-5 bg-red-600" />
              <div className="w-2 h-2 rounded-full bg-red-600 opacity-40" />
            </div>
          </div>
        </div>

        {/* My Location button */}
        <button
          type="button"
          onClick={handleGetGPS}
          disabled={gettingGPS}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-white text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition disabled:opacity-60"
        >
          {gettingGPS ? (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiLocationMarker className="text-red-600" size={16} />
          )}
          My Location
        </button>

        {loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white text-xs text-gray-600 px-3 py-1.5 rounded-full shadow border border-gray-100 flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            Finding address...
          </div>
        )}
      </div>

      {/* Address display */}
      <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <HiLocationMarker className="text-red-600 shrink-0 mt-0.5" size={18} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium mb-0.5">Selected Location</p>
          <p className="text-sm text-gray-800 font-medium leading-snug break-words">
            {loading ? "Getting address..." : address || "Move the map to select a location"}
          </p>
        </div>
        {address && !loading && (
          <a
            href={`https://www.google.com/maps?q=${pinPos.lat},${pinPos.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-600 font-semibold shrink-0 hover:underline"
          >
            Preview ↗
          </a>
        )}
      </div>

      <p className="text-xs text-gray-400">
        📍 Drag the map to place the pin exactly where you saw the animal
      </p>
    </div>
  );
}