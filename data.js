// ═══════════════════════════════════════════════
// nukrax.cr — Shared Crypto Data & Utilities
// ═══════════════════════════════════════════════

const CRYPTO_DATA = {
  XRP: {
    name: "XRP",
    ticker: "XRP",
    icon: "✕",
    color: "#346AA9",
    networks: [
      { name: "XRP Ledger", badge: "XRP Ledger", tag: "best", address: "rU1HVivNon69SYwPkEVJXGt12yQKJtguqJ", warnings: [] },
      { name: "XRP (XRP)", badge: "XRP", tag: "suggested", address: "rNgJhLjpyNbr7g6M2WquSWsiV8LGNC9DtD", warnings: [] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7", warnings: [] },
      { name: "XRP Ledger + MEMO", badge: "XRP Ledger", tag: "", address: "rNxp4h8apvRis6mJf9Sh8C6iRxfrDWN7AV", memo: "437079162", warnings: ["Both a MEMO and an Address are required to successfully deposit.", "MEMO is required — without it, you will lose your coins."] },
      { name: "BNB Smart Chain (BEP20) #2", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "Ethereum (ERC20) — Wrapped XRP", badge: "ERC20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: ["You are depositing Wrapped XRP (WXRP). Ensure the token contract address ends with 2e 1b9."] }
    ]
  },
  SOL: {
    name: "Solana",
    ticker: "SOL",
    icon: "◎",
    color: "#9945FF",
    networks: [
      { name: "Solana (SOL)", badge: "SOL", tag: "best", address: "Dp5YavkzJ5Chtq6rFKnim7WR3xXksJVKg5iTKZjZZH7W", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "Solana (SOL) #2", badge: "SOL", tag: "suggested", address: "AY5hcenQD5hL9AAmZeG3Nu9mBg5AsW9djCP1onXCPCCE", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "SOL Solana", badge: "Solana", tag: "", address: "ANCQ6Dj2mxRpSuAXd1ZADCQpMTnNehxEyToCVBdNfug5", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] }
    ]
  },
  USDT: {
    name: "USDT",
    ticker: "USDT",
    icon: "₮",
    color: "#26A17B",
    networks: [
      { name: "TRC20 (Tron)", badge: "TRC20", tag: "suggested", address: "TJynZUP3AdMDQEzsvpWKsMkSXDBQf2Yrpt", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "suggested", address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7", warnings: [] },
      { name: "SOL — Solana", badge: "SOL", tag: "suggested", address: "AY5hcenQD5hL9AAmZeG3Nu9mBg5AsW9djCP1onXCPCCE", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "Polygon POS", badge: "MATIC", tag: "", address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7", warnings: ["Ensure the USDT coin you deposit ends with contract address '58e8f'."] },
      { name: "APT Aptos", badge: "APTOS", tag: "", address: "0x4926e80c1bdfb8b9068638657fa4d432ae60dfb341853d11415d30f048cfe6c4", warnings: ["Ensure the USDT coin you deposit via APTOS ends with contract address '9dc2b'."] },
      { name: "Bridged Tether (BASE)", badge: "BASE", tag: "", address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7", warnings: [] },
      { name: "TRC20 (Tron) #2", badge: "TRC20", tag: "suggested", address: "TR3VgpXVS2rDMNwwCeR4DPdre5URfC9cQo", warnings: [] },
      { name: "BSC — BEP20 #2", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "SOL — Solana #2", badge: "SOL", tag: "suggested", address: "ANCQ6Dj2mxRpSuAXd1ZADCQpMTnNehxEyToCVBdNfug5", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "Polygon POS #2", badge: "MATIC", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: ["Ensure the USDT coin you deposit ends with contract address '58e8f'."] },
      { name: "APT Aptos #2", badge: "APTOS", tag: "", address: "0x40d1e5bae378778043641e26d347554f5fa59616c5467b32a8b79a0021d33fa8", warnings: ["Ensure the USDT coin you deposit via APTOS ends with contract address '9dc2b'."] },
      { name: "Plasma", badge: "PLASMA", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] }
    ]
  },
  USDC: {
    name: "USDC",
    ticker: "USDC",
    icon: "◈",
    color: "#2775CA",
    networks: [
      { name: "Solana (SPL) — USD Coin", badge: "SOL", tag: "suggested", address: "AY5hcenQD5hL9AAmZeG3Nu9mBg5AsW9djCP1onXCPCCE", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7", warnings: [] },
      { name: "BASE", badge: "BASE", tag: "", address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7", warnings: [] },
      { name: "Polygon", badge: "MATIC", tag: "", address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7", warnings: [] }
    ]
  },
  BTC: {
    name: "Bitcoin",
    ticker: "BTC",
    icon: "₿",
    color: "#F7931A",
    networks: [
      { name: "BTC Bitcoin", badge: "BTC", tag: "suggested", address: "bc1qk2t0uvv4j7kfzpn8mvt8uxtt6cq0dnkp4dgeas", warnings: [] },
      { name: "Bitcoin (BTC)", badge: "BTC", tag: "suggested", address: "bc1q7hc2j0vccnalg908n5a3pehtuxrhrnzn3r450f", warnings: [] },
      { name: "Bitcoin (BTC) — Legacy", badge: "BTC", tag: "", address: "1Le79aX5JycCDKrY22hpVKAxukRNMai8AR", warnings: ["Supports deposits from BTC addresses starting with '1', '3', 'bc1p' and 'bc1q'."] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "Ethereum (ERC20) — Wrapped BTC", badge: "ERC20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: ["You are depositing Binance Wrapped BTC (BBTC). Ensure the token contract address ends with 22541."] },
      { name: "BTC SegWit (SEGWITBTC)", badge: "SegWit", tag: "", address: "bc1qjum56r23mqgvec0c7679d5l0z5gdu33npw7jx7", warnings: ["Supports deposits from BTC addresses starting with '1', '3', 'bc1p' and 'bc1q'."] }
    ]
  },
  ETH: {
    name: "Ethereum",
    ticker: "ETH",
    icon: "Ξ",
    color: "#627EEA",
    networks: [
      { name: "Ethereum (ETH)", badge: "ETH", tag: "suggested", address: "0x0F50eeb9F646f1A67c68e571BDe22C4426edaeB6", warnings: [] },
      { name: "Ethereum (ETH) #2", badge: "ETH", tag: "suggested", address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7", warnings: [] },
      { name: "Ethereum (ERC20)", badge: "ERC20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: ["Do not send validator rewards to this deposit address — funds may be lost."] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "BASE", badge: "BASE", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "Arbitrum One", badge: "ARB", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "Optimism", badge: "OP", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "zkSync Era", badge: "zkSync", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: ["zkSync Era is an L2 network. After crediting, the L1 transaction needs ~24 hours to confirm."] },
      { name: "Scroll", badge: "SCROLL", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: ["Scroll is an L2 network. After crediting, the L1 transaction needs ~1–2 hours to confirm."] },
      { name: "Manta Network", badge: "MANTA", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "Starknet", badge: "STARK", tag: "", address: "0x038549eeb7b53f83bfd92eab567e3577816e6324cbe776a3900abada68c7da3a", warnings: [] }
    ]
  },
  MATIC: {
    name: "Polygon",
    ticker: "POL",
    icon: "⬡",
    color: "#8247E5",
    networks: [
      { name: "Polygon (POL)", badge: "POL", tag: "suggested", address: "0x0F50eeb9F646f1A67c68e571BDe22C4426edaeB6", warnings: [] },
      { name: "Polygon (POL) #2", badge: "POL", tag: "", address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7", warnings: [] }
    ]
  },
  BNB: {
    name: "BNB",
    ticker: "BNB",
    icon: "◆",
    color: "#F3BA2F",
    networks: [
      { name: "BNB Smart Chain (BNB)", badge: "BNB", tag: "suggested", address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] },
      { name: "opBNB", badge: "opBNB", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] }
    ]
  },
  TRX: {
    name: "Tron",
    ticker: "TRX",
    icon: "◇",
    color: "#EB0029",
    networks: [
      { name: "Tron (TRC20) / TRX", badge: "TRC20", tag: "suggested", address: "TJynZUP3AdMDQEzsvpWKsMkSXDBQf2Yrpt", warnings: [] },
      { name: "Tron (TRC20) #2", badge: "TRC20", tag: "", address: "TR3VgpXVS2rDMNwwCeR4DPdre5URfC9cQo", warnings: [] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] }
    ]
  },
  TWT: {
    name: "TWT",
    ticker: "TWT",
    icon: "⬡",
    color: "#3375BB",
    networks: [
      { name: "Trust Wallet (BEP20)", badge: "BEP20", tag: "", address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7", warnings: [] }
    ]
  },
  ADA: {
    name: "Cardano",
    ticker: "ADA",
    icon: "₳",
    color: "#0033AD",
    networks: [
      { name: "Cardano (ADA)", badge: "ADA", tag: "suggested", address: "addr1q8cuylnzpprt9x2e76y2aa3d4aug593ylgawp5ha603r2des8qnd60k0zgxs459u2t26m2dk4l6gp6tt57zmu9sv2x3qcyer9f", warnings: [] },
      { name: "Cardano (ADA) #2", badge: "ADA", tag: "", address: "addr1vyfny5p3rjeyzpr4mr29cs7hwyv75w2cu05xevdfgvmezwgvy2e6v", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b", warnings: [] }
    ]
  }
};

// ── Audio ──
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buf; src.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    src.start(); src.stop(ctx.currentTime + 0.06);
  } catch(e) {}
}

function playCopy() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.07 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.18);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.2);
    });
  } catch(e) {}
}

// ── URL params ──
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
