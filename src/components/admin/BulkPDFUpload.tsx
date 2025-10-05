import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUp, CheckCircle2, AlertTriangle, XCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type UploadStatus = {
  filename: string;
  reportNr: string | null;
  status: 'pending' | 'uploading' | 'success' | 'warning' | 'error';
  message?: string;
  vehicleInfo?: { brand: string; model: string };
};

interface BulkPDFUploadProps {
  onComplete: () => void;
}

export function BulkPDFUpload({ onComplete }: BulkPDFUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseReportNr = (filename: string): string | null => {
    const match = filename.match(/^(\d+)_dekra_report\.pdf$/);
    return match ? match[1] : null;
  };

  const validateFiles = (fileList: File[]): File[] => {
    return fileList.filter(file => {
      if (!file.name.endsWith('.pdf')) return false;
      if (file.size > 10 * 1024 * 1024) return false; // 10MB limit
      return parseReportNr(file.name) !== null;
    });
  };

  const handleFileSelect = (selectedFiles: File[]) => {
    const validFiles = validateFiles(selectedFiles);
    setFiles(validFiles);
    
    const initialStatuses: UploadStatus[] = validFiles.map(file => ({
      filename: file.name,
      reportNr: parseReportNr(file.name),
      status: 'pending',
    }));
    setUploadStatuses(initialStatuses);

    if (validFiles.length < selectedFiles.length) {
      toast({
        title: "Warnung",
        description: `${selectedFiles.length - validFiles.length} Datei(en) wurden übersprungen (ungültiges Format oder zu groß).`,
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadPDF = async (file: File, reportNr: string) => {
    const fileName = `${reportNr}.pdf`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vehicle-reports')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('vehicle-reports')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reportNr = uploadStatuses[i].reportNr;

      if (!reportNr) {
        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? { 
            ...status, 
            status: 'error', 
            message: 'Ungültige Berichtsnummer' 
          } : status
        ));
        errorCount++;
        continue;
      }

      // Update status to uploading
      setUploadStatuses(prev => prev.map((status, idx) => 
        idx === i ? { ...status, status: 'uploading' } : status
      ));

      try {
        // Find vehicle by report_nr
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, brand, model, report_nr')
          .eq('report_nr', reportNr)
          .maybeSingle();

        if (vehicleError) throw vehicleError;

        if (!vehicle) {
          setUploadStatuses(prev => prev.map((status, idx) => 
            idx === i ? { 
              ...status, 
              status: 'warning', 
              message: `Kein Fahrzeug mit Bericht-Nr. ${reportNr} gefunden` 
            } : status
          ));
          warningCount++;
          continue;
        }

        // Upload PDF
        const pdfUrl = await uploadPDF(file, vehicle.report_nr);

        // Update vehicle with PDF URL
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ dekra_url: pdfUrl })
          .eq('id', vehicle.id);

        if (updateError) throw updateError;

        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? { 
            ...status, 
            status: 'success', 
            message: `${vehicle.brand} ${vehicle.model}`,
            vehicleInfo: { brand: vehicle.brand, model: vehicle.model }
          } : status
        ));
        successCount++;

      } catch (error) {
        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? { 
            ...status, 
            status: 'error', 
            message: 'Upload fehlgeschlagen' 
          } : status
        ));
        errorCount++;
      }
    }

    setIsUploading(false);

    // Show summary toast
    if (successCount > 0) {
      toast({
        title: "Upload abgeschlossen",
        description: `${successCount} von ${files.length} PDFs erfolgreich hochgeladen${warningCount > 0 ? `, ${warningCount} nicht zugeordnet` : ''}`,
      });
    } else {
      toast({
        title: "Upload fehlgeschlagen",
        description: "Keine PDFs konnten hochgeladen werden.",
        variant: "destructive",
      });
    }

    // Auto-close after success
    if (successCount > 0 && errorCount === 0 && warningCount === 0) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'uploading':
        return <Upload className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <FileUp className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const progress = uploadStatuses.length > 0 
    ? (uploadStatuses.filter(s => s.status !== 'pending').length / uploadStatuses.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
          }
        `}
      >
        <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          PDFs per Drag & Drop hier ablegen
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          oder klicken zum Auswählen
        </p>
        <p className="text-xs text-muted-foreground">
          Format: <code className="bg-muted px-2 py-1 rounded">{"[zahl]_dekra_report.pdf"}</code>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => handleFileSelect(Array.from(e.target.files || []))}
          className="hidden"
        />
      </div>

      {/* Progress */}
      {uploadStatuses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {uploadStatuses.filter(s => s.status !== 'pending').length} von {uploadStatuses.length} verarbeitet
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* File List */}
      {uploadStatuses.length > 0 && (
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-3">
            {uploadStatuses.map((status, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50"
              >
                <div className="mt-0.5">{getStatusIcon(status.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{status.filename}</p>
                  {status.reportNr && (
                    <p className="text-xs text-muted-foreground">
                      Bericht-Nr: {status.reportNr}
                    </p>
                  )}
                  {status.message && (
                    <p className={`text-xs mt-1 ${
                      status.status === 'success' ? 'text-green-600' :
                      status.status === 'warning' ? 'text-yellow-600' :
                      status.status === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {status.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setFiles([]);
            setUploadStatuses([]);
          }}
          disabled={isUploading || files.length === 0}
        >
          Zurücksetzen
        </Button>
        <Button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? 'Hochladen...' : `${files.length} PDF${files.length !== 1 ? 's' : ''} hochladen`}
        </Button>
      </div>
    </div>
  );
}
