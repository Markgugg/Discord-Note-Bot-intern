// In-memory session state for multi-message note collection
const activeSessions = new Map(); // userId -> { channelId, lines[] }
const pendingCaptures = new Map(); // userId -> channelId (waiting for next message as notes)

function startSession(userId, channelId) {
  activeSessions.set(userId, { channelId, lines: [] });
}

function hasSession(userId) {
  return activeSessions.has(userId);
}

function appendToSession(userId, text) {
  const session = activeSessions.get(userId);
  if (!session) return false;
  session.lines.push(text);
  return true;
}

function endSession(userId) {
  const session = activeSessions.get(userId);
  if (!session) return null;
  activeSessions.delete(userId);
  return session.lines.join('\n\n');
}

function cancelSession(userId) {
  const had = activeSessions.has(userId);
  activeSessions.delete(userId);
  return had;
}

function setPendingCapture(userId, channelId) {
  pendingCaptures.set(userId, channelId);
}

function hasPendingCapture(userId) {
  return pendingCaptures.has(userId);
}

function clearPendingCapture(userId) {
  pendingCaptures.delete(userId);
}

module.exports = {
  startSession,
  hasSession,
  appendToSession,
  endSession,
  cancelSession,
  setPendingCapture,
  hasPendingCapture,
  clearPendingCapture,
};
