import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferPayload {
  inquiryId: string;
}

interface BestellungData {
  kunde: {
    name: string;
    adresse: string;
    plz: string;
    stadt: string;
    geschaeftsfuehrer: string;
  };
  dekra_nummern: string[];
  rabatt: {
    aktiv: boolean;
    prozent: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inquiryId } = await req.json() as TransferPayload;
    
    console.log('Processing transfer for inquiry:', inquiryId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const inquiryResponse = await fetch(
      `${supabaseUrl}/rest/v1/inquiries?id=eq.${inquiryId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!inquiryResponse.ok) {
      throw new Error('Failed to fetch inquiry');
    }

    const inquiries = await inquiryResponse.json();
    const inquiry = inquiries[0];

    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    console.log('Inquiry data:', inquiry);

    const isPrivate = inquiry.customer_type === 'private';
    const fullName = `${inquiry.first_name} ${inquiry.last_name}`;
    
    const bestellungData: BestellungData = {
      kunde: {
        name: isPrivate ? fullName : inquiry.company_name,
        adresse: inquiry.street,
        plz: inquiry.zip_code,
        stadt: inquiry.city,
        geschaeftsfuehrer: fullName,
      },
      dekra_nummern: inquiry.selected_vehicles.map((v: any) => v.report_nr),
      rabatt: {
        aktiv: inquiry.discount_percentage !== null && inquiry.discount_percentage > 0,
        prozent: inquiry.discount_percentage || 0,
      },
    };

    console.log('Sending to external API:', bestellungData);

    const externalApiResponse = await fetch(
      'https://rjjkbnglizodcsjtqicq.supabase.co/functions/v1/create-bestellung-api',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bestellungData),
      }
    );

    if (!externalApiResponse.ok) {
      const errorText = await externalApiResponse.text();
      console.error('External API error:', errorText);
      throw new Error(`External API failed: ${externalApiResponse.status} - ${errorText}`);
    }

    const result = await externalApiResponse.json();
    console.log('External API success:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in transfer function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
