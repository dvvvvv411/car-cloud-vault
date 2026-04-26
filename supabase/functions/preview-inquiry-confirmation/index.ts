import React from 'https://esm.sh/react@18.3.1'
import { render } from 'https://esm.sh/@react-email/render@0.0.17'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'
import { InquiryConfirmationEmail } from './_templates/inquiry-confirmation.tsx'
import { FahrzeugeInquiryConfirmationEmail } from './_templates/fahrzeuge-inquiry-confirmation.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_INQUIRY = {
  id: 'preview-demo',
  customer_type: 'private',
  salutation: 'Herr',
  first_name: 'Max',
  last_name: 'Mustermann',
  company_name: null,
  street: 'Musterstraße 1',
  zip_code: '10115',
  city: 'Berlin',
  email: 'max.mustermann@example.com',
  phone: '+49 30 1234567',
  message: 'Beispieltext einer Anfrage – dies ist nur eine Vorschau.',
  total_price: 32500,
  status: 'Neu',
  created_at: new Date().toISOString(),
  selected_vehicles: [
    {
      chassis: 'WBADEMO12345678901',
      brand: 'BMW',
      model: '320d Touring',
      price: 18500,
      kilometers: 84500,
      first_registration: '03/2019',
      report_nr: 'DEMO-001',
    },
    {
      chassis: 'WAUDEMO22345678902',
      brand: 'Audi',
      model: 'A4 Avant',
      price: 14000,
      kilometers: 102300,
      first_registration: '07/2018',
      report_nr: 'DEMO-002',
    },
  ],
}

async function fetchLogoBase64(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    if (buf.byteLength > 200000) return null
    const base64 = btoa(
      new Uint8Array(buf).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    const contentType = res.headers.get('content-type') || 'image/png'
    return `data:${contentType};base64,${base64}`
  } catch (_e) {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Auth-Check: nur eingeloggte Admins
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: roleRows } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle()
    if (!roleRows) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { brandingId, system, inquiryId } = await req.json()

    if (!brandingId || (system !== 'insolvenz' && system !== 'fahrzeuge')) {
      return new Response(
        JSON.stringify({ error: 'brandingId und system (insolvenz|fahrzeuge) erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: branding, error: brandingError } = await admin
      .from('brandings')
      .select('*')
      .eq('id', brandingId)
      .single()

    if (brandingError || !branding) {
      return new Response(JSON.stringify({ error: 'Branding nicht gefunden' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let inquiry: any = DEMO_INQUIRY
    if (inquiryId) {
      const { data: inq } = await admin
        .from('inquiries')
        .select('*')
        .eq('id', inquiryId)
        .maybeSingle()
      if (inq) inquiry = inq
    }

    const logoBase64 = await fetchLogoBase64(branding.kanzlei_logo_url)

    const Template =
      system === 'fahrzeuge' ? FahrzeugeInquiryConfirmationEmail : InquiryConfirmationEmail

    const html = render(
      React.createElement(Template, {
        branding,
        inquiry,
        vehicles: Array.isArray(inquiry.selected_vehicles) ? inquiry.selected_vehicles : [],
        logoBase64,
      })
    )

    const subject =
      system === 'fahrzeuge'
        ? `Bestätigung Ihrer Fahrzeuganfrage - ${branding.company_name}`
        : `Bestätigung Ihrer Anfrage - ${branding.company_name}`

    return new Response(
      JSON.stringify({ html, subject, isDemo: !inquiryId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('preview-inquiry-confirmation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
