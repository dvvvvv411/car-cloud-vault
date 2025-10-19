import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageDropZoneProps {
  images: string[];
  onImagesChange: (files: File[]) => void;
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  label?: string;
}

export const ImageDropZone = ({
  images,
  onImagesChange,
  onRemove,
  onReorder,
  label = "Bilder hochladen"
}: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    onImagesChange(files);
  }, [onImagesChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    onImagesChange(files);
  }, [onImagesChange]);

  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (!onReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, [onReorder]);

  const handleImageDragEnter = useCallback((e: React.DragEvent, index: number) => {
    if (!onReorder || draggedIndex === null) return;
    e.preventDefault();
    setDraggedOverIndex(index);
  }, [onReorder, draggedIndex]);

  const handleImageDragEnd = useCallback(() => {
    if (!onReorder || draggedIndex === null || draggedOverIndex === null || draggedIndex === draggedOverIndex) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);
      return;
    }
    onReorder(draggedIndex, draggedOverIndex);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  }, [onReorder, draggedIndex, draggedOverIndex]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          {label} ({images.length} Bilder)
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Drag & Drop oder klicken zum Auswählen
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id={`file-upload-${label}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
        >
          Bilder auswählen
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`relative group aspect-square ${onReorder ? 'cursor-move' : ''} ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${
                draggedOverIndex === index ? 'ring-2 ring-primary' : ''
              }`}
              draggable={!!onReorder}
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragEnter={(e) => handleImageDragEnter(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleImageDragEnd}
            >
              <img
                src={image}
                alt={`Bild ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
