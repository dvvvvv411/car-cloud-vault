import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  salutation?: 'Herr' | 'Frau' | null;
  brandingId?: string;
  customerType: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  street: string;
  zipCode: string;
  city: string;
  email: string;
  phone: string;
  message?: string;
  selectedVehicles: Array<{
    chassis: string;
    brand: string;
    model: string;
    price: number;
    kilometers: number;
    first_registration: string;
    report_nr: string;
  }>;
  totalPrice: number;
  leadId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const requestData: InquiryRequest = await req.json();
    console.log("Received inquiry submission:", {
      email: requestData.email,
      vehicleCount: requestData.selectedVehicles.length,
      totalPrice: requestData.totalPrice,
    });

    // Insert inquiry into database
    const { data: inquiryData, error: inquiryError } = await supabaseClient
      .from("inquiries")
      .insert({
        salutation: requestData.salutation || null,
        branding_id: requestData.brandingId || null,
        customer_type: requestData.customerType,
        company_name: requestData.companyName || null,
        first_name: requestData.firstName,
        last_name: requestData.lastName,
        street: requestData.street,
        zip_code: requestData.zipCode,
        city: requestData.city,
        email: requestData.email,
        phone: requestData.phone,
        message: requestData.message || null,
        selected_vehicles: requestData.selectedVehicles,
        total_price: requestData.totalPrice,
        status: "Neu",
        lead_id: requestData.leadId || null,
      })
      .select()
      .single();

    if (inquiryError) {
      console.error("Error inserting inquiry:", inquiryError);
      throw inquiryError;
    }

    console.log("Inquiry created successfully:", inquiryData.id);

    // Update lead if leadId is provided
    if (requestData.leadId && inquiryData) {
      const { error: leadUpdateError } = await supabaseClient
        .from("leads")
        .update({ inquiry_id: inquiryData.id })
        .eq("id", requestData.leadId);

      if (leadUpdateError) {
        console.error("Error updating lead:", leadUpdateError);
        // Don't throw, this is not critical
      } else {
        console.log("Lead updated successfully");
      }
    }

    // Send confirmation email if branding is configured
    if (requestData.brandingId && inquiryData) {
      try {
        const { error: emailError } = await supabaseClient.functions.invoke(
          "send-inquiry-confirmation",
          {
            body: {
              inquiryId: inquiryData.id,
              brandingId: requestData.brandingId,
            },
          }
        );

        if (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't throw, email is not critical for inquiry submission
        } else {
          console.log("Confirmation email sent successfully");
        }
      } catch (emailError) {
        console.error("Failed to invoke email function:", emailError);
        // Don't block the success flow if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inquiryId: inquiryData.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-inquiry function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
