import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'
import { InquiryConfirmationEmail } from './_templates/inquiry-confirmation.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { inquiryId, brandingId } = await req.json()
    
    console.log('Processing email confirmation for inquiry:', inquiryId, 'branding:', brandingId)
    
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
    
    // 3. Load inquiry data
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single()
    
    if (inquiryError || !inquiry) {
      console.error('Inquiry not found:', inquiryError)
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Inquiry not found' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }
    
    // 4. Convert logo to Base64 if available
    let logoBase64 = null
    if (branding.kanzlei_logo_url) {
      try {
        const logoResponse = await fetch(branding.kanzlei_logo_url)
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.arrayBuffer()
          const base64String = btoa(
            new Uint8Array(logoBlob).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          )
          // Detect content type from response or default to png
          const contentType = logoResponse.headers.get('content-type') || 'image/png'
          logoBase64 = `data:${contentType};base64,${base64String}`
        }
      } catch (logoError) {
        console.error('Failed to fetch logo:', logoError)
        // Continue without logo
      }
    }
    
    // 5. Render email template
    const html = await renderAsync(
      React.createElement(InquiryConfirmationEmail, {
        branding,
        inquiry,
        vehicles: inquiry.selected_vehicles,
        logoBase64,
      })
    )
    
    // 6. Send email via Resend
    const resend = new Resend(branding.resend_api_key)
    const senderName = branding.resend_sender_name || branding.lawyer_firm_name
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${senderName} <${branding.resend_sender_email}>`,
      to: [inquiry.email],
      subject: `Bestätigung Ihrer Anfrage - ${branding.company_name}`,
      html,
    })
    
    if (emailError) {
      console.error('Resend error:', emailError)
      throw emailError
    }
    
    console.log('Email sent successfully:', emailData)
    
    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailData?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})