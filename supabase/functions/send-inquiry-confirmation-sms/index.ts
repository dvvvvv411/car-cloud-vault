import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SEVEN_API_URL = 'https://gateway.seven.io/api/sms'

/**
 * Normalize a German-centric phone number to strict E.164 format.
 *
 * Steps:
 *  1. Strip all whitespace and common separators (-, /, (, ), \, .)
 *  2. Remove any remaining non-digit chars except a leading "+"
 *  3. German prefix handling:
 *     - "+49..."     -> kept as-is
 *     - "0049..."    -> "+49..."
 *     - "49..."      -> "+49..."  (only if length plausible, no leading 0/+)
 *     - "0..."       -> "+49..."  (drop the leading 0, German national format)
 *     - any other "+..." -> kept as-is (other country)
 *  4. Validate "+<8-15 digits>" — otherwise return null.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  // 1) strip whitespace + common separators
  let s = String(raw).replace(/[\s\-/().\\]+/g, '')
  if (!s) return null

  // 2) keep leading + if present, strip everything except digits
  const hasPlus = s.startsWith('+')
  s = (hasPlus ? '+' : '') + s.replace(/[^\d]/g, '')

  // 3) German normalization
  if (s.startsWith('+')) {
    // already international — keep as is
  } else if (s.startsWith('0049')) {
    s = '+' + s.slice(2) // 0049... -> +49...
  } else if (s.startsWith('49') && s.length >= 11 && s.length <= 15) {
    s = '+' + s
  } else if (s.startsWith('0')) {
    s = '+49' + s.slice(1)
  } else {
    // unknown shape, give up
    return null
  }

  // 4) validate
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
  'Hallo {vorname}, vielen Dank fuer Ihre Anfrage. Wir melden uns in Kuerze telefonisch bei Ihnen. Ihr Team {kanzlei}'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { inquiryId, brandingId } = await req.json()
    console.log('[sms] processing inquiryId=%s brandingId=%s', inquiryId, brandingId)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Load branding
    const { data: branding, error: brandingError } = await supabase
      .from('brandings')
      .select(
        'id, lawyer_firm_name, lawyer_phone, seven_api_key, sms_sender_name, sms_confirmation_template'
      )
      .eq('id', brandingId)
      .single()

    if (brandingError || !branding) {
      console.warn('[sms] branding not found, skip', brandingError)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'branding_not_found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!branding.seven_api_key || !branding.sms_sender_name) {
      console.log('[sms] sms not configured for branding, skip')
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'sms_not_configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Load inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id, first_name, last_name, phone')
      .eq('id', inquiryId)
      .single()

    if (inquiryError || !inquiry) {
      console.warn('[sms] inquiry not found, skip', inquiryError)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'inquiry_not_found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const to = normalizePhone(inquiry.phone)
    if (!to) {
      console.warn('[sms] invalid phone, skip:', inquiry.phone)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'invalid_phone' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tpl = branding.sms_confirmation_template || DEFAULT_TEMPLATE
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

    console.log('[sms] sending to=%s from=%s len=%d', to, branding.sms_sender_name, text.length)

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
      console.error('[sms] seven.io error', resp.status, respText)
      return new Response(
        JSON.stringify({ success: false, error: respText, status: resp.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // seven.io success returns success: "100"
    const ok = respJson && (respJson.success === '100' || respJson.success === 100)
    if (!ok) {
      console.warn('[sms] seven.io non-100 response', respJson || respText)
    }

    console.log('[sms] sent ok', respJson || respText)
    return new Response(
      JSON.stringify({ success: true, response: respJson ?? respText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[sms] unexpected error', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
