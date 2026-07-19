// ═══════════════════════════════════════════════
// NUKRAX — worker.js
// Main Worker entry. Static site assets are served automatically by
// the `assets` binding for any request that matches a file. This
// handler only runs for requests with no matching static asset —
// in practice, just POST /api/chat.
//
// The AI reply comes from Cloudflare Workers AI (the `AI` binding),
// which runs an open-weight model (Llama 3.3 70B) directly on
// Cloudflare's infrastructure. It's included free on every Workers
// account — 10,000 Neurons/day at no cost, no separate signup, no
// API key, no billing setup required. Heavy traffic beyond the daily
// free allocation would start incurring Cloudflare's low per-Neuron
// rate, but typical site-chat volume stays within the free amount.
// ═══════════════════════════════════════════════

import { buildSystemPrompt } from './assets/ai/ai-data.js';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MAX_TOKENS = 700;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    // Anything else with no matching static asset: 404.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  }
};

async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const mode = body.mode === 'general' ? 'general' : 'nukrax';
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!messages.length) {
    return json({ error: 'No messages provided.' }, 400);
  }
  if (messages.length > 30) {
    return json({ error: 'Conversation too long for this request.' }, 400);
  }

  const cleanMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (!cleanMessages.length) {
    return json({ error: 'No valid messages provided.' }, 400);
  }

  if (!env.AI) {
    return json({ error: 'AI binding is not configured. Add an `ai` block to wrangler.jsonc and redeploy.' }, 500);
  }

  try {
    const result = await env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: buildSystemPrompt(mode) },
        ...cleanMessages
      ],
      max_tokens: MAX_TOKENS
    });

    const reply = (result && (result.response || result.result?.response) || '').trim()
      || "I couldn't generate a reply just now — please try again.";

    return json({ reply });
  } catch (err) {
    console.error('Workers AI error:', err);
    return json({ error: 'The AI service is temporarily unavailable.' }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

