// ═══════════════════════════════════════════════
// NUKRAX AI — ai-data.js
// Structured knowledge about the NUKRAX product/site, used to
// ground the "Nukrax Assistant" mode, plus tutorial + quick-prompt
// content shared by the widget and the full chat page.
// ═══════════════════════════════════════════════

export const NUKRAX_KNOWLEDGE = {
  brand: {
    name: "NUKRAX",
    tagline: "Precision Tools for Elite Traders",
    creator: "@CosmoLanex / @nukrax",
    description: "A private trading ecosystem — institutional-grade Expert Advisors, SMC/ICT strategy systems, and live trading infrastructure, built natively for MetaTrader 5."
  },
  eas: [
    {
      name: "APEX HFT",
      tag: "HFT · v1.0",
      url: "ea/apex.html",
      desc: "Ultra-fast execution engine with adaptive scalping logic and multi-timeframe confirmation."
    },
    {
      name: "AURUM HFT",
      tag: "HFT · v1.0",
      url: "ea/aurum.html",
      desc: "Gold-specialist HFT system with advanced liquidity-targeting algorithms and session-based filters."
    },
    {
      name: "SMC ICT",
      tag: "SMC · ICT",
      url: "ea/smc-ict.html",
      desc: "Smart Money Concepts implementation with ICT methodology, FVG detection, and order block validation."
    }
  ],
  platforms: {
    tr: "nukrax.tr — a live trading platform with journaling and analysis tools, integrated with the EA suite.",
    cr: "nukrax.cr — a parallel live trading environment, also integrated with the EA suite (crypto-facing)."
  },
  faq: [
    { q: "What platform does NUKRAX run on?", a: "All Expert Advisors are built natively for MetaTrader 5, with no bridging or third-party wrappers required." },
    { q: "Do I need coding experience to use an EA?", a: "No. Each system ships with sensible defaults and a clear setup guide — configuration is handled through simple input parameters." },
    { q: "Which instruments are supported?", a: "Major and minor forex pairs, gold, and select indices, depending on the specific EA." },
    { q: "How is risk managed per trade?", a: "Position sizing is calculated dynamically from account equity and a configurable risk-per-trade percentage, with hard exposure caps enforced automatically." },
    { q: "Can I run multiple EAs on the same account?", a: "Yes — each EA tracks its own risk and position state, so multiple systems can run side by side without conflict." },
    { q: "What brokers are compatible?", a: "Any MT5 broker with standard order execution. Low-latency ECN brokers are recommended for HFT-class systems." },
    { q: "Do you offer backtest results?", a: "Each EA page includes backtest methodology notes. Full historical reports are available on request." },
    { q: "Is a VPS required?", a: "Strongly recommended for continuous uptime, especially for latency-sensitive HFT strategies." },
    { q: "How often are strategies updated?", a: "Reviewed on a rolling basis as market conditions shift, with updates released as needed." },
    { q: "What is the minimum account size?", a: "Varies by EA — listed on each system's individual page, based on its position sizing model." },
    { q: "Do the EAs trade news events?", a: "Some include dedicated news-based logic; others filter exposure around high-impact releases. Configurable per EA." },
    { q: "Can I customize risk settings?", a: "Yes — risk-per-trade, maximum exposure, and session filters are all adjustable inputs." },
    { q: "Is live support available?", a: "Yes, through Telegram (@CosmoLanex), with updates and community discussion on X." },
    { q: "How does nukrax.tr differ from nukrax.cr?", a: "Both are live trading platforms with journaling and analysis tools, serving as parallel environments integrated with the EA suite." },
    { q: "Will more Expert Advisors be released?", a: "Yes — additional systems are in active development and testing." }
  ],
  contact: {
    telegram: "https://t.me/CosmoLanex",
    x: "https://x.com/CosmoLanex",
    github: "https://github.com/CosmoLanex",
    youtube: "https://www.youtube.com/@CosmoLanex"
  },
  pages: {
    "Home": "index.html",
    "All Expert Advisors": "ea-selection.html",
    "APEX HFT": "ea/apex.html",
    "AURUM HFT": "ea/aurum.html",
    "SMC ICT": "ea/smc-ict.html",
    "Feedback / Reviews": "feedback.html",
    "Privacy Policy": "p.html"
  }
};

// ── System prompts for each AI mode ──
// Kept honest and transparent: the assistant is told to be genuinely
// helpful and to represent NUKRAX accurately and positively — not to
// run any hidden persuasion or emotional-manipulation routine.
export function buildSystemPrompt(mode) {
  const kb = JSON.stringify(NUKRAX_KNOWLEDGE, null, 2);

  if (mode === "nukrax") {
    return `You are Lanux, the assistant embedded on the NUKRAX trading-tools website.
Answer only using the reference data below plus general, publicly-known context about MetaTrader 5 and trading concepts when it helps explain something in the data.
Be warm, confident, and concise. It's fine to genuinely highlight what NUKRAX does well when it's relevant and true — but never invent stats, guarantees, or claims that aren't in the data, and never use manipulative or high-pressure language.
If asked something outside NUKRAX's scope (unrelated general knowledge, coding help, etc.), do your best to help anyway as a general assistant, but prioritize NUKRAX facts when they're relevant.
If you don't know something from the data, say so plainly and point to Telegram (@CosmoLanex) for a direct answer.

REFERENCE DATA:
${kb}`;
  }

  return `You are Lanux, a helpful, general-purpose AI assistant embedded in a chat widget on the NUKRAX website. Answer whatever the user asks, clearly and concisely, the way a knowledgeable, friendly assistant would. You are not restricted to NUKRAX topics in this mode.`;
}

// ── Quick-start prompt chips shown in the empty chat state ──
export const QUICK_PROMPTS = {
  nukrax: [
    "What Expert Advisors do you offer?",
    "Do I need coding experience?",
    "How is risk managed per trade?",
    "How do I contact support?"
  ],
  general: [
    "Explain a trading term for me",
    "Help me draft a message",
    "What can you help with?",
    "Give me a quick fact"
  ]
};

// ── Gamified onboarding tutorial steps ──
export const TUTORIAL_STEPS = [
  {
    title: "Welcome to Lanux",
    icon: "◆",
    body: "I'm Lanux, your assistant for everything on this site — Expert Advisors, setup, risk, contact, or just a normal conversation."
  },
  {
    title: "Two modes, one chat",
    icon: "⇄",
    body: "Tap the ⋮ menu above the input to switch between NUKRAX Assistant (site-focused) and General AI (anything else)."
  },
  {
    title: "Go full screen anytime",
    icon: "⤢",
    body: "Hit \u201CChat →\u201D at the top of this window to expand into the full chat page — your conversation carries over instantly."
  },
  {
    title: "Nothing gets lost",
    icon: "▤",
    body: "Every conversation is saved to your chat history automatically. Start a new one whenever you like, old ones stay put."
  },
  {
    title: "You're set",
    icon: "✓",
    body: "That's the whole tour. Ask anything — or tap one of the quick prompts to get going."
  }
];

if (typeof window !== "undefined") {
  window.NUKRAX_AI_DATA = { NUKRAX_KNOWLEDGE, QUICK_PROMPTS, TUTORIAL_STEPS };
}
