import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EventType =
  | 'new_inquiry'
  | 'moechte_rgkv'
  | 'rgkv_sent'
  | 'amtsgericht_ready'

const EVENT_HEADER: Record<EventType, string> = {
  new_inquiry: '🆕 <b>Neue Anfrage</b>',
  moechte_rgkv: '📝 <b>Status: Möchte RG/KV</b>',
  rgkv_sent: '📤 <b>Status: RG/KV gesendet</b>',
  amtsgericht_ready: '⚖️ <b>Status: Amtsgericht Ready</b>',
}

const EVENT_FLAG_COL: Record<EventType, string> = {
  new_inquiry: 'notify_new_inquiry',
  moechte_rgkv: 'notify_moechte_rgkv',
  rgkv_sent: 'notify_rgkv_sent',
  amtsgericht_ready: 'notify_amtsgericht_ready',
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { inquiryId, eventType } = (await req.json()) as {
      inquiryId: string
      eventType: EventType
    }
    console.log('[telegram] event=%s inquiry=%s', eventType, inquiryId)

    if (!inquiryId || !eventType || !(eventType in EVENT_HEADER)) {
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      console.warn('[telegram] TELEGRAM_BOT_TOKEN not configured, skip')
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'bot_token_missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: inquiry, error: inqErr } = await supabase
      .from('inquiries')
      .select(
        'id, first_name, last_name, company_name, phone, total_price, branding_id'
      )
      .eq('id', inquiryId)
      .single()

    if (inqErr || !inquiry) {
      console.warn('[telegram] inquiry not found', inqErr)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'inquiry_not_found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }


    // Load global telegram settings
    const { data: settings, error: settingsErr } = await supabase
      .from('telegram_settings')
      .select('chat_id, notify_new_inquiry, notify_moechte_rgkv, notify_rgkv_sent, notify_amtsgericht_ready')
      .eq('id', 1)
      .single()

    if (settingsErr || !settings) {
      console.warn('[telegram] settings row not found', settingsErr)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'settings_missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!settings.chat_id) {
      console.log('[telegram] no global chat_id, skip')
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'no_chat_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const flagCol = EVENT_FLAG_COL[eventType]
    if ((settings as any)[flagCol] === false) {
      console.log('[telegram] event disabled, skip:', flagCol)
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'event_disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Branding info just for the message body
    let brandingLabel = ''
    if (inquiry.branding_id) {
      const { data: branding } = await supabase
        .from('brandings')
        .select('company_name, lawyer_firm_name')
        .eq('id', inquiry.branding_id)
        .single()
      if (branding) {
        brandingLabel = branding.company_name || branding.lawyer_firm_name || ''
      }
    }

    // Build message
    const fullName = `${inquiry.first_name ?? ''} ${inquiry.last_name ?? ''}`.trim() || '—'
    const lines: string[] = []
    lines.push(EVENT_HEADER[eventType])
    lines.push('')
    lines.push(`👤 <b>Name:</b> ${escapeHtml(fullName)}`)
    if (inquiry.company_name) {
      lines.push(`🏢 <b>Firma:</b> ${escapeHtml(inquiry.company_name)}`)
    }
    if (brandingLabel) {
      lines.push(`🎨 <b>Branding:</b> ${escapeHtml(brandingLabel)}`)
    }
    lines.push(`📞 <b>Telefon:</b> ${escapeHtml(inquiry.phone || '—')}`)
    const netto = Number(inquiry.total_price ?? 0)
    lines.push(`💶 <b>Nettopreis:</b> ${escapeHtml(formatEur(netto))}`)

    const text = lines.join('\n')

    const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    const resp = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.chat_id,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    const respText = await resp.text()
    if (!resp.ok) {
      console.error('[telegram] api error', resp.status, respText)
      return new Response(
        JSON.stringify({ success: false, error: respText, status: resp.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[telegram] sent ok')
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[telegram] unexpected', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
