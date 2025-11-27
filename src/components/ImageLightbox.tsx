import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  isOpen: boolean;
}

export function ImageLightbox({ images, initialIndex, onClose, isOpen }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Container der sich an Bildgröße anpasst */}
      <div 
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bild mit schwarzem Hintergrund nur um das Bild selbst */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          <img
            src={images[currentIndex]}
            alt={`Bild ${currentIndex + 1} von ${images.length}`}
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />
          
          {/* Image Counter - innerhalb des Bild-Containers */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
        
        {/* Close Button - an der Ecke des Bild-Containers */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 z-50 bg-black/80 text-white hover:bg-black rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Navigation Buttons - außerhalb, links und rechts */}
      {images.length > 1 && (
        <>
          <Button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            variant="ghost"
            size="icon"
            className="absolute left-4 z-50 bg-black/60 text-white hover:bg-black/80 h-12 w-12 rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            variant="ghost"
            size="icon"
            className="absolute right-4 z-50 bg-black/60 text-white hover:bg-black/80 h-12 w-12 rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}
