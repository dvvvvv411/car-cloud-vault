import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SEVEN_API_URL = 'https://gateway.seven.io/api/sms'

/**
 * Normalize a German-centric phone number to strict E.164 format.
 * Mirrors the logic of send-inquiry-confirmation-sms.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let s = String(raw).replace(/[\s\-/().\\]+/g, '')
  if (!s) return null

  const hasPlus = s.startsWith('+')
  s = (hasPlus ? '+' : '') + s.replace(/[^\d]/g, '')

  if (s.startsWith('+')) {
    // already international
  } else if (s.startsWith('0049')) {
    s = '+' + s.slice(2)
  } else if (s.startsWith('49') && s.length >= 11 && s.length <= 15) {
    s = '+' + s
  } else if (s.startsWith('0')) {
    s = '+49' + s.slice(1)
  } else {
    return null
  }

  if (!/^\+\d{8,15}$/.test(s)) return null
  return s
}

function renderTemplate(
  tpl: string,
  data: { vorname: string; nachname: string; kanzlei: string; telefon: string }
): string {
  return tpl
    .replaceAll('{vorname}', data.vorname)
    .replaceAll('{nachname}', data.nachname)
    .replaceAll('{kanzlei}', data.kanzlei)
    .replaceAll('{telefon}', data.telefon)
}

const DEFAULT_TEMPLATE =
  'Hallo {vorname}, Ihre Vertragsunterlagen wurden soeben per E-Mail an Sie versendet. Bitte pruefen Sie Ihr Postfach (auch Spam). Ihr Team {kanzlei}'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { inquiryId } = await req.json()
    console.log('[docs-sms] processing inquiryId=%s', inquiryId)

    if (!inquiryId) {
      return new Response(
        JSON.stringify({ success: false, error: 'inquiryId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Load inquiry (incl. branding_id)
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id, first_name, last_name, phone, branding_id')
      .eq('id', inquiryId)
      .single()

    if (inquiryError || !inquiry) {
      console.warn('[docs-sms] inquiry not found, skip', inquiryError)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'inquiry_not_found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!inquiry.branding_id) {
      console.log('[docs-sms] no branding on inquiry, skip')
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'no_branding' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Load branding
    const { data: branding, error: brandingError } = await supabase
      .from('brandings')
      .select(
        'id, lawyer_firm_name, lawyer_phone, seven_api_key, sms_sender_name, sms_documents_sent_template'
      )
      .eq('id', inquiry.branding_id)
      .single()

    if (brandingError || !branding) {
      console.warn('[docs-sms] branding not found, skip', brandingError)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'branding_not_found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!branding.seven_api_key || !branding.sms_sender_name) {
      console.log('[docs-sms] sms not configured for branding, skip')
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'sms_not_configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const to = normalizePhone(inquiry.phone)
    if (!to) {
      console.warn('[docs-sms] invalid phone, skip:', inquiry.phone)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'invalid_phone' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tpl = branding.sms_documents_sent_template || DEFAULT_TEMPLATE
    let text = renderTemplate(tpl, {
      vorname: inquiry.first_name || '',
      nachname: inquiry.last_name || '',
      kanzlei: branding.lawyer_firm_name || '',
      telefon: branding.lawyer_phone || '',
    })
    if (text.length > 160) text = text.slice(0, 160)

    const body = new URLSearchParams({
      to,
      text,
      from: branding.sms_sender_name,
    })

    console.log('[docs-sms] sending to=%s from=%s len=%d', to, branding.sms_sender_name, text.length)

    const resp = await fetch(SEVEN_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': branding.seven_api_key,
        'SentWith': 'Lovable',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body,
    })

    const respText = await resp.text()
    let respJson: any = null
    try {
      respJson = JSON.parse(respText)
    } catch {
      // not JSON
    }

    if (!resp.ok) {
      console.error('[docs-sms] seven.io error', resp.status, respText)
      return new Response(
        JSON.stringify({ success: false, error: respText, status: resp.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ok = respJson && (respJson.success === '100' || respJson.success === 100)
    if (!ok) {
      console.warn('[docs-sms] seven.io non-100 response', respJson || respText)
    }

    console.log('[docs-sms] sent ok', respJson || respText)
    return new Response(
      JSON.stringify({ success: true, response: respJson ?? respText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[docs-sms] unexpected error', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
