import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2, Upload, X, FileSignature } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { brandingSchema, type BrandingFormData, generateSlug } from '@/lib/validation/brandingSchema';
import type { Branding } from '@/hooks/useBranding';
import { AdminEmailSignatureDialog } from './AdminEmailSignatureDialog';

interface BrandingFormProps {
  branding?: Branding;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BrandingForm = ({ branding, onSuccess, onCancel }: BrandingFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandingType, setBrandingType] = useState<'insolvenz' | 'fahrzeuge'>(
    branding?.branding_type || 'insolvenz'
  );
  const [kanzleiLogo, setKanzleiLogo] = useState<File | null>(null);
  const [lawyerPhoto, setLawyerPhoto] = useState<File | null>(null);
  const [courtPdf, setCourtPdf] = useState<File | null>(null);
  const [adminEmailSignature, setAdminEmailSignature] = useState<string>(
    branding?.admin_email_signature || ''
  );
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: branding ? {
      branding_type: branding.branding_type || 'insolvenz',
      company_name: branding.company_name,
      case_number: branding.case_number,
      lawyer_name: branding.lawyer_name,
      lawyer_firm_name: branding.lawyer_firm_name,
      lawyer_firm_subtitle: branding.lawyer_firm_subtitle || '',
      lawyer_address_street: branding.lawyer_address_street,
      lawyer_address_city: branding.lawyer_address_city,
      lawyer_email: branding.lawyer_email,
      lawyer_phone: branding.lawyer_phone,
      lawyer_website_url: branding.lawyer_website_url,
      is_active: branding.is_active,
      resend_api_key: branding.resend_api_key || '',
      resend_sender_email: branding.resend_sender_email || '',
      resend_sender_name: branding.resend_sender_name || '',
      admin_email: branding.admin_email || '',
      admin_email_signature: branding.admin_email_signature || '',
    } : {
      is_active: true,
    },
  });

  const companyName = watch('company_name');
  const isActive = watch('is_active');

  const uploadFile = async (file: File, folder: string, companyName?: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    let fileName: string;
    
    // Special naming for court decision PDFs
    if (folder === 'pdfs' && companyName) {
      const sanitizedName = generateSlug(companyName);
      fileName = `Gerichtsbeschluss_${sanitizedName}.${fileExt}`;
    } else {
      fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    }
    
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('branding-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('branding-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const migrateOldPdfName = async (oldUrl: string, companyName: string): Promise<string> => {
    try {
      // Extract old file path from URL
      const urlParts = oldUrl.split('/');
      const oldFileName = urlParts[urlParts.length - 1];
      const oldFilePath = `pdfs/${oldFileName}`;
      
      // Generate new filename
      const sanitizedName = generateSlug(companyName);
      const newFileName = `Gerichtsbeschluss_${sanitizedName}.pdf`;
      const newFilePath = `pdfs/${newFileName}`;
      
      // Check if already migrated (file already has correct name)
      if (oldFileName === newFileName) {
        return oldUrl;
      }
      
      // Download old file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('branding-assets')
        .download(oldFilePath);
        
      if (downloadError) throw downloadError;
      
      // Upload with new name
      const { error: uploadError } = await supabase.storage
        .from('branding-assets')
        .upload(newFilePath, fileData, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get new public URL
      const { data: { publicUrl } } = supabase.storage
        .from('branding-assets')
        .getPublicUrl(newFilePath);
      
      // Delete old file
      await supabase.storage
        .from('branding-assets')
        .remove([oldFilePath]);
      
      return publicUrl;
    } catch (error) {
      console.error('PDF migration failed:', error);
      // If migration fails, keep old URL
      return oldUrl;
    }
  };

  const onSubmit = async (data: BrandingFormData) => {
    setIsSubmitting(true);
    try {
      const slug = generateSlug(data.company_name);

      // Upload files if provided
      let kanzleiLogoUrl = branding?.kanzlei_logo_url || null;
      let lawyerPhotoUrl = branding?.lawyer_photo_url || null;
      let courtPdfUrl = branding?.court_decision_pdf_url || null;

      if (kanzleiLogo) {
        kanzleiLogoUrl = await uploadFile(kanzleiLogo, 'logos');
      }
      if (lawyerPhoto) {
        lawyerPhotoUrl = await uploadFile(lawyerPhoto, 'lawyers');
      }
      if (courtPdf) {
        courtPdfUrl = await uploadFile(courtPdf, 'pdfs', data.company_name);
      } else if (branding?.court_decision_pdf_url) {
        // Migrate existing PDF to new naming format
        courtPdfUrl = await migrateOldPdfName(branding.court_decision_pdf_url, data.company_name);
      }

      const brandingData = {
        slug,
        branding_type: brandingType,
        company_name: data.company_name,
        case_number: data.case_number,
        kanzlei_logo_url: kanzleiLogoUrl,
        lawyer_photo_url: lawyerPhotoUrl,
        court_decision_pdf_url: courtPdfUrl,
        lawyer_name: data.lawyer_name,
        lawyer_firm_name: data.lawyer_firm_name,
        lawyer_firm_subtitle: data.lawyer_firm_subtitle || null,
        lawyer_address_street: data.lawyer_address_street,
        lawyer_address_city: data.lawyer_address_city,
        lawyer_email: data.lawyer_email,
        lawyer_phone: data.lawyer_phone,
        lawyer_website_url: data.lawyer_website_url,
        is_active: data.is_active,
        resend_api_key: data.resend_api_key || null,
        resend_sender_email: data.resend_sender_email || null,
        resend_sender_name: data.resend_sender_name || null,
        admin_email: data.admin_email || null,
        admin_email_signature: data.admin_email_signature || null,
      };

      if (branding) {
        const { error } = await supabase
          .from('brandings')
          .update(brandingData)
          .eq('id', branding.id);

        if (error) throw error;
        toast({ title: 'Branding erfolgreich aktualisiert' });
      } else {
        const { error } = await supabase
          .from('brandings')
          .insert(brandingData);

        if (error) throw error;
        toast({ title: 'Branding erfolgreich erstellt' });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Branding Type Selection */}
      <div className="space-y-4 bg-muted/30 p-4 rounded-lg border-2 border-primary/20">
        <h3 className="text-lg font-semibold text-primary">Branding-Typ auswählen</h3>
        <div>
          <Label htmlFor="branding_type">Typ *</Label>
          <select
            id="branding_type"
            value={brandingType}
            onChange={(e) => {
              const newType = e.target.value as 'insolvenz' | 'fahrzeuge';
              setBrandingType(newType);
              setValue('branding_type', newType);
            }}
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="insolvenz">Insolvenz (Kanzlei)</option>
            <option value="fahrzeuge">Fahrzeuge (Verkäufer)</option>
          </select>
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Firmeninformationen</h3>
        
        <div>
          <Label htmlFor="company_name">Unternehmensname *</Label>
          <Input
            id="company_name"
            {...register('company_name')}
            placeholder="TZ-West GmbH"
          />
          {companyName && (
            <p className="text-sm text-muted-foreground mt-1">
              Slug: /{brandingType}/{generateSlug(companyName)}
            </p>
          )}
          {errors.company_name && (
            <p className="text-sm text-destructive mt-1">{errors.company_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="case_number">Aktenzeichen *</Label>
          <Input
            id="case_number"
            {...register('case_number')}
            placeholder="Az: 502 IN 14/25"
          />
          {errors.case_number && (
            <p className="text-sm text-destructive mt-1">{errors.case_number.message}</p>
          )}
        </div>
      </div>

      {/* File Uploads */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Assets</h3>
        
        <div>
          <Label>{brandingType === 'insolvenz' ? 'Kanzlei-Logo' : 'Marke-Logo'}</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => setKanzleiLogo(e.target.files?.[0] || null)}
            />
            {kanzleiLogo && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setKanzleiLogo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {branding?.kanzlei_logo_url && !kanzleiLogo && (
            <p className="text-sm text-muted-foreground mt-1">Aktuelles Logo vorhanden</p>
          )}
        </div>

        <div>
          <Label>{brandingType === 'insolvenz' ? 'Anwaltsfoto' : 'Verkäuferfoto'}</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => setLawyerPhoto(e.target.files?.[0] || null)}
            />
            {lawyerPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLawyerPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {branding?.lawyer_photo_url && !lawyerPhoto && (
            <p className="text-sm text-muted-foreground mt-1">Aktuelles Foto vorhanden</p>
          )}
        </div>

        {brandingType === 'insolvenz' && (
          <div>
            <Label>Gerichtsbeschluss PDF</Label>
            <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setCourtPdf(e.target.files?.[0] || null)}
            />
            {courtPdf && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCourtPdf(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
            {branding?.court_decision_pdf_url && !courtPdf && (
              <p className="text-sm text-muted-foreground mt-1">Aktuelles PDF vorhanden</p>
            )}
          </div>
        )}
      </div>

      {/* Lawyer/Seller Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{brandingType === 'insolvenz' ? 'Anwaltsinformationen' : 'Verkäuferinformationen'}</h3>
        
        <div>
          <Label htmlFor="lawyer_name">Name *</Label>
          <Input
            id="lawyer_name"
            {...register('lawyer_name')}
            placeholder="Mark Steh"
          />
          {errors.lawyer_name && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lawyer_firm_name">{brandingType === 'insolvenz' ? 'Kanzleiname *' : 'Autohändler Name *'}</Label>
          <Input
            id="lawyer_firm_name"
            {...register('lawyer_firm_name')}
            placeholder={brandingType === 'insolvenz' ? 'KBS Rechtsanwälte' : 'Auto Müller GmbH'}
          />
          {errors.lawyer_firm_name && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_firm_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lawyer_firm_subtitle">{brandingType === 'insolvenz' ? 'Kanzlei-Untertitel' : 'Position'}</Label>
          <Input
            id="lawyer_firm_subtitle"
            {...register('lawyer_firm_subtitle')}
            placeholder={brandingType === 'insolvenz' ? 'Küpper Bredehöft Schwencker PartG' : 'Verkaufsleiter'}
          />
        </div>

        <div>
          <Label htmlFor="lawyer_address_street">Straße & Hausnummer *</Label>
          <Input
            id="lawyer_address_street"
            {...register('lawyer_address_street')}
            placeholder="Speldorfer Str. 2"
          />
          {errors.lawyer_address_street && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_address_street.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lawyer_address_city">PLZ & Stadt *</Label>
          <Input
            id="lawyer_address_city"
            {...register('lawyer_address_city')}
            placeholder="40239 Düsseldorf"
          />
          {errors.lawyer_address_city && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_address_city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lawyer_email">E-Mail *</Label>
          <Input
            id="lawyer_email"
            type="email"
            {...register('lawyer_email')}
            placeholder="m.steh@kbs-kanzlei.de"
          />
          {errors.lawyer_email && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lawyer_phone">Telefon *</Label>
          <Input
            id="lawyer_phone"
            {...register('lawyer_phone')}
            placeholder="0211 54262200"
          />
          {errors.lawyer_phone && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lawyer_website_url">Website *</Label>
          <Input
            id="lawyer_website_url"
            type="url"
            {...register('lawyer_website_url')}
            placeholder="https://kbs-kanzlei.de"
          />
          {errors.lawyer_website_url && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_website_url.message}</p>
          )}
        </div>
      </div>

      {/* Resend Email Configuration */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">E-Mail Konfiguration (Resend)</h3>
          <p className="text-sm text-muted-foreground">
            Konfigurieren Sie den E-Mail-Versand für Bestätigungen (optional)
          </p>
        </div>
        
        <div>
          <Label htmlFor="resend_api_key">Resend API Key</Label>
          <Input
            id="resend_api_key"
            type="password"
            {...register('resend_api_key')}
            placeholder="re_..."
          />
          {errors.resend_api_key && (
            <p className="text-sm text-destructive mt-1">{errors.resend_api_key.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="resend_sender_email">Absender E-Mail</Label>
          <Input
            id="resend_sender_email"
            type="email"
            {...register('resend_sender_email')}
            placeholder="kontakt@kanzlei.de"
          />
          {errors.resend_sender_email && (
            <p className="text-sm text-destructive mt-1">{errors.resend_sender_email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="resend_sender_name">Absender Name</Label>
          <Input
            id="resend_sender_name"
            {...register('resend_sender_name')}
            placeholder="Kanzlei Mustermann"
          />
          {errors.resend_sender_name && (
            <p className="text-sm text-destructive mt-1">{errors.resend_sender_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="admin_email">Verwaltungs E-Mail</Label>
          <Input
            id="admin_email"
            type="email"
            {...register('admin_email')}
            placeholder="verwaltung@kanzlei.de"
          />
          {errors.admin_email && (
            <p className="text-sm text-destructive mt-1">{errors.admin_email.message}</p>
          )}
          
          {/* Admin Email Signature Button & Status */}
          <div className="space-y-2">
            <AdminEmailSignatureDialog
              signature={adminEmailSignature}
              onSave={(signature) => {
                setAdminEmailSignature(signature);
                setValue('admin_email_signature', signature);
              }}
            />
            {adminEmailSignature && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-green-600" />
                E-Mail-Signatur gesetzt ({adminEmailSignature.length} Zeichen)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Aktiv</Label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {branding ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
};
