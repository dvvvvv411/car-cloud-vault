import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  email?: string;
  password: string;
  brandingSlug: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, brandingSlug }: RequestBody = await req.json();

    // Validate input
    if (!password || !brandingSlug) {
      return new Response(
        JSON.stringify({ success: false, error: 'Passwort und Branding-Slug erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for master password first
    if (password === 'admin777') {
      console.log('Master password used for access');
      return new Response(
        JSON.stringify({ success: true, isMasterPassword: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get branding ID from slug
    const { data: branding, error: brandingError } = await supabase
      .from('brandings')
      .select('id')
      .eq('slug', brandingSlug)
      .single();

    if (brandingError || !branding) {
      console.error('Branding not found:', brandingError);
      return new Response(
        JSON.stringify({ success: false, error: 'Branding nicht gefunden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify lead credentials
    let query = supabase
      .from('leads')
      .select('id, has_logged_in, login_count')
      .eq('password', password)
      .eq('branding_id', branding.id);

    // If email is provided, also filter by email
    if (email) {
      query = query.eq('email', email.toLowerCase().trim());
    }

    const { data: lead, error: leadError } = await query.maybeSingle();

    if (leadError || !lead) {
      console.error('Lead verification failed:', leadError);
      return new Response(
        JSON.stringify({ success: false, error: 'Ungültiges Passwort' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update login tracking
    const now = new Date().toISOString();
    const updateData: any = {
      has_logged_in: true,
      last_login_at: now,
      login_count: (lead.login_count || 0) + 1,
    };

    // Set first_login_at if this is the first login
    if (!lead.has_logged_in) {
      updateData.first_login_at = now;
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead.id);

    if (updateError) {
      console.error('Failed to update login tracking:', updateError);
    }

    console.log(`Lead ${lead.id} logged in successfully. Login count: ${updateData.login_count}`);

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-lead-password:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Interner Serverfehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
