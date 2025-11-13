import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Alle Anfragen ohne Anrede holen
    const { data: inquiries, error: fetchError } = await supabase
      .from('inquiries')
      .select('id, first_name, salutation, status')
      .is('salutation', null)
      .neq('status', 'Kein Interesse');

    if (fetchError) throw fetchError;

    console.log(`Found ${inquiries?.length || 0} inquiries without salutation (excluding "Kein Interesse" status)`);

    if (!inquiries || inquiries.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No inquiries to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updatedCount = 0;
    let errors = [];
    const assignments = [];

    // Batch-Verarbeitung für bessere Performance
    for (const inquiry of inquiries) {
      try {
        // KI-Anfrage an Lovable AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'Du bist ein Experte für deutsche Vornamen. Antworte NUR mit "Herr" oder "Frau", nichts anderes.'
              },
              {
                role: 'user',
                content: `Ist "${inquiry.first_name}" ein männlicher oder weiblicher Vorname? Antworte nur mit "Herr" oder "Frau".`
              }
            ],
            temperature: 0.1,
            max_tokens: 10
          })
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for ${inquiry.first_name}:`, aiResponse.status);
          errors.push({ id: inquiry.id, name: inquiry.first_name, error: 'AI API error' });
          continue;
        }

        const aiData = await aiResponse.json();
        const salutationText = aiData.choices?.[0]?.message?.content?.trim();
        
        // Validierung und Normalisierung
        let salutation: 'Herr' | 'Frau';
        if (salutationText?.includes('Herr')) {
          salutation = 'Herr';
        } else if (salutationText?.includes('Frau')) {
          salutation = 'Frau';
        } else {
          // Fallback: Bei Unsicherheit männliche Anrede verwenden
          console.warn(`Unclear salutation for ${inquiry.first_name}: "${salutationText}", using Herr as fallback`);
          salutation = 'Herr';
        }

        // Datenbank aktualisieren
        const { error: updateError } = await supabase
          .from('inquiries')
          .update({ salutation })
          .eq('id', inquiry.id);

        if (updateError) {
          console.error(`Update error for ${inquiry.id}:`, updateError);
          errors.push({ id: inquiry.id, name: inquiry.first_name, error: updateError.message });
        } else {
          updatedCount++;
          const assignment = {
            id: inquiry.id,
            name: inquiry.first_name,
            salutation: salutation
          };
          assignments.push(assignment);
          console.log(`✅ Updated ${inquiry.first_name} → ${salutation}`);
        }

        // Rate limiting: 100ms Pause zwischen Anfragen
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing inquiry ${inquiry.id}:`, error);
        errors.push({ id: inquiry.id, name: inquiry.first_name, error: String(error) });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Salutation assignment completed',
        total: inquiries.length,
        updated: updatedCount,
        errors: errors.length,
        errorDetails: errors,
        assignments: assignments
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
