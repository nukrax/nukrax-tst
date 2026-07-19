// ═══════════════════════════════════════════════
// NUKRAX AI — history.js
// Local persistence for chat conversations, active mode, and
// onboarding state. Pure localStorage — no data leaves the browser
// except the messages sent to /api/chat for a live reply.
// ═══════════════════════════════════════════════

const KEY_CONVERSATIONS = "nukrax_ai_conversations";
const KEY_ACTIVE = "nukrax_ai_active_id";
const KEY_MODE = "nukrax_ai_mode";
const KEY_TUTORIAL = "nukrax_ai_tutorial_seen";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY_CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY_CONVERSATIONS, JSON.stringify(list));
  } catch (e) { /* storage full/unavailable — fail silently */ }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getMode() {
  return localStorage.getItem(KEY_MODE) || "nukrax";
}

export function setMode(mode) {
  localStorage.setItem(KEY_MODE, mode);
}

export function hasTutorialBeenSeen() {
  return localStorage.getItem(KEY_TUTORIAL) === "1";
}

export function markTutorialSeen() {
  localStorage.setItem(KEY_TUTORIAL, "1");
}

export function getAllConversations() {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id) {
  return readAll().find(c => c.id === id) || null;
}

export function getActiveConversationId() {
  return localStorage.getItem(KEY_ACTIVE);
}

export function setActiveConversationId(id) {
  localStorage.setItem(KEY_ACTIVE, id);
}

export function createConversation(mode) {
  const convo = {
    id: uid(),
    title: "New conversation",
    mode: mode || getMode(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };
  const all = readAll();
  all.push(convo);
  writeAll(all);
  setActiveConversationId(convo.id);
  return convo;
}

export function deleteConversation(id) {
  const all = readAll().filter(c => c.id !== id);
  writeAll(all);
  if (getActiveConversationId() === id) {
    localStorage.removeItem(KEY_ACTIVE);
  }
}

export function addMessage(id, role, content) {
  const all = readAll();
  const convo = all.find(c => c.id === id);
  if (!convo) return null;
  convo.messages.push({ role, content, ts: Date.now() });
  convo.updatedAt = Date.now();
  if (convo.title === "New conversation" && role === "user") {
    convo.title = content.slice(0, 48) + (content.length > 48 ? "…" : "");
  }
  writeAll(all);
  return convo;
}

export function getOrCreateActiveConversation(mode) {
  const activeId = getActiveConversationId();
  if (activeId) {
    const existing = getConversation(activeId);
    if (existing) return existing;
  }
  return createConversation(mode);
}

if (typeof window !== "undefined") {
  window.NUKRAX_AI_HISTORY = {
    getMode, setMode, hasTutorialBeenSeen, markTutorialSeen,
    getAllConversations, getConversation, getActiveConversationId,
    setActiveConversationId, createConversation, deleteConversation,
    addMessage, getOrCreateActiveConversation
  };
}
