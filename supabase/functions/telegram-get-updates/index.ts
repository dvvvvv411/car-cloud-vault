// Helper to discover chat IDs the bot has seen, and to send test messages.
// The bot token is read from the Supabase secret TELEGRAM_BOT_TOKEN.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatInfo {
  id: number | string
  type: string
  title?: string
  username?: string
  first_name?: string
  last_name?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, chatId, text } = body as {
      action?: 'get_updates' | 'send_test'
      chatId?: string
      text?: string
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'TELEGRAM_BOT_TOKEN ist nicht konfiguriert. Bitte in den Supabase Edge Function Secrets hinterlegen.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const baseUrl = `https://api.telegram.org/bot${botToken}`

    if (action === 'send_test') {
      if (!chatId) {
        return new Response(
          JSON.stringify({ success: false, error: 'missing_chat_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const resp = await fetch(`${baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text || '✅ <b>Test-Nachricht</b>\nDeine Telegram-Integration funktioniert!',
          parse_mode: 'HTML',
        }),
      })
      const respText = await resp.text()
      if (!resp.ok) {
        return new Response(
          JSON.stringify({ success: false, error: respText, status: resp.status }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Default: get_updates → list chats
    const resp = await fetch(`${baseUrl}/getUpdates?timeout=0&limit=100`)
    const data = await resp.json()

    if (!resp.ok || !data.ok) {
      return new Response(
        JSON.stringify({ success: false, error: data.description || 'telegram_error', status: resp.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const seen = new Map<string, ChatInfo>()
    for (const upd of data.result || []) {
      const msg = upd.message || upd.channel_post || upd.my_chat_member
      const chat = msg?.chat
      if (!chat) continue
      const key = String(chat.id)
      if (!seen.has(key)) {
        seen.set(key, {
          id: chat.id,
          type: chat.type,
          title: chat.title,
          username: chat.username,
          first_name: chat.first_name,
          last_name: chat.last_name,
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, chats: Array.from(seen.values()) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
