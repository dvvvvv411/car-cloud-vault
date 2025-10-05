import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { brandingSchema, type BrandingFormData, generateSlug } from '@/lib/validation/brandingSchema';
import type { Branding } from '@/hooks/useBranding';

interface BrandingFormProps {
  branding?: Branding;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BrandingForm = ({ branding, onSuccess, onCancel }: BrandingFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kanzleiLogo, setKanzleiLogo] = useState<File | null>(null);
  const [lawyerPhoto, setLawyerPhoto] = useState<File | null>(null);
  const [courtPdf, setCourtPdf] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: branding ? {
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
    } : {
      is_active: true,
    },
  });

  const companyName = watch('company_name');
  const isActive = watch('is_active');

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
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
        courtPdfUrl = await uploadFile(courtPdf, 'pdfs');
      }

      const brandingData = {
        slug,
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
              Slug: /insolvenz/{generateSlug(companyName)}
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
          <Label>Kanzlei-Logo</Label>
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
          <Label>Anwaltsfoto</Label>
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
      </div>

      {/* Lawyer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Anwaltsinformationen</h3>
        
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
          <Label htmlFor="lawyer_firm_name">Kanzleiname *</Label>
          <Input
            id="lawyer_firm_name"
            {...register('lawyer_firm_name')}
            placeholder="KBS Rechtsanwälte"
          />
          {errors.lawyer_firm_name && (
            <p className="text-sm text-destructive mt-1">{errors.lawyer_firm_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lawyer_firm_subtitle">Kanzlei-Untertitel</Label>
          <Input
            id="lawyer_firm_subtitle"
            {...register('lawyer_firm_subtitle')}
            placeholder="Küpper Bredehöft Schwencker PartG"
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
