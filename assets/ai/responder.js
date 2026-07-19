// ═══════════════════════════════════════════════
// NUKRAX AI — responder.js
// Local, fully offline answer engine. Runs entirely in the browser —
// no network call, no API, no backend dependency of any kind, so it
// works identically on any host (including static hosts like GitHub
// Pages that can't run a server at all) and never has a daily limit
// or a "can't connect" failure mode.
//
// getNukraxResponse() ALWAYS returns a string — never null — so the
// assistant has something considered to say no matter what's asked,
// including long or unusual messages. It is honest rather than
// pretending to full understanding: known topics get precise answers
// pulled from NUKRAX_KNOWLEDGE; unfamiliar ones get a graceful,
// on-brand reply instead of an error or a dead end.
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
  'any','all','each','more','most','other','such','only','own','same','very','too',
  'im','ive','id','dont','doesnt','didnt','get','got','need','want','like','know'
]);

// Very light stemming so "brokers"/"broker", "setting"/"setup"-ish variants overlap.
function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  if (word.length > 4 && word.endsWith('ing')) return word.slice(0, -3);
  return word;
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !STOPWORDS.has(w))
    .map(stem);
}

// Weighted overlap: longer/rarer words count more than short generic ones.
function overlapScore(queryWords, targetText) {
  const targetWords = new Set(normalize(targetText));
  let score = 0;
  queryWords.forEach(w => {
    if (targetWords.has(w)) score += w.length >= 6 ? 2 : 1;
  });
  return score;
}

function includesAny(text, phrases) {
  return phrases.some(p => text.includes(p));
}

const GREETING_WORDS = new Set([
  'hi', 'hii', 'hiii', 'hiiii', 'hello', 'helo', 'hey', 'heyy', 'heyyy', 'hye', 'heya',
  'yo', 'yoo', 'sup', 'wassup', 'whatsup', "what's up", 'hola', 'howdy', 'gm', 'morning'
]);

