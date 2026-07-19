// ═══════════════════════════════════════════════
// NUKRAX AI — responder.js
// Local, offline answer engine for "Nukrax Assistant" mode.
// Runs entirely in the browser — no network call, no API, no
// Workers AI usage, so there is no daily limit and no cost, ever —
// for anything that matches the known NUKRAX data (FAQ, EAs,
// contact, pages). getNukraxResponse() returns a string for a
// confident match, or `null` when nothing matches closely enough —
// callers should fall back to the free Workers AI model (still
// grounded in NUKRAX facts via the system prompt) for that case,
// so specific/unusual questions still get a real answer instead of
// a canned deflection.
// ═══════════════════════════════════════════════

import { NUKRAX_KNOWLEDGE } from './ai-data.js';

const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','do','does','did',
  'i','you','he','she','it','we','they','me','my','your','his','her','its','our','their',
  'to','of','in','on','at','for','with','about','as','by','from','into','over','under',
  'and','or','but','if','so','because','than','then','this','that','these','those',
  'what','when','where','which','who','whom','how','why','can','could','will','would',
  'should','shall','may','might','must','have','has','had','not','no','yes','please',
  'just','really','also','there','here','up','down','out','off','again','once','some',
  'any','all','each','more','most','other','such','only','own','same','very','too'
]);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !STOPWORDS.has(w));
}

function overlapScore(queryWords, targetText) {
  const targetWords = new Set(normalize(targetText));
  let score = 0;
  queryWords.forEach(w => { if (targetWords.has(w)) score += 1; });
  return score;
}

function includesAny(text, phrases) {
  return phrases.some(p => text.includes(p));
}

export function getNukraxResponse(rawMessage) {
  const message = rawMessage.trim();
  const lower = message.toLowerCase();
  const queryWords = normalize(message);

  // ── Greetings ──
  if (/^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/.test(lower) && message.length < 30) {
    return "Hey! I'm Lanux. Ask me about the Expert Advisors, setup, risk management, or how to get in touch — happy to help.";
  }

  // ── Thanks ──
  if (includesAny(lower, ['thank you', 'thanks', 'thx', 'appreciate it'])) {
    return "You're welcome! Anything else you'd like to know about NUKRAX?";
  }

  // ── Who / what are you ──
  if (includesAny(lower, ['who are you', 'what are you', 'what can you do', 'what is this'])) {
    const k = NUKRAX_KNOWLEDGE.brand;
    return `I'm Lanux, the assistant for ${k.name}: ${k.description} Ask me about the Expert Advisors, setup, risk, or contact info.`;
  }

  // ── Contact intent ──
  if (includesAny(lower, ['contact', 'support', 'reach out', 'telegram', 'get in touch', 'talk to someone', 'human', 'help me directly'])) {
    const c = NUKRAX_KNOWLEDGE.contact;
    return `The fastest way to reach the team directly is Telegram: ${c.telegram}. There's also updates on X (${c.x}) and the code on GitHub (${c.github}).`;
  }

  // ── EA-specific match (name mention is a strong signal) ──
  let bestEa = null, bestEaScore = 0;
  NUKRAX_KNOWLEDGE.eas.forEach(ea => {
    let score = overlapScore(queryWords, ea.name + ' ' + ea.desc + ' ' + ea.tag);
    if (lower.includes(ea.name.toLowerCase().split(' ')[0])) score += 4;
    if (score > bestEaScore) { bestEaScore = score; bestEa = ea; }
  });

  // ── "What EAs do you offer" style — list all ──
  if (includesAny(lower, ['what expert advisor', 'what eas', 'which eas', 'list of ea', 'all ea', 'what systems', 'what products', 'what do you offer', 'what do you sell'])) {
    const list = NUKRAX_KNOWLEDGE.eas.map(ea => `${ea.name} (${ea.tag}) — ${ea.desc}`).join(' ');
    return `NUKRAX currently offers three systems: ${list} You can browse all of them from the Expert Advisors page on the site.`;
  }

  // ── FAQ match ──
  let bestFaq = null, bestFaqScore = 0;
  NUKRAX_KNOWLEDGE.faq.forEach(item => {
    const score = overlapScore(queryWords, item.q + ' ' + item.a);
    if (score > bestFaqScore) { bestFaqScore = score; bestFaq = item; }
  });

  // ── Decide the best of the two candidate matches ──
  const eaConfident = bestEa && bestEaScore >= 3;
  const faqConfident = bestFaq && bestFaqScore >= 2;

  if (eaConfident && (!faqConfident || bestEaScore >= bestFaqScore)) {
    return `${bestEa.name} (${bestEa.tag}) — ${bestEa.desc} You can see the full breakdown on its page in the Expert Advisors section.`;
  }

  if (faqConfident) {
    return bestFaq.a;
  }

  // ── Platform mentions ──
  if (lower.includes('nukrax.tr')) return NUKRAX_KNOWLEDGE.platforms.tr;
  if (lower.includes('nukrax.cr')) return NUKRAX_KNOWLEDGE.platforms.cr;

  // ── No confident local match — let the caller fall back to the AI model ──
  return null;
}

// Fallback text used only if the AI-model fallback itself fails (e.g. offline).
export const NUKRAX_OFFLINE_FALLBACK =
  "I couldn't find that in what I have on file, and I can't reach the AI backup right now. Try rephrasing, or reach out directly on Telegram (@CosmoLanex).";
