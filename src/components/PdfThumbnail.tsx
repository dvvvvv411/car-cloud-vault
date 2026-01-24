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

  // For A4 portrait PDFs in landscape containers: scale by width to fill horizontally
  // PDF will overflow vertically and get cropped by overflow-hidden
  const renderWidth = width ? width * 1.2 : 300;

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
      {/* Scale PDF by width only - vertical overflow gets cropped */}
      <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
        <Document
          file={pdfUrl}
          onLoadSuccess={() => setIsLoading(false)}
          onLoadError={() => setLoadError(true)}
          loading={null}
        >
          <Page 
            pageNumber={1} 
            width={renderWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};
