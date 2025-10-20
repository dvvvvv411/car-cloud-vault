import React from 'https://esm.sh/react@18.3.1'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { render } from 'https://esm.sh/@react-email/render@0.0.17'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'
import { ColdCallInterestEmail } from '../send-cold-call-interest-email/_templates/cold-call-interest.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { leadId, email, password, brandingId, callerId } = await req.json()
    
    console.log('Processing quick send email for lead:', leadId)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 1. Load branding data
    const { data: branding, error: brandingError } = await supabase
      .from('brandings')
      .select('*')
      .eq('id', brandingId)
      .single()
    
    if (brandingError || !branding) {
      console.error('Branding not found:', brandingError)
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Branding not found' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }
    
    // 2. Check if Resend is configured
    if (!branding.resend_api_key || !branding.resend_sender_email) {
      console.log('Resend not configured for this branding')
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Resend not configured' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // 3. Load caller data
    const { data: caller, error: callerError } = await supabase
      .from('cold_call_callers')
      .select('first_name, last_name')
      .eq('id', callerId)
      .single()
    
    if (callerError || !caller) {
      console.error('Caller not found:', callerError)
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Caller not found' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }
    
    // 4. Render email template (SAME as cold call interest email)
    const html = render(
      React.createElement(ColdCallInterestEmail, {
        branding,
        caller,
        password,
        brandingSlug: branding.slug,
      })
    )
    
    // 5. Send email via Resend
    const resend = new Resend(branding.resend_api_key)
    const senderName = branding.resend_sender_name || branding.lawyer_firm_name
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${senderName} <${branding.resend_sender_email}>`,
      to: [email],
      subject: `Informationen zur Insolvenz der ${branding.company_name} – Übernahmemöglichkeiten`,
      html,
    })
    
    if (emailError) {
      console.error('Resend error:', emailError)
      throw emailError
    }
    
    console.log('Quick send email sent successfully:', emailData)
    
    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailData?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error sending quick send email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