function isGreeting(lower) {
  const firstWord = lower.split(/\s+/)[0].replace(/[^a-z']/g, '');
  return (GREETING_WORDS.has(firstWord) || GREETING_WORDS.has(lower)) && lower.length < 30;
}

function isHowAreYou(lower) {
  return /\b(how are (you|u)|how'?s it going|how you doing|hru|you good\??|you okay\??|how are things)\b/.test(lower);
}

// Topic keywords used to steer the graceful fallback when nothing matches
// precisely — lets an unmatched-but-related question still get a relevant
// nudge instead of a generic non-answer.
const TOPIC_HINTS = [
  { words: ['broker', 'brokerage', 'exness', 'xm', 'ecn'], hint: 'brokers and broker compatibility' },
  { words: ['risk', 'drawdown', 'loss', 'lot', 'size', 'sizing', 'exposure'], hint: 'risk management and position sizing' },
  { words: ['vps', 'server', 'uptime', 'hosting'], hint: 'VPS hosting for uptime' },
  { words: ['install', 'setup', 'attach', 'add', 'mt5', 'metatrader', 'template'], hint: 'installing and setting up an EA in MT5' },
  { words: ['price', 'cost', 'buy', 'purchase', 'payment'], hint: 'pricing — best confirmed directly on Telegram' },
  { words: ['backtest', 'history', 'result', 'performance'], hint: 'backtest methodology' },
  { words: ['news', 'nfp', 'event'], hint: 'news-event handling' },
  { words: ['update', 'upgrade', 'version'], hint: 'update frequency' }
];

function findTopicHint(queryWords) {
  const set = new Set(queryWords);
  for (const t of TOPIC_HINTS) {
    if (t.words.some(w => set.has(stem(w)) || set.has(w))) return t.hint;
  }
  return null;
}

export function getNukraxResponse(rawMessage) {
  const message = rawMessage.trim();
  const lower = message.toLowerCase();
  const queryWords = normalize(message);

  // ── Greetings (including common typos/variants) ──
  if (isGreeting(lower)) {
    return "Hey! I'm Lanux. Ask me about the Expert Advisors, setup, risk management, or how to get in touch — happy to help.";
  }

  // ── "How are you" style small talk ──
  if (isHowAreYou(lower)) {
    return "Doing well, thanks for asking! I'm here whenever you want to talk NUKRAX — Expert Advisors, setup, risk, or contact info.";
  }

  // ── Thanks ──
  if (includesAny(lower, ['thank you', 'thanks', 'thx', 'appreciate it'])) {
    return "You're welcome! Anything else you'd like to know about NUKRAX?";
  }

  // ── Who / what are you ──
  if (includesAny(lower, ['who are you', 'what are you', 'what can you do', 'what is this', 'ur name', 'your name', 'who made you', 'who created you', 'who is your creator', 'ur creator'])) {
    const k = NUKRAX_KNOWLEDGE.brand;
    return `I'm Lanux, the assistant for ${k.name}, built by ${k.creator}. ${k.description} Ask me about the Expert Advisors, setup, risk, or contact info.`;
  }

  // ── Farewell ──
  if (includesAny(lower, ['bye', 'goodbye', 'see you', 'see ya', 'later']) && message.length < 25) {
    return "Take care! Come back anytime you've got a NUKRAX question.";
  }

  // ── Contact intent ──
  if (includesAny(lower, ['contact', 'support', 'reach out', 'telegram', 'get in touch', 'talk to someone', 'human', 'help me directly'])) {
    const c = NUKRAX_KNOWLEDGE.contact;
    return `The fastest way to reach the team directly is Telegram: ${c.telegram}. There's also updates on X (${c.x}) and the code on GitHub (${c.github}).`;
  }

  // ── "What EAs do you offer" style — list all ──
  if (includesAny(lower, ['what expert advisor', 'what eas', 'which eas', 'list of ea', 'all ea', 'what systems', 'what products', 'what do you offer', 'what do you sell'])) {
    const list = NUKRAX_KNOWLEDGE.eas.map(ea => `${ea.name} (${ea.tag}) — ${ea.desc}`).join(' ');
    return `NUKRAX currently offers three systems: ${list} You can browse all of them from the Expert Advisors page on the site.`;
  }

  // ── EA-specific match (name mention is a strong signal) ──
  let bestEa = null, bestEaScore = 0;
  NUKRAX_KNOWLEDGE.eas.forEach(ea => {
    let score = overlapScore(queryWords, ea.name + ' ' + ea.desc + ' ' + ea.tag);
    if (lower.includes(ea.name.toLowerCase().split(' ')[0])) score += 4;
    if (score > bestEaScore) { bestEaScore = score; bestEa = ea; }
  });

  // ── FAQ match ──
  let bestFaq = null, bestFaqScore = 0;
  NUKRAX_KNOWLEDGE.faq.forEach(item => {
    const score = overlapScore(queryWords, item.q + ' ' + item.a);
    if (score > bestFaqScore) { bestFaqScore = score; bestFaq = item; }
  });

  // ── Decide the best of the two candidate matches (lower bar — long,
  // naturally-phrased questions shouldn't need a near-exact word match) ──
  const eaConfident = bestEa && bestEaScore >= 2;
  const faqConfident = bestFaq && bestFaqScore >= 1;

  if (eaConfident && (!faqConfident || bestEaScore >= bestFaqScore)) {
    return `${bestEa.name} (${bestEa.tag}) — ${bestEa.desc} You can see the full breakdown on its page in the Expert Advisors section.`;
  }

  if (faqConfident) {
    return bestFaq.a;
  }

  // ── Platform mentions ──
  if (lower.includes('nukrax.tr')) return NUKRAX_KNOWLEDGE.platforms.tr;
  if (lower.includes('nukrax.cr')) return NUKRAX_KNOWLEDGE.platforms.cr;

  // ── Short, ambiguous chit-chat ──
  if (queryWords.length === 0) {
    return "Not quite sure what you mean there — could you say a bit more? I can help with Expert Advisors, setup, risk, brokers, or contact info.";
  }

  // ── Graceful, always-something fallback for anything else, including
  // long or specific messages that don't hit an exact FAQ/EA match ──
  const hint = findTopicHint(queryWords);
  if (hint) {
    return `I don't have an exact answer for that specific case, but it sounds related to ${hint}. For something this specific, the team can give you a precise answer directly on Telegram (@CosmoLanex) — or try rephrasing and I'll take another pass.`;
  }
  return "I don't have an exact match for that in what I know about NUKRAX yet, so I don't want to guess and get it wrong. For anything this specific, Telegram (@CosmoLanex) is the fastest way to get a precise answer — or ask me about the Expert Advisors, setup, risk management, or contact info and I'll do my best.";
}
