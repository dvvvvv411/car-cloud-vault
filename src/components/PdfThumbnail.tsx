import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// PDF.js Worker konfigurieren
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfThumbnailProps {
  pdfUrl: string;
  fallbackImage: string;
  className?: string;
  height?: number;
  width?: number;
  onClick?: () => void;
}

export const PdfThumbnail = ({ 
  pdfUrl, 
  fallbackImage, 
  className = '',
  height,
  width,
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

  // Scale factor for "cover" effect - render larger than container
  const scaleFactor = 1.5;

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      onClick={onClick}
      style={{ 
        height: height ? `${height}px` : undefined,
        width: width ? `${width}px` : '100%'
      }}
    >
      {isLoading && (
        <img 
          src={fallbackImage} 
          alt="Gerichtsbeschluss" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Render PDF larger and center for "cover" effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Document
          file={pdfUrl}
          onLoadSuccess={() => setIsLoading(false)}
          onLoadError={() => setLoadError(true)}
          loading={null}
          className="min-w-full min-h-full flex items-center justify-center"
        >
          <Page 
            pageNumber={1} 
            width={width ? width * scaleFactor : undefined}
            height={height ? height * scaleFactor : undefined}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};
