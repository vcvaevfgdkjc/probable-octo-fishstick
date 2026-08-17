const STORAGE_KEY = "felix-learning-diary:v1";

const els = {
  todayText: document.querySelector("#todayText"),
  newTodayBtn: document.querySelector("#newTodayBtn"),
  addDayBtn: document.querySelector("#addDayBtn"),
  entryList: document.querySelector("#entryList"),
  pageTitle: document.querySelector("#pageTitle"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  deleteBtn: document.querySelector("#deleteBtn"),
  logForm: document.querySelector("#logForm"),
  dateInput: document.querySelector("#dateInput"),
  questionsInput: document.querySelector("#questionsInput"),
  learningInput: document.querySelector("#learningInput"),
  notesInput: document.querySelector("#notesInput"),
  saveState: document.querySelector("#saveState"),
  previewDate: document.querySelector("#previewDate"),
  previewTitle: document.querySelector("#previewTitle"),
  previewQuestions: document.querySelector("#previewQuestions"),
  previewLearning: document.querySelector("#previewLearning"),
  previewNotes: document.querySelector("#previewNotes"),
  dayDialog: document.querySelector("#dayDialog"),
  dialogDateInput: document.querySelector("#dialogDateInput"),
  confirmAddDayBtn: document.querySelector("#confirmAddDayBtn"),
};

const today = getLocalDateString(new Date());
const starterData = {
  entries: {},
};

let diary = loadDiary();
mergeSeedData();
let activeDate = diary.lastActiveDate || today;

if (!diary.entries[activeDate]) {
  ensureEntry(activeDate);
}

render();
bindEvents();

function bindEvents() {
  els.newTodayBtn.addEventListener("click", () => {
    activeDate = today;
    ensureEntry(activeDate);
    render();
  });

  els.addDayBtn.addEventListener("click", () => {
    els.dialogDateInput.value = today;
    els.dayDialog.showModal();
  });

  els.confirmAddDayBtn.addEventListener("click", () => {
    const date = els.dialogDateInput.value || today;
    activeDate = date;
    ensureEntry(activeDate);
    els.dayDialog.close();
    render();
  });

  els.entryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button) return;
    activeDate = button.dataset.date;
    render();
  });

  els.logForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCurrentEntry();
    render("已保存");
  });

  [els.dateInput, els.questionsInput, els.learningInput, els.notesInput].forEach((input) => {
    input.addEventListener("input", () => {
      updatePreviewFromForm();
      els.saveState.textContent = "有未保存修改";
    });
  });

  els.dateInput.addEventListener("change", () => {
    const nextDate = els.dateInput.value;
    if (!nextDate || nextDate === activeDate) return;
    const current = diary.entries[activeDate];
    delete diary.entries[activeDate];
    current.date = nextDate;
    current.updatedAt = new Date().toISOString();
    diary.entries[nextDate] = current;
    activeDate = nextDate;
    persist();
    render("日期已更新");
  });

  els.deleteBtn.addEventListener("click", () => {
    const dates = getSortedDates();
    if (dates.length <= 1) {
      clearEntry(activeDate);
      render("已清空本页");
      return;
    }

    const ok = window.confirm(`删除 ${activeDate} 的学习日志？`);
    if (!ok) return;

    delete diary.entries[activeDate];
    activeDate = getSortedDates()[0] || today;
    persist();
    render("已删除");
  });

  els.exportBtn.addEventListener("click", exportDiary);
  els.importInput.addEventListener("change", importDiary);
}

function loadDiary() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(starterData);
    const parsed = JSON.parse(stored);
    if (!parsed.entries || typeof parsed.entries !== "object") return structuredClone(starterData);
    return parsed;
  } catch {
    return structuredClone(starterData);
  }
}

function mergeSeedData() {
  const seed = window.FELIX_DIARY_SEED;
  if (!seed?.entries || typeof seed.entries !== "object") {
    if (Object.keys(diary.entries).length === 0) ensureStarterToday();
    return;
  }

  Object.entries(seed.entries).forEach(([date, seedEntry]) => {
    const current = diary.entries[date];
    if (!current || new Date(seedEntry.updatedAt || 0) > new Date(current.updatedAt || 0)) {
      diary.entries[date] = normalizeEntry(date, seedEntry);
    }
  });

  if (Object.keys(diary.entries).length === 0) ensureStarterToday();
  persist();
}

