const fs = require('fs');
const path = require('path');
const { STORAGE_FILE, HISTORY_LIMIT } = require('../config');

const filePath = path.resolve(STORAGE_FILE);

function load() {
  try {
    if (!fs.existsSync(filePath)) return defaultData();
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return defaultData();
  }
}

function save(data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function defaultData() {
  return { summaries: {}, actionItems: {}, coordination: { claims: {}, standups: [] } };
}

function getSummaries(channelId) {
  const data = load();
  return (data.summaries[channelId] || []).slice(-HISTORY_LIMIT);
}

function addSummary(channelId, summary) {
  const data = load();
  if (!data.summaries[channelId]) data.summaries[channelId] = [];
  data.summaries[channelId].push({ ...summary, timestamp: Date.now() });
  if (data.summaries[channelId].length > 50) {
    data.summaries[channelId] = data.summaries[channelId].slice(-50);
  }
  save(data);
}

function storeActionItems(messageId, items) {
  const data = load();
  data.actionItems[messageId] = { items, reviewedBy: [] };
  save(data);
}

function getActionItems(messageId) {
  const data = load();
  return data.actionItems[messageId] || null;
}

function markActionItemsReviewed(messageId, userId, username) {
  const data = load();
  if (!data.actionItems[messageId]) return null;
  const record = data.actionItems[messageId];
  if (!record.reviewedBy.some((r) => r.userId === userId)) {
    record.reviewedBy.push({ userId, username });
    save(data);
  }
  return record;
}

function getClaims() {
  const data = load();
  return Object.values(data.coordination.claims || {});
}

function setClaim(userId, username, task) {
  const data = load();
  data.coordination.claims[userId] = { userId, username, task, claimedAt: Date.now() };
  save(data);
}

function clearClaim(userId) {
  const data = load();
  const had = !!data.coordination.claims[userId];
  delete data.coordination.claims[userId];
  if (had) save(data);
  return had;
}

function addStandup(userId, username, standup) {
  const data = load();
  data.coordination.standups.push({ userId, username, ...standup, timestamp: Date.now() });
  if (data.coordination.standups.length > 200) {
    data.coordination.standups = data.coordination.standups.slice(-200);
  }
  save(data);
}

function getLatestStandup(userId) {
  const data = load();
  const userEntries = (data.coordination.standups || [])
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);
  return userEntries[0] || null;
}

function getCoordination() {
  const data = load();
  return data.coordination;
}

module.exports = {
  getSummaries,
  addSummary,
  storeActionItems,
  getActionItems,
  markActionItemsReviewed,
  getClaims,
  setClaim,
  clearClaim,
  addStandup,
  getLatestStandup,
  getCoordination,
};
