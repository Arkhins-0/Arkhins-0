'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';

/** Modal library: upload or click an existing file to use its URL. */
export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#1c1633]/50 p-4 pt-16" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Media library" className="adm-card w-full max-w-4xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Pick an image</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="adm-btn">
            <X size={14} />
          </button>
        </div>
        <MediaLibrary onPick={onPick} />
      </div>
    </div>,
    document.body
  );
}
