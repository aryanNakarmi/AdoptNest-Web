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

// OpenStreetMap Nominatim — 100% free, no API key, no billing
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

export default function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [address, setAddress] = useState(value?.address ?? "");
  const [pinPos, setPinPos] = useState(value ?? DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);
  const [firstMove, setFirstMove] = useState(false);

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    setPinPos({ lat, lng });
    setLoading(true);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onChange({ address: addr, lat, lng });
    setLoading(false);
  }, [onChange]);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    // Inject Leaflet CSS once
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (mapRef.current) return;

      const start = value ?? DEFAULT_CENTER;

      const map = L.map(mapDivRef.current!, {
        center: [start.lat, start.lng],
        zoom: 16,
        zoomControl: false, // we add it manually to bottom-left
      });

      // Add zoom control to bottom-left so it doesn't clash with our button
      L.control.zoom({ position: "bottomleft" }).addTo(map);

      // Free OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Pathao style: pin fixed, map moves
      map.on("moveend", () => {
        const c = map.getCenter();
        setFirstMove(true);
        updateLocation(c.lat, c.lng);
      });

      // Initial address
      updateLocation(start.lat, start.lng);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const handleGetGPS = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapRef.current.setView([lat, lng], 17);
        setGettingGPS(false);
      },
      () => setGettingGPS(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-sm">

      {/* Map */}
      <div className="relative w-full h-72">
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Fixed center pin — stays still, map drags under it */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
          <div className="relative -mt-8">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-full blur-sm" />
            <div className="flex flex-col items-center drop-shadow-lg">
              <div className="w-9 h-9 rounded-full bg-red-600 border-[3px] border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="w-0.5 h-4 bg-red-600" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-40" />
            </div>
          </div>
        </div>

        {/* My Location button — top right, away from zoom controls */}
        <button
          type="button"
          onClick={handleGetGPS}
          disabled={gettingGPS}
          className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60"
        >
          {gettingGPS ? (
            <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiLocationMarker className="text-red-600" size={14} />
          )}
          {gettingGPS ? "Locating..." : "My Location"}
        </button>

        {/* Finding address pill */}
        {loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm text-xs text-gray-600 px-3 py-1.5 rounded-full shadow-md border border-gray-100 flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            Finding address...
          </div>
        )}

        {/* Drag hint */}
        {!firstMove && !loading && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap">
            Drag map to position the pin
          </div>
        )}
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-3 bg-white border-t border-gray-200 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <HiLocationMarker className="text-red-600" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">
            Selected Location
          </p>
          <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2">
            {loading
              ? "Getting address..."
              : address || "Move the map to select a location"}
          </p>
        </div>
        {address && !loading && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${pinPos.lat}&mlon=${pinPos.lng}#map=17/${pinPos.lat}/${pinPos.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-red-600 font-semibold hover:text-red-700 transition-colors"
          >
            Open ↗
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2">
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <span className="text-red-400">📍</span>
          Drag the map to place the pin exactly where you saw the animal
        </p>
      </div>
    </div>
  );
}
