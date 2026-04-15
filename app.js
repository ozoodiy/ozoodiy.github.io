"use strict";

const STORAGE_KEYS = {
  reading: "ozodbek-reading-log-v1",
  writing: "ozodbek-writing-log-v1",
};

const seedReading = [
  { title: "The Lessons of History", author: "Will & Ariel Durant" },
  { title: "Poor Charlie's Almanack", author: "Charlie Munger" },
  { title: "Meditations", author: "Marcus Aurelius" },
];

const seedFinished = [
  { title: "Chip War", author: "Chris Miller" },
  { title: "The Changing World Order", author: "Ray Dalio" },
  { title: "The Outsiders", author: "William Thorndike" },
];

const seedWriting = [
  { title: "What to optimize for in your twenties", date: "Apr 2026" },
  { title: "Why small daily writing wins", date: "Mar 2026" },
  { title: "Notes on reading with intent", date: "Feb 2026" },
];

function getStorageArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveStorageArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function asDateNumber(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 0;
  return date.getTime();
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStatus(message) {
  const status = document.getElementById("status-message");
  status.textContent = message;
}

function renderSeedLists() {
  const nowReading = document.getElementById("now-reading-list");
  nowReading.innerHTML = seedReading
    .map((book) => `<li><strong>${book.title}</strong> — ${book.author}</li>`)
    .join("");

  const finished = document.getElementById("finished-reading-list");
  finished.innerHTML = seedFinished
    .map((book) => `<li><strong>${book.title}</strong> — ${book.author}</li>`)
    .join("");

  const writingPieces = document.getElementById("writing-piece-list");
  writingPieces.innerHTML = seedWriting
    .map((piece) => `<li><strong>${piece.title}</strong> <span class="muted">(${piece.date})</span></li>`)
    .join("");
}

function renderReadingLog() {
  const readingLog = getStorageArray(STORAGE_KEYS.reading).sort((a, b) => asDateNumber(b.date) - asDateNumber(a.date));
  const list = document.getElementById("reading-log-list");

  if (readingLog.length === 0) {
    list.innerHTML = "<li>No reading logs yet.</li>";
    return;
  }

  list.innerHTML = readingLog
    .map(
      (entry) =>
        `<li><strong>${escapeHtml(entry.date)}</strong> — ${escapeHtml(entry.title)} (${escapeHtml(entry.pages)} pages)<br>${escapeHtml(entry.note)}</li>`,
    )
    .join("");
}

function calculateWritingStreak(entries) {
  if (entries.length === 0) return 0;

  const dates = [...new Set(entries.map((entry) => entry.date))]
    .map((dateText) => new Date(`${dateText}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length === 0) return 0;

  const oneDayMs = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = dates[0];
  const daysBehind = Math.round((today.getTime() - mostRecent.getTime()) / oneDayMs);

  if (daysBehind > 1) return 0;

  let streak = 1;
  for (let idx = 1; idx < dates.length; idx += 1) {
    const gap = Math.round((dates[idx - 1].getTime() - dates[idx].getTime()) / oneDayMs);
    if (gap !== 1) break;
    streak += 1;
  }
  return streak;
}

function renderWritingLog() {
  const writingLog = getStorageArray(STORAGE_KEYS.writing).sort((a, b) => asDateNumber(b.date) - asDateNumber(a.date));
  const list = document.getElementById("writing-log-list");

  if (writingLog.length === 0) {
    list.innerHTML = "<li>No writing sessions yet.</li>";
  } else {
    list.innerHTML = writingLog
      .map(
        (entry) =>
          `<li><strong>${escapeHtml(entry.date)}</strong> — ${escapeHtml(entry.minutes)} min, ${escapeHtml(entry.words)} words<br>Focus: ${escapeHtml(entry.focus)}</li>`,
      )
      .join("");
  }

  const totalWords = writingLog.reduce((sum, entry) => sum + Number(entry.words), 0);
  const totalMinutes = writingLog.reduce((sum, entry) => sum + Number(entry.minutes), 0);
  const sessions = writingLog.length;
  const streak = calculateWritingStreak(writingLog);

  document.getElementById("stat-sessions").textContent = formatNumber(sessions);
  document.getElementById("stat-words").textContent = formatNumber(totalWords);
  document.getElementById("stat-minutes").textContent = formatNumber(totalMinutes);
  document.getElementById("stat-streak").textContent = `${streak} day${streak === 1 ? "" : "s"}`;
}

function onReadingSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;

  const title = form.title.value.trim();
  const pages = Number(form.pages.value);
  const note = form.note.value.trim();
  const date = form.date.value;

  if (!title || !note || !date || pages < 1 || pages > 5000) {
    setStatus("Reading entry was not saved. Please check your values.");
    return;
  }

  const current = getStorageArray(STORAGE_KEYS.reading);
  current.push({
    title,
    pages,
    note,
    date,
  });
  saveStorageArray(STORAGE_KEYS.reading, current);
  form.reset();
  form.date.value = new Date().toISOString().split("T")[0];
  renderReadingLog();
  setStatus("Reading log saved.");
}

function onWritingSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;

  const date = form.date.value;
  const minutes = Number(form.minutes.value);
  const words = Number(form.words.value);
  const focus = form.focus.value.trim();

  if (!date || !focus || minutes < 5 || minutes > 720 || words < 1 || words > 25000) {
    setStatus("Writing entry was not saved. Please check your values.");
    return;
  }

  const current = getStorageArray(STORAGE_KEYS.writing);
  current.push({
    date,
    minutes,
    words,
    focus,
  });
  saveStorageArray(STORAGE_KEYS.writing, current);
  form.reset();
  form.date.value = new Date().toISOString().split("T")[0];
  renderWritingLog();
  setStatus("Writing session saved.");
}

function onExportData() {
  const payload = {
    readingLog: getStorageArray(STORAGE_KEYS.reading),
    writingLog: getStorageArray(STORAGE_KEYS.writing),
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "practice-tracker-backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Tracker data exported.");
}

function onResetData() {
  const confirmReset = window.confirm("Delete all saved reading and writing tracker data?");
  if (!confirmReset) return;

  localStorage.removeItem(STORAGE_KEYS.reading);
  localStorage.removeItem(STORAGE_KEYS.writing);
  renderReadingLog();
  renderWritingLog();
  setStatus("All tracker data cleared.");
}

function initializeForms() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("reading-date").value = today;
  document.getElementById("writing-date").value = today;

  document.getElementById("reading-form").addEventListener("submit", onReadingSubmit);
  document.getElementById("writing-form").addEventListener("submit", onWritingSubmit);
  document.getElementById("export-data").addEventListener("click", onExportData);
  document.getElementById("reset-data").addEventListener("click", onResetData);
}

function initializeSite() {
  renderSeedLists();
  renderReadingLog();
  renderWritingLog();
  initializeForms();
  document.getElementById("current-year").textContent = String(new Date().getFullYear());
}

window.addEventListener("DOMContentLoaded", initializeSite);
