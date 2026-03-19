'use client';
import { useRef, useState } from 'react';
import type { UploadFormState } from '@/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const MAX_SIZE_MB = 10;
const MAX_PHOTOS = 20;
const MAX_PX = 900;
const JPEG_QUALITY = 0.72;

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface Props {
  state: UploadFormState;
  update: (patch: Partial<UploadFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPhotos({ state, update, onNext, onBack }: Props) {
  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const errors: string[] = [];
    const raw: File[] = [];

    Array.from(files).forEach(f => {
      if (!ALLOWED_TYPES.includes(f.type) && !f.name.match(/\.(heic|heif)$/i)) {
        errors.push(`${f.name}: unsupported type`); return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${f.name}: exceeds 10 MB`); return;
      }
      raw.push(f);
    });

    if (!raw.length) return;
    setCompressing(true);

    // Compress all valid files in parallel
    const compressed = await Promise.all(
      raw.map(f => f.type === 'image/heic' || f.name.match(/\.heic$/i) ? Promise.resolve(f) : compressImage(f))
    );

    const previews = compressed.map(f => URL.createObjectURL(f));
    const combined        = [...state.photos, ...compressed].slice(0, MAX_PHOTOS);
    const combinedPreviews = [...state.photoPreviewUrls, ...previews].slice(0, MAX_PHOTOS);

    setCompressing(false);
    update({ photos: combined, photoPreviewUrls: combinedPreviews });
  };

  const removePhoto = (index: number) => {
    update({
      photos:           state.photos.filter((_, i) => i !== index),
      photoPreviewUrls: state.photoPreviewUrls.filter((_, i) => i !== index),
    });
  };

  const canNext = state.photos.length >= 1 && !compressing;

  return (
    <div>
      <h2 className="text-xl font-bold text-keeper-navy mb-2">Add photos</h2>
      <p className="text-sm text-gray-500 mb-4">Min 1, max 20 photos. JPG, PNG or HEIC. Max 10 MB each.</p>

      {/* Camera and gallery buttons */}
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={state.photos.length >= MAX_PHOTOS || compressing}
          className="flex-1 py-3 rounded-xl border-2 border-keeper-blue text-keeper-blue font-medium text-sm hover:bg-keeper-blueLight transition-colors disabled:opacity-40"
        >
          📷 Take Photo
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={state.photos.length >= MAX_PHOTOS || compressing}
          className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-medium text-sm hover:border-keeper-blue transition-colors disabled:opacity-40"
        >
          🖼️ Choose from Gallery
        </button>
      </div>

      {/* Hidden inputs */}
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />
      <input ref={galleryRef} type="file" accept="image/*,.heic,.heif" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />

      {/* Compression indicator */}
      {compressing && (
        <div className="flex items-center gap-2 text-sm text-keeper-blue mb-3">
          <div className="w-4 h-4 border-2 border-keeper-blue border-t-transparent rounded-full animate-spin" />
          Compressing photos…
        </div>
      )}

      {/* Thumbnails */}
      {state.photoPreviewUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {state.photoPreviewUrls.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} className="w-20 h-20 object-cover rounded-xl" alt={`Photo ${i + 1}`} />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center"
              >×</button>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-400 mb-6">{state.photos.length} / {MAX_PHOTOS} photos added</p>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary">Back</button>
        <button onClick={onNext} disabled={!canNext} className="btn-primary">Continue</button>
      </div>
    </div>
  );
}
