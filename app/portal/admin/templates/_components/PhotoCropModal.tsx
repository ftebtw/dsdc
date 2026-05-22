"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import CropperBase, { type Area } from "react-easy-crop";
import { X } from "lucide-react";

// react-easy-crop's types haven't been updated for React 19's stricter JSX
// element checking. The runtime is unaffected — cast to a permissive type.
const Cropper = CropperBase as unknown as ComponentType<{
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  cropShape?: "rect" | "round";
  showGrid?: boolean;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (area: Area, areaPixels: Area) => void;
}>;

const OUTPUT_SIZE = 512; // square px output

export default function PhotoCropModal({
  imageSrc,
  onCancel,
  onSave,
}: {
  imageSrc: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const dataUrl = await produceCroppedImage(imageSrc, croppedAreaPixels);
      onSave(dataUrl);
    } catch (err) {
      console.error("Crop failed", err);
      alert("Could not crop image. Try a different file.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-navy-900">
        <div className="flex items-center justify-between border-b border-warm-200 px-4 py-3 dark:border-navy-700">
          <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Crop headshot</h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-charcoal/60 hover:bg-warm-100 hover:text-charcoal dark:text-navy-200/70 dark:hover:bg-navy-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-[360px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-3 px-4 py-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-charcoal/65 dark:text-navy-200/65">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="mt-1 w-full accent-navy-700 dark:accent-gold-400"
            />
          </div>
          <p className="text-xs text-charcoal/60 dark:text-navy-200/55">
            Drag the image to reposition. Pinch / scroll or use the slider to zoom.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-warm-200 px-4 py-3 dark:border-navy-700">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-warm-300 px-3 py-1.5 text-sm font-semibold text-charcoal/80 hover:bg-warm-50 dark:border-navy-600 dark:text-navy-100 dark:hover:bg-navy-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="rounded-md bg-navy-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900 dark:hover:bg-gold-300"
          >
            {saving ? "Saving..." : "Save headshot"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function produceCroppedImage(imageSrc: string, area: Area): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
