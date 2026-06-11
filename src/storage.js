const fs = require('fs');
const path = require('path');
const { STORAGE_FILE } = require('../config');

const filePath = path.resolve(STORAGE_FILE);

function load() {
  try {
    if (!fs.existsSync(filePath)) return defaultData();
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Merge with defaults so missing fields from old schema don't crash
    return { ...defaultData(), ...parsed };
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
  return {
    tasks: [],
    nextTaskId: 1,
    actionItems: {},
  };
}

// ── Tasks ──────────────────────────────────────────────────────────────────

function getTasks() {
  return load().tasks || [];
}

function addTasks(descriptions) {
  const data = load();
  const added = descriptions.map((desc) => ({
    id: data.nextTaskId++,
    description: desc.replace(/\s*\(owner:[^)]*\)/gi, '').trim(),
    status: 'unclaimed',   // unclaimed | ongoing | completed
    claimedBy: null,
    claimedUsername: null,
    completedBy: null,
    completedUsername: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
  data.tasks.push(...added);
  save(data);
  return added;
}

function claimTask(taskId, userId, username) {
  const data = load();
  const task = data.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  if (task.status === 'completed') return { error: 'completed' };

  // Release any previous claim by this user
  data.tasks.forEach((t) => {
    if (t.claimedBy === userId && t.status === 'ongoing') {
      t.status = 'unclaimed';
      t.claimedBy = null;
      t.claimedUsername = null;
      t.updatedAt = Date.now();
    }
  });

  task.status = 'ongoing';
  task.claimedBy = userId;
  task.claimedUsername = username;
  task.updatedAt = Date.now();
  save(data);
  return task;
}

function freeClaimTask(userId, username, description) {
  const data = load();

  // Release previous claim
  data.tasks.forEach((t) => {
    if (t.claimedBy === userId && t.status === 'ongoing') {
      t.status = 'unclaimed';
      t.claimedBy = null;
      t.claimedUsername = null;
      t.updatedAt = Date.now();
    }
  });

  const task = {
    id: data.nextTaskId++,
    description,
    status: 'ongoing',
    claimedBy: userId,
    claimedUsername: username,
    completedBy: null,
    completedUsername: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  data.tasks.push(task);
  save(data);
  return task;
}

function unclaimTask(userId) {
  const data = load();
  const task = data.tasks.find((t) => t.claimedBy === userId && t.status === 'ongoing');
  if (!task) return null;
  task.status = 'unclaimed';
  task.claimedBy = null;
  task.claimedUsername = null;
  task.updatedAt = Date.now();
  save(data);
  return task;
}

function completeTask(userId, username) {
  const data = load();
  const task = data.tasks.find((t) => t.claimedBy === userId && t.status === 'ongoing');
  if (!task) return null;
  task.status = 'completed';
  task.completedBy = userId;
  task.completedUsername = username;
  task.updatedAt = Date.now();
  save(data);
  return task;
}

function getOngoingTask(userId) {
  return getTasks().find((t) => t.claimedBy === userId && t.status === 'ongoing') || null;
}

function getCompletedTasksToday(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return getTasks().filter(
    (t) => t.completedBy === userId && t.status === 'completed' && t.updatedAt >= startOfDay.getTime(),
  );
}

// ── Action item reactions ─────────────────────────────────────────────────

function storeActionItems(messageId, items) {
  const data = load();
  data.actionItems[messageId] = { items, reviewedBy: [] };
  save(data);
}

function getActionItems(messageId) {
  return load().actionItems[messageId] || null;
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

module.exports = {
  getTasks,
  addTasks,
  claimTask,
  freeClaimTask,
  unclaimTask,
  completeTask,
  getOngoingTask,
  getCompletedTasksToday,
  storeActionItems,
  getActionItems,
  markActionItemsReviewed,
};
