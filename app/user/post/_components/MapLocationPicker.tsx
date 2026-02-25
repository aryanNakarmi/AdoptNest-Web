"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { HiLocationMarker } from "react-icons/hi";

export interface LocationValue {
  address: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  value: LocationValue | null;
  onChange: (location: LocationValue) => void;
}

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 }; // Kathmandu

// Reverse geocode using OpenStreetMap Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "AdoptNest/1.0",
        },
      }
    );

    const data = await res.json();
    if (data.error) return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    const a = data.address;
    const parts = [
      a.road || a.pedestrian || a.footway || a.path,
      a.suburb || a.neighbourhood || a.quarter,
      a.city || a.town || a.village || a.municipality,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : data.display_name;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

export default function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pinPos, setPinPos] = useState<LocationValue>(value ?? { ...DEFAULT_CENTER, address: "" });
  const [address, setAddress] = useState(pinPos.address);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [firstMove, setFirstMove] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);

  // Update location and address
  const updateLocation = useCallback(async (lat: number, lng: number) => {
    setPinPos(prev => ({ ...prev, lat, lng }));
    setLoading(true);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onChange({ address: addr, lat, lng });
    setLoading(false);
  }, [onChange]);

  // Debounced update
  const debouncedUpdate = useCallback((lat: number, lng: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateLocation(lat, lng);
    }, 600);
  }, [updateLocation]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (mapRef.current) return;

      const start: LocationValue = value ?? { ...DEFAULT_CENTER, address: "" };

      const map = L.map(mapDivRef.current!, {
        center: [start.lat, start.lng],
        zoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomleft" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      map.on("movestart", () => setDragging(true));

      map.on("moveend", () => {
        setDragging(false);
        setFirstMove(true);
        const c = map.getCenter();
        debouncedUpdate(c.lat, c.lng);
      });

      updateLocation(start.lat, start.lng);
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle "My Location"
  const handleGetGPS = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng , accuracy} = pos.coords;
        
    console.log("GPS coords:", lat, lng, "Accuracy:", accuracy, "m");
        mapRef.current.setView([lat, lng], 18);
        debouncedUpdate(lat, lng);
        setGettingGPS(false);
      },
      () => setGettingGPS(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-sm">

      {/* Map */}
      <div className="relative w-full h-72">
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Fixed center pin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
          <div className="relative -mt-8">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-full blur-sm" />
            <div className="flex flex-col items-center drop-shadow-lg">
              <div
                className={`w-9 h-9 rounded-full bg-red-600 border-[3px] border-white shadow-lg flex items-center justify-center transition-transform duration-150 ${dragging ? "scale-110 -translate-y-1" : "scale-100"}`}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="w-0.5 h-4 bg-red-600" />
              <div className={`w-1.5 h-1.5 rounded-full bg-red-600 transition-opacity ${dragging ? "opacity-20" : "opacity-40"}`} />
            </div>
          </div>
        </div>

        {/* My Location button */}
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

        {/* Status pill */}
        {(loading || dragging) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm text-xs text-gray-600 px-3 py-1.5 rounded-full shadow-md border border-gray-100 flex items-center gap-1.5">
            {dragging ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Drag to position...
              </>
            ) : (
              <>
                <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                Finding address...
              </>
            )}
          </div>
        )}

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
            {dragging ? "Positioning..." : loading ? "Getting address..." : address || "Move the map to select a location"}
          </p>
        </div>
        {address && !loading && !dragging && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${pinPos.lat}&mlon=${pinPos.lng}#map=18/${pinPos.lat}/${pinPos.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-red-600 font-semibold hover:text-red-700 transition-colors"
          >
            Open ↗
          </a>
        )}
      </div>

      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2">
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          Drag the map to place the pin exactly where you saw the animal
        </p>
      </div>
    </div>
  );
}