import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// PDF.js Worker konfigurieren
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfThumbnailProps {
  pdfUrl: string;
  fallbackImage: string;
  className?: string;
  height?: number;
  onClick?: () => void;
}

export const PdfThumbnail = ({ 
  pdfUrl, 
  fallbackImage, 
  className = '',
  height = 128,
  onClick
}: PdfThumbnailProps) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (loadError || !pdfUrl) {
    return (
      <img 
        src={fallbackImage} 
        alt="Gerichtsbeschluss" 
        className={className}
        onClick={onClick}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {isLoading && (
        <img 
          src={fallbackImage} 
          alt="Gerichtsbeschluss" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <Document
        file={pdfUrl}
        onLoadSuccess={() => setIsLoading(false)}
        onLoadError={() => setLoadError(true)}
        loading={null}
      >
        <Page 
          pageNumber={1} 
          height={height}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
};
