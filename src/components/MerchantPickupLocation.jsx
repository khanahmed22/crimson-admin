import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/db/supabase";
import { Button } from "@/components/ui/button";
import { MapPin, Save, LocateFixed, Pencil, X, MapPinIcon } from "lucide-react";

import { Map, MapControls, MapMarker, MarkerContent, useMap } from "./ui/map";

// Handle map clicks (only when editing)
function MapClickHandler({ enabled, onClick }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !enabled) return;

    const handleClick = (e) =>
      onClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });

    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, isLoaded, enabled, onClick]);

  return null;
}

// Fly to selected location when it changes
function FlyToSelected({ selected }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    if (!selected?.lat || !selected?.lng) return;

    map.flyTo({
      center: [selected.lng, selected.lat],
      zoom: 16,
      essential: true,
    });
  }, [map, isLoaded, selected]);

  return null;
}

export default function MerchantPickupLocation({ restID }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [restAddress, setRestAddress] = useState("");
  const [selected, setSelected] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  // Store original DB value so Cancel can restore it
  const originalRef = useRef(null);

  const fallback = useMemo(() => ({ lat: 31.5204, lng: 74.3587 }), []);

  const mapStyle = useMemo(
    () => "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    []
  );

  // Load restaurant location from Supabase
  useEffect(() => {
    if (!restID) return;

    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("rest_list")
        .select("restAddress, rest_lat, rest_lng")
        .eq("id", restID)
        .single();

      if (!error && data) {
        setRestAddress(data.restAddress || "");

        if (data.rest_lat && data.rest_lng) {
          const coords = { lat: data.rest_lat, lng: data.rest_lng };
          setSelected(coords);
          originalRef.current = coords;
        } else {
          originalRef.current = null;
        }
      }

      setLoading(false);
    };

    load();
  }, [restID]);

  // Use browser geolocation
  const useMyLocation = () => {
    if (!isEditing) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelected({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Could not access your location. Please allow location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save location to Supabase
  const save = async () => {
    if (!selected?.lat || !selected?.lng) {
      alert("Please pick a location on the map first.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("rest_list")
      .update({
        rest_lat: selected.lat,
        rest_lng: selected.lng,
      })
      .eq("id", restID);

    setSaving(false);

    if (error) {
      console.log(error);
      alert("Could not save pickup location.");
      return;
    }

    originalRef.current = selected;

    alert("Pickup location saved!");
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);

    if (!selected) {
      setSelected(fallback);
    }
  };

  const handleCancel = () => {
    if (originalRef.current) {
      setSelected(originalRef.current);
    } else {
      setSelected(null);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm text-gray-600">Loading map…</div>
      </div>
    );
  }

  const center = selected ?? fallback;

  return (
    <div className="space-y-4  bg-white mt-2">
      {/* ✅ RESPONSIVE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-5 w-5 shrink-0" />
            Pickup Map Location
          </div>

          <div className="mt-1 text-sm text-gray-600">
            Customers will see this pin on the pickup page.
          </div>

          
        </div>

        {/* ✅ RESPONSIVE BUTTONS */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={useMyLocation}
            className="w-full gap-2 sm:w-auto"
            disabled={!isEditing}
          >
            <LocateFixed className="h-4 w-4" />
            Use my location
          </Button>

          {!isEditing ? (
            <Button onClick={handleEdit} className="w-full gap-2 sm:w-auto btn-accent">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="w-full gap-2 sm:w-auto"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>

              <Button
                onClick={save}
                disabled={saving}
                className="w-full gap-2 sm:w-auto btn-accent"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="overflow-hidden rounded-2xl border">
        <div className="h-[260px] w-full sm:h-[340px]">
          <Map
            styles={{ light: mapStyle }}
            viewport={{ center: [center.lng, center.lat], zoom: 15 }}
          >
            <MapControls
              showZoom={isEditing}
              showCompass={isEditing}
              showLocate={false}
              showFullscreen={isEditing}
            />

            <FlyToSelected selected={selected} />
            <MapClickHandler enabled={isEditing} onClick={setSelected} />

            {selected && (
              <MapMarker
                longitude={selected.lng}
                latitude={selected.lat}
                draggable={isEditing}
                onDragEnd={(e) => {
                  if (!isEditing) return;
                  setSelected({ lat: e.lngLat.lat, lng: e.lngLat.lng });
                }}
              >
                <MarkerContent>
                  <MapPinIcon/>
                </MarkerContent>
               
              </MapMarker>
            )}
          </Map>
        </div>

        <div className="border-t bg-white p-3 text-sm text-gray-600">
          {isEditing
            ? "Click the map to set the pin. Drag the pin to adjust."
            : "Click Edit to change the pickup location."}
        </div>
      </div>

      {/* Selected coords */}
      {selected ? (
        <div className="break-words text-sm text-gray-700">
          <span className="font-medium">Selected:</span>{" "}
          {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
        </div>
      ) : (
        <div className="text-sm text-gray-500">No pickup pin selected yet.</div>
      )}
    </div>
  );
}
