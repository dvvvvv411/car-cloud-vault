import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageDropZoneProps {
  images: string[];
  onImagesChange: (files: File[]) => void;
  onRemove: (index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  label?: string;
}

interface SortableImageProps {
  image: string;
  index: number;
  onRemove: (index: number) => void;
}

function SortableImage({ image, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `image-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group aspect-square cursor-move"
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
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  );
}

export const ImageDropZone = ({
  images,
  onImagesChange,
  onRemove,
  onReorder,
  label = "Bilder hochladen"
}: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = parseInt(active.id.toString().replace('image-', ''));
      const newIndex = parseInt(over.id.toString().replace('image-', ''));
      onReorder(oldIndex, newIndex);
    }
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((_, index) => `image-${index}`)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-5 gap-4">
              {images.map((image, index) => (
                <SortableImage
                  key={`image-${index}`}
                  image={image}
                  index={index}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
