import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendDocumentsEmailRequest {
  inquiryId: string;
  brandingId: string;
  documents: {
    rechnung: { base64: string; filename: string };
    kaufvertrag: { base64: string; filename: string };
    treuhandvertrag: { base64: string; filename: string };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      inquiryId,
      brandingId,
      documents,
    }: SendDocumentsEmailRequest = await req.json();

    console.log("Processing email send for inquiry:", inquiryId);

    // Supabase client initialisieren
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Branding Daten laden
    const { data: branding, error: brandingError } = await supabase
      .from("brandings")
      .select("resend_api_key, resend_sender_email, resend_sender_name, admin_email, admin_email_signature, lawyer_name, case_number")
      .eq("id", brandingId)
      .single();

    if (brandingError || !branding) {
      throw new Error("Branding nicht gefunden");
    }

    if (!branding.resend_api_key) {
      throw new Error("Resend API Key nicht konfiguriert für dieses Branding");
    }

    if (!branding.admin_email) {
      throw new Error("Verwaltungs-Email (admin_email) ist nicht konfiguriert für dieses Branding");
    }

    // Inquiry Daten laden
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select("salutation, first_name, last_name, email, selected_vehicles, customer_type")
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      throw new Error("Anfrage nicht gefunden");
    }

    console.log("Inquiry data:", { salutation: inquiry.salutation, vehicleCount: inquiry.selected_vehicles?.length });

    // Email Template laden basierend auf Anzahl Fahrzeuge und Geschlecht
    const vehicleCount = inquiry.selected_vehicles?.length || 0;
    const countType = vehicleCount === 1 ? "single" : "multiple";
    const genderType = inquiry.salutation === "Herr" ? "male" : "female";
    const templateType = `${countType}_${genderType}`;

    console.log("Loading template type:", templateType);

    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("subject, body")
      .eq("template_type", templateType)
      .is("branding_id", null)
      .single();

    if (templateError || !template) {
      throw new Error(`Email Template ${templateType} nicht gefunden`);
    }

    // Variablen im Template ersetzen
    let emailSubject = template.subject
      .replace(/%NACHNAME%/g, inquiry.last_name.trim())
      .replace(/%ANWALT_NAME%/g, branding.lawyer_name.trim())
      .replace(/%AKTENZEICHEN%/g, branding.case_number);

    let emailBody = template.body
      .replace(/%NACHNAME%/g, inquiry.last_name.trim())
      .replace(/%ANWALT_NAME%/g, branding.lawyer_name.trim())
      .replace(/%AKTENZEICHEN%/g, branding.case_number);

    // HTML formatieren (NUR für den Body, NICHT für die Signatur)
    let emailHtml = emailBody.replace(/\n/g, "<br>");

    // Email Signatur als HTML anhängen (ohne extra \n Konvertierung)
    if (branding.admin_email_signature) {
      emailHtml += `<br><br>${branding.admin_email_signature}`;
    }

    // Resend initialisieren
    const resend = new Resend(branding.resend_api_key);

    // Email mit Attachments senden
    const emailResponse = await resend.emails.send({
      from: branding.resend_sender_name 
        ? `${branding.resend_sender_name} <${branding.admin_email}>`
        : branding.admin_email,
      to: [inquiry.email],
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: documents.rechnung.filename,
          content: documents.rechnung.base64,
        },
        {
          filename: documents.kaufvertrag.filename,
          content: documents.kaufvertrag.base64,
        },
        {
          filename: documents.treuhandvertrag.filename,
          content: documents.treuhandvertrag.base64,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email erfolgreich versendet"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-documents-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
