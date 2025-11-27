import React from 'https://esm.sh/react@18.3.1'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { render } from 'https://esm.sh/@react-email/render@0.0.17'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts'
import { FahrzeugeInquiryConfirmationEmail } from './_templates/fahrzeuge-inquiry-confirmation.tsx'

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
    
    console.log('Processing Fahrzeuge email confirmation for inquiry:', inquiryId, 'branding:', brandingId)
    
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
    
    // 4. Convert logo to Base64 with compression if needed
    let logoBase64: string | null = null
    if (branding.kanzlei_logo_url) {
      try {
        const logoResponse = await fetch(branding.kanzlei_logo_url)
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.arrayBuffer()
          const originalSize = logoBlob.byteLength
          console.log('Original logo size:', originalSize, 'bytes')
          
          let finalImageData: Uint8Array
          let contentType: string
          
          // Compress if larger than 50KB
          if (originalSize > 50000) {
            console.log('Compressing logo...')
            const image = await Image.decode(new Uint8Array(logoBlob))
            
            // Resize to max 400px width if larger
            if (image.width > 400) {
              const aspectRatio = image.height / image.width
              image.resize(400, Math.round(400 * aspectRatio))
              console.log('Resized to:', image.width, 'x', image.height)
            }
            
            // Encode as JPEG with 80% quality
            finalImageData = await image.encodeJPEG(80)
            contentType = 'image/jpeg'
            console.log('Compressed logo size:', finalImageData.byteLength, 'bytes')
          } else {
            // Use original if small enough
            finalImageData = new Uint8Array(logoBlob)
            contentType = logoResponse.headers.get('content-type') || 'image/png'
          }
          
          const base64String = btoa(
            finalImageData.reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          )
          logoBase64 = `data:${contentType};base64,${base64String}`
          console.log('Logo embedded successfully')
        }
      } catch (logoError) {
        console.error('Failed to process logo:', logoError)
        // Continue without logo
      }
    }
    
    // 5. Render email template
    const html = render(
      React.createElement(FahrzeugeInquiryConfirmationEmail, {
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
      subject: `Bestätigung Ihrer Fahrzeuganfrage - ${branding.company_name}`,
      html,
    })
    
    if (emailError) {
      console.error('Resend error:', emailError)
      throw emailError
    }
    
    console.log('Fahrzeuge email sent successfully:', emailData)
    
    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailData?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error sending Fahrzeuge confirmation email:', error)
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
