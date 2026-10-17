"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Move,
  Check,
  RotateCcw as ResetIcon,
  Grid,
  User,
  Sparkles,
  Layers,
  Upload,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export type AspectRatioType = "3:4" | "1:1" | "4:5";

interface PhotoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Image source: can be a data URL, object URL, or remote URL */
  imageSrc: string;
  /** Teacher name to display in the live preview card */
  namaPengajar?: string;
  /** Teacher title/position to display in the live preview card */
  jabatanPengajar?: string;
  /** Is teacher a pimpinan/head */
  isPimpinan?: boolean;
  /** Callback with the uploaded image URL after cropping */
  onSave: (croppedImageUrl: string) => void;
  /** Optional callback if user wants to pick a different file */
  onChangeImage?: (newFile: File) => void;
}

const ASPECT_RATIO_CONFIGS: Record<
  AspectRatioType,
  { label: string; sublabel: string; width: number; height: number; outW: number; outH: number }
> = {
  "3:4": {
    label: "3 : 4 (Potret Web)",
    sublabel: "Standar Kartu Pengajar Pesantren",
    width: 285,
    height: 380,
    outW: 900,
    outH: 1200,
  },
  "1:1": {
    label: "1 : 1 (Persegi)",
    sublabel: "Avatar Profil & Foto Bulat",
    width: 320,
    height: 320,
    outW: 900,
    outH: 900,
  },
  "4:5": {
    label: "4 : 5 (Instagram)",
    sublabel: "Potret Standar Media Sosial",
    width: 304,
    height: 380,
    outW: 900,
    outH: 1125,
  },
};

export default function PhotoCropModal({
  isOpen,
  onClose,
  imageSrc,
  namaPengajar = "Nama Pengajar",
  jabatanPengajar = "Ustadz / Pengajar",
  isPimpinan = false,
  onSave,
  onChangeImage,
}: PhotoCropModalProps) {
  // Crop & Transform States
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("3:4");
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Guide Overlays
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);

  // Image Loading State
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [imgLoadError, setImgLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Dragging & Interaction Refs
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({
    x: 0,
    y: 0,
    initialPanX: 0,
    initialPanY: 0,
  });
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Safe image URL for Canvas (uses proxy for remote URLs to avoid CORS taint)
  const safeImageSrc = useMemo(() => {
    if (!imageSrc) return "";
    if (imageSrc.startsWith("data:") || imageSrc.startsWith("blob:")) {
      return imageSrc;
    }
    // Remote URL: route through proxy if it's an external link
    return `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;
  }, [imageSrc]);

  // Reset transforms when imageSrc changes
  useEffect(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setIsFlipped(false);
    setImgLoadError(null);
    setProcessError(null);
  }, [imageSrc]);

  // Load natural image dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImgNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setImgLoadError(null);
    }
  };

  // Sync natural dimensions immediately if image was already cached
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImgNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      setImgLoadError(null);
    }
  }, [safeImageSrc]);

  const currentConfig = ASPECT_RATIO_CONFIGS[aspectRatio];
  const { width: viewW, height: viewH } = currentConfig;

  // Geometry calculations: Effective dimensions, scale, and pan clamping
  const { scale, clampedPanX, clampedPanY } = useMemo(() => {
    if (!imgNaturalSize) {
      return { scale: 1, clampedPanX: 0, clampedPanY: 0 };
    }

    const { width: origW, height: origH } = imgNaturalSize;
    const isRotated90or270 = rotation % 180 !== 0;
    const effW = isRotated90or270 ? origH : origW;
    const effH = isRotated90or270 ? origW : origH;

    // Minimum scale required to cover the crop frame completely
    const baseScale = Math.max(viewW / effW, viewH / effH);
    const finalScale = baseScale * zoom;

    // Displayed bounding box of the transformed image
    const dispW = effW * finalScale;
    const dispH = effH * finalScale;

    // Maximum pan allowed to keep the image covering the viewport with zero empty gaps
    const maxPanX = Math.max(0, (dispW - viewW) / 2);
    const maxPanY = Math.max(0, (dispH - viewH) / 2);

    const clampedX = Math.min(Math.max(pan.x, -maxPanX), maxPanX);
    const clampedY = Math.min(Math.max(pan.y, -maxPanY), maxPanY);

    return {
      scale: finalScale,
      clampedPanX: clampedX,
      clampedPanY: clampedY,
    };
  }, [imgNaturalSize, rotation, viewW, viewH, zoom, pan]);

  // Pointer drag handling (mouse & single touch) + Multi-touch pinch-to-zoom
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    viewportRef.current?.setPointerCapture(e.pointerId);
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialPanX: clampedPanX,
        initialPanY: clampedPanY,
      };
    } else if (activePointersRef.current.size === 2) {
      // Start pinch
      isDraggingRef.current = false;
      const pts = Array.from(activePointersRef.current.values());
      initialPinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialPinchZoomRef.current = zoom;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2 && initialPinchDistRef.current) {
      // Handle pinch zoom
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const pinchRatio = currentDist / initialPinchDistRef.current;
      const nextZoom = Math.min(3.5, Math.max(1.0, initialPinchZoomRef.current * pinchRatio));
      setZoom(Number(nextZoom.toFixed(2)));
    } else if (isDraggingRef.current && activePointersRef.current.size === 1) {
      // Handle pan
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.initialPanX + deltaX,
        y: dragStartRef.current.initialPanY + deltaY,
      });
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    try {
      if (viewportRef.current?.hasPointerCapture(e.pointerId)) {
        viewportRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if not captured
    }

    if (activePointersRef.current.size === 0) {
      isDraggingRef.current = false;
      initialPinchDistRef.current = null;
    } else if (activePointersRef.current.size === 1) {
      // Resume dragging with the remaining pointer
      const [remaining] = Array.from(activePointersRef.current.values());
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: remaining.x,
        y: remaining.y,
        initialPanX: clampedPanX,
        initialPanY: clampedPanY,
      };
      initialPinchDistRef.current = null;
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    setZoom((prev) => {
      const next = Math.min(3.5, Math.max(1.0, prev + zoomDelta));
      return Number(next.toFixed(2));
    });
  };

  // Reset transforms
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setIsFlipped(false);
  };

  // Export cropped canvas & upload to server
  const handleSaveCrop = async () => {
    if (!imgNaturalSize) return;
    setIsProcessing(true);
    setProcessError(null);

    try {
      const { outW, outH } = currentConfig;
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Gagal menginisialisasi canvas grafis.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ratio between export canvas size and interactive viewport
      const R = outW / viewW;

      // 1. Move to canvas center
      ctx.translate(outW / 2, outH / 2);

      // 2. Apply user pan (scaled to output resolution)
      ctx.translate(clampedPanX * R, clampedPanY * R);

      // 3. Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // 4. Apply flip
      if (isFlipped) {
        ctx.scale(-1, 1);
      }

      // 5. Draw image centered
      const drawW = imgNaturalSize.width * scale * R;
      const drawH = imgNaturalSize.height * scale * R;

      // Gunakan image element yang sudah dimuat di DOM atau load baru sebagai cadangan
      let imageToDraw: HTMLImageElement;
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        imageToDraw = imgRef.current;
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Gagal memuat gambar untuk proses crop."));
          img.src = safeImageSrc;
        });
        imageToDraw = img;
      }

      ctx.drawImage(imageToDraw, -drawW / 2, -drawH / 2, drawW, drawH);

      // Convert canvas to Blob (JPEG 90%)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Gagal mengonversi hasil potongan gambar."));
          },
          "image/jpeg",
          0.9
        );
      });

      // Prepare file for upload
      const fileToUpload = new File([blob], `pengajar-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Upload via existing /api/psb/upload route
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "pengajar");

      const uploadRes = await fetch("/api/psb/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.ok) {
        throw new Error(uploadData.error || "Gagal mengunggah foto ke server.");
      }

      // Successful upload
      onSave(uploadData.url);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses foto.";
      setProcessError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Change file handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChangeImage) {
      onChangeImage(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col my-auto max-h-[96vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Sesuaikan Foto Profil Pengajar
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Social Media Editor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Geser, perbesar (zoom), dan putar foto agar pas & rapi di kartu pengajar website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Viewport + Controls + Live Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Viewport & Primary Canvas Interaction (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Aspect Ratio Selector Chips */}
            <div className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
              {(Object.keys(ASPECT_RATIO_CONFIGS) as AspectRatioType[]).map((key) => {
                const conf = ASPECT_RATIO_CONFIGS[key];
                const active = aspectRatio === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setAspectRatio(key);
                      setPan({ x: 0, y: 0 });
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      active
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Viewport Frame Box */}
            <div className="relative w-full flex items-center justify-center py-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 select-none shadow-inner overflow-hidden min-h-[420px]">
              {/* Responsive Container for Viewport */}
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUpOrCancel}
                onPointerCancel={handlePointerUpOrCancel}
                onWheel={handleWheel}
                style={{
                  width: `${viewW}px`,
                  height: `${viewH}px`,
                  touchAction: "none",
                }}
                className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/80 shadow-2xl cursor-grab active:cursor-grabbing bg-slate-900"
              >
                {/* Visual Glow around crop frame */}
                <div className="absolute inset-0 ring-4 ring-black/40 pointer-events-none z-10 rounded-2xl" />

                {/* Transformed Image Container */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: imgNaturalSize ? `${imgNaturalSize.width * scale}px` : "100%",
                    height: imgNaturalSize ? `${imgNaturalSize.height * scale}px` : "100%",
                    transform: `translate(-50%, -50%) translate(${clampedPanX}px, ${clampedPanY}px) rotate(${rotation}deg) scaleX(${
                      isFlipped ? -1 : 1
                    })`,
                    transformOrigin: "center center",
                    transition: isDraggingRef.current ? "none" : "transform 0.05s ease-out",
                  }}
                >
                  {/* Actual Image Element */}
                  <img
                    ref={imgRef}
                    src={safeImageSrc}
                    alt="Editor"
                    onLoad={handleImageLoad}
                    onError={() => setImgLoadError("Gagal memuat gambar. Silakan coba file lain.")}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "none",
                      display: "block",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* Rule of Thirds (3x3) Grid Overlay */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-b border-white/25" />
                    <div className="border-r border-white/25" />
                    <div className="border-r border-white/25" />
                    <div />
                  </div>
                )}

                {/* Face & Head Silhouette Guide (Help user center face) */}
                {showFaceGuide && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center p-6">
                    {/* Oval head guide */}
                    <div className="w-32 h-44 rounded-[50%] border-2 border-dashed border-emerald-400/50 shadow-sm" />
                    {/* Shoulder arch guide */}
                    <div className="w-48 h-16 border-t-2 border-dashed border-emerald-400/40 rounded-t-full mt-2" />
                  </div>
                )}

                {/* Floating Hint Pill */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-10">
                  <span className="text-[10px] bg-black/60 text-white/90 backdrop-blur-md px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
                    <Move size={11} className="text-emerald-400" /> Geser &amp; Cubit/Scroll untuk Zoom
                  </span>
                </div>
              </div>
            </div>

            {/* Viewport Control Bar (Zoom, Rotate, Flip, Reset) */}
            <div className="w-full mt-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  title="Perkecil (Zoom Out)"
                  onClick={() => setZoom((z) => Math.max(1.0, Number((z - 0.1).toFixed(2))))}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors shrink-0"
                >
                  <ZoomOut size={16} />
                </button>

                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-right">
                    {zoom.toFixed(2)}x
                  </span>
                </div>

                <button
                  type="button"
                  title="Perbesar (Zoom In)"
                  onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors shrink-0"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Action Buttons: Rotate & Flip */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    title="Putar 90° Berlawanan Arah Jarum Jam"
                  >
                    <RotateCcw size={14} /> -90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    title="Putar 90° Searah Jarum Jam"
                  >
                    <RotateCw size={14} /> +90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlipped((f) => !f)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isFlipped
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    }`}
                    title="Cermin / Balik Kiri-Kanan"
                  >
                    <FlipHorizontal size={14} /> Cermin
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Kembalikan Posisi & Zoom Awal"
                >
                  <ResetIcon size={13} /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Previews & Helper Guides (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Guide Toggles */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Alat Bantu Bingkai
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGrid((g) => !g)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    showGrid
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <Grid size={14} /> Grid 3x3
                </button>
                <button
                  type="button"
                  onClick={() => setShowFaceGuide((f) => !f)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    showFaceGuide
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <User size={14} /> Panduan Wajah
                </button>
              </div>
            </div>

            {/* REAL-TIME LIVE PREVIEWS */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Pratinjau Hasil Nyata di Website
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. Preview on Teacher Card */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 flex flex-col">
                  {/* Mock card photo area */}
                  <div
                    className="relative w-full overflow-hidden bg-gray-100"
                    style={{ height: "135px" }}
                  >
                    {/* Mirroring crop preview */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: imgNaturalSize
                          ? `${(imgNaturalSize.width * scale * 140) / viewW}px`
                          : "100%",
                        height: imgNaturalSize
                          ? `${(imgNaturalSize.height * scale * 135) / viewH}px`
                          : "100%",
                        transform: `translate(-50%, -50%) translate(${
                          (clampedPanX / viewW) * 140
                        }px, ${(clampedPanY / viewH) * 135}px) rotate(${rotation}deg) scaleX(${
                          isFlipped ? -1 : 1
                        })`,
                        transformOrigin: "center center",
                      }}
                    >
                      <img
                        src={safeImageSrc}
                        alt="Mini Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "none",
                          display: "block",
                          pointerEvents: "none",
                        }}
                      />
                    </div>

                    {/* Small badge */}
                    <span className="absolute top-1.5 left-1.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/95 text-emerald-800 shadow">
                      {isPimpinan ? "Pimpinan" : "Pengajar"}
                    </span>
                  </div>

                  {/* Mock card text */}
                  <div className="p-2 bg-white">
                    <p className="text-[9px] font-bold text-emerald-800 line-clamp-1">
                      {jabatanPengajar || "Ustadz"}
                    </p>
                    <h4 className="text-[10px] font-extrabold text-gray-900 line-clamp-1">
                      {namaPengajar || "Nama Pengajar"}
                    </h4>
                  </div>
                  <div className="px-2 pb-1.5 text-[9px] text-gray-400 text-center border-t border-gray-100">
                    Kartu Landing Page
                  </div>
                </div>

                {/* 2. Preview Circular Avatar */}
                <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 flex flex-col items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">Avatar Bulat</div>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg relative bg-slate-950">
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: imgNaturalSize
                          ? `${(imgNaturalSize.width * scale * 80) / viewW}px`
                          : "100%",
                        height: imgNaturalSize
                          ? `${(imgNaturalSize.height * scale * 80) / viewH}px`
                          : "100%",
                        transform: `translate(-50%, -50%) translate(${
                          (clampedPanX / viewW) * 80
                        }px, ${(clampedPanY / viewH) * 80}px) rotate(${rotation}deg) scaleX(${
                          isFlipped ? -1 : 1
                        })`,
                        transformOrigin: "center center",
                      }}
                    >
                      <img
                        src={safeImageSrc}
                        alt="Avatar Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "none",
                          display: "block",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-2 text-center">
                    Tampilan Profil Lingkaran
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Photography Tips */}
            <div className="bg-emerald-950/40 border border-emerald-850/60 p-3.5 rounded-2xl text-xs text-emerald-200/90 leading-relaxed flex items-start gap-2.5">
              <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block mb-0.5">Tips Komposisi Pas:</strong>
                Posisikan mata ustadz/ustadzah pada garis sepertiga atas grid 3x3 agar tampilan foto
                terlihat berwibawa, profesional, dan proporsional.
              </div>
            </div>

            {/* Error Message if any */}
            {(imgLoadError || processError) && (
              <div className="bg-red-950/70 border border-red-800 p-3.5 rounded-2xl text-xs text-red-200 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{imgLoadError || processError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20">
          <div>
            {onChangeImage && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  <Upload size={14} /> Ganti File Foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isProcessing || !!imgLoadError}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-lg shadow-emerald-950/50 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #059669, #0f766e)",
              }}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses &amp; Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Terapkan &amp; Simpan Foto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
