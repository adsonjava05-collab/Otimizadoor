import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';

export interface ScreenshotCrop {
  sourceWidth: number;
  top: number;
  width: number;
  height: number;
}

interface TutorialScreenshotProps {
  src: string;
  alt: string;
  crop?: ScreenshotCrop;
  large?: boolean;
}

export function TutorialScreenshot({ src, alt, crop, large }: TutorialScreenshotProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className={large ? 'p-1' : 'p-3'}>
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label="Ampliar imagem"
        className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-slate-900"
        style={crop ? { aspectRatio: `${crop.width} / ${crop.height}` } : undefined}
      >
        <img
          src={src}
          alt={alt}
          className={
            crop
              ? 'block w-full max-w-none'
              : large
                ? 'block h-auto w-full object-contain'
                : 'block max-h-[70vh] w-auto max-w-full object-contain'
          }
          style={
            crop
              ? { marginTop: `${(-crop.top / crop.sourceWidth) * 100}%` }
              : large
                ? { maxHeight: 'min(450px, calc(90vh - 200px))' }
                : undefined
          }
        />
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
          <Maximize2 className="h-3 w-3" />
          Ampliar
        </span>
      </button>

      {zoomed &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setZoomed(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          >
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="Fechar imagem ampliada"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={src}
              alt={alt}
              className="h-auto w-auto max-w-full object-contain"
              style={{ maxHeight: large ? 'min(450px, calc(90vh - 32px))' : '320px' }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