function ensureStarterToday() {
  diary.entries[today] = {
    date: today,
    questions: ["做一个属于 Felix 的学习日志网站，记录在 Codex 上询问的问题和学习内容。"],
    learning: ["用本地网页和浏览器存储保存 agent 学习过程。", "每日独立页面适合按日期复盘问题、知识点和备注。"],
    notes: ["可随时添加、修改、删除，并支持导入导出备份。"],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeEntry(date, entry) {
  return {
    date: entry.date || date,
    questions: Array.isArray(entry.questions) ? entry.questions : [],
    learning: Array.isArray(entry.learning) ? entry.learning : [],
    notes: Array.isArray(entry.notes) ? entry.notes : [],
    updatedAt: entry.updatedAt || new Date().toISOString(),
  };
}

function persist() {
  diary.lastActiveDate = activeDate;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(diary));
}

function ensureEntry(date) {
  if (diary.entries[date]) return diary.entries[date];
  diary.entries[date] = {
    date,
    questions: [],
    learning: [],
    notes: [],
    updatedAt: new Date().toISOString(),
  };
  persist();
  return diary.entries[date];
}

function clearEntry(date) {
  diary.entries[date] = {
    date,
    questions: [],
    learning: [],
    notes: [],
    updatedAt: new Date().toISOString(),
  };
  persist();
}

function saveCurrentEntry() {
  const date = els.dateInput.value || activeDate;
  const entry = {
    date,
    questions: linesFromText(els.questionsInput.value),
    learning: linesFromText(els.learningInput.value),
    notes: linesFromText(els.notesInput.value),
    updatedAt: new Date().toISOString(),
  };

  if (date !== activeDate) {
    delete diary.entries[activeDate];
    activeDate = date;
  }

  diary.entries[activeDate] = entry;
  persist();
}

function render(message = "已保存到本机浏览器") {
  ensureEntry(activeDate);
  renderSidebar();
  renderForm();
  updatePreviewFromForm();
  els.todayText.textContent = formatDate(today);
  els.pageTitle.textContent = `${activeDate} 学习日志`;
  els.saveState.textContent = message;
}

function renderSidebar() {
  const dates = getSortedDates();
  els.entryList.innerHTML = "";

  dates.forEach((date) => {
    const entry = diary.entries[date];
    const itemCount = entry.questions.length + entry.learning.length + entry.notes.length;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.date = date;
    button.className = `entry-item${date === activeDate ? " active" : ""}`;
    button.innerHTML = `
      <span>${formatDate(date)}</span>
      <span class="entry-count">${itemCount} 条</span>
    `;
    els.entryList.appendChild(button);
  });
}

function renderForm() {
  const entry = diary.entries[activeDate];
  els.dateInput.value = entry.date;
  els.questionsInput.value = textFromLines(entry.questions);
  els.learningInput.value = textFromLines(entry.learning);
  els.notesInput.value = textFromLines(entry.notes);
}

function updatePreviewFromForm() {
  const date = els.dateInput.value || activeDate;
  els.previewDate.textContent = formatDate(date);
  els.previewTitle.textContent = `${date} 学习日志`;
  renderList(els.previewQuestions, linesFromText(els.questionsInput.value), "暂无记录的问题");
  renderList(els.previewLearning, linesFromText(els.learningInput.value), "暂无学习内容");
  renderList(els.previewNotes, linesFromText(els.notesInput.value), "无");
}

function renderList(container, items, emptyText) {
  container.innerHTML = "";
  const list = items.length ? items : [emptyText];
  list.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    if (!items.length) li.className = "empty";
    container.appendChild(li);
  });
}

function exportDiary() {
  const blob = new Blob([JSON.stringify(diary, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `felix-learning-diary-${today}.json`;
  link.click();
  URL.revokeObjectURL(url);
  els.saveState.textContent = "已导出备份";
}

function importDiary(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed.entries || typeof parsed.entries !== "object") throw new Error("Invalid diary");
      const importedDates = Object.keys(parsed.entries).sort((a, b) => b.localeCompare(a));
      diary = parsed;
      activeDate = diary.lastActiveDate || importedDates[0] || today;
      persist();
      render("已导入备份");
    } catch {
      els.saveState.textContent = "导入失败：文件格式不正确";
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function getSortedDates() {
  return Object.keys(diary.entries).sort((a, b) => b.localeCompare(a));
}

function linesFromText(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function textFromLines(lines) {
  return Array.isArray(lines) ? lines.join("\n") : "";
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}
