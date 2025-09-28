// ---------- Global Variables ----------
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ---------- Initialize App ----------
function initApp() {
  const pages = document.querySelectorAll(".page");
  const sidebarLinks = document.querySelectorAll(".sidebar a");

  // Show page function
  function showPage(pageId) {
    pages.forEach(p => p.classList.remove("active"));
    const page = document.getElementById(pageId);
    if (page) page.classList.add("active");

    if (pageId === "calendar") showCalendar();
    if (pageId === "scheduled") showScheduledTasks();
  }

  // Sidebar link click events
  sidebarLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page");
      showPage(pageId);
    });
  });

  // Show homepage by default
  showPage("homepage");

  // Initialize tasks, notes, study files
  ["daily", "weekly", "monthly"].forEach(loadTasks);
  loadNotes();
  loadStudyFiles();
  showScheduledTasks();
}

// ---------- Dark Mode ----------
function toggleDarkMode() {
  const darkModeBtn = document.getElementById("darkToggle");
  document.body.classList.toggle("dark-mode");
  darkModeBtn.textContent = document.body.classList.contains("dark-mode")
    ? "☀ Light Mode"
    : "🌙 Dark Mode";
}

// ---------- Tasks ----------
function loadTasks(type) {
  const listEl = document.getElementById(`${type}TaskList`);
  if (!listEl) return;
  listEl.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem(`${type}Tasks`) || "[]");

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    let taskText = typeof task === "object" && task !== null ? task.text : task;
    const span = document.createElement("span");
    span.textContent = taskText;

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✅ Complete";
    completeBtn.onclick = () => deleteTask(type, index);

    li.appendChild(span);
    li.appendChild(completeBtn);
    listEl.appendChild(li);
  });
}

function addTask(type) {
  const input = document.getElementById(`${type}TaskInput`);
  if (!input || !input.value.trim()) return;

  let taskData = { text: input.value.trim() };

  // Add time if exists
  const timeInput = document.getElementById(`${type}TaskTime`);
  if (timeInput && timeInput.value) taskData.text += ` (Time: ${timeInput.value})`;

  input.value = "";
  if (timeInput) timeInput.value = "";

  const tasks = JSON.parse(localStorage.getItem(`${type}Tasks`) || "[]");
  tasks.push(taskData);
  localStorage.setItem(`${type}Tasks`, JSON.stringify(tasks));

  loadTasks(type);
}

function deleteTask(type, index) {
  const tasks = JSON.parse(localStorage.getItem(`${type}Tasks`) || "[]");
  tasks.splice(index, 1);
  localStorage.setItem(`${type}Tasks`, JSON.stringify(tasks));
  loadTasks(type);
}

// Toggle Add Task Bar
function toggleAddTaskBar(type) {
  const bar = document.getElementById(`${type}-add-bar`);
  if (bar) bar.style.display = bar.style.display === "block" ? "none" : "block";
}

// ---------- Notes ----------
function loadNotes() {
  const listEl = document.getElementById("notesList");
  if (!listEl) return;
  listEl.innerHTML = "";
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  notes.forEach((note, index) => {
    const li = document.createElement("li");
    li.textContent = note;
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.onclick = () => deleteNote(index);
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

function addNote() {
  const input = document.getElementById("noteInput");
  if (!input || !input.value.trim()) return;

  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.push(input.value.trim());
  localStorage.setItem("notes", JSON.stringify(notes));
  input.value = "";
  loadNotes();
}

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.splice(index, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  loadNotes();
}

function toggleAddNoteBar() {
  const bar = document.getElementById("note-add-bar");
  if (bar) bar.style.display = bar.style.display === "block" ? "none" : "block";
}

// ---------- Study Material ----------
function loadStudyFiles() {
  const listEl = document.getElementById("studyFileList");
  if (!listEl) return;
  listEl.innerHTML = "";
  const files = JSON.parse(localStorage.getItem("studyFiles") || "[]");

  files.forEach((file, index) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = file.name;
    span.style.cursor = "pointer";
    span.onclick = () => window.open(file.url, "_blank");

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => deleteStudyFile(index);

    li.appendChild(span);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

function deleteStudyFile(index) {
  const files = JSON.parse(localStorage.getItem("studyFiles") || "[]");
  files.splice(index, 1);
  localStorage.setItem("studyFiles", JSON.stringify(files));
  loadStudyFiles();
}

document.getElementById("studyUpload").addEventListener("change", function () {
  const files = Array.from(this.files);
  const storedFiles = JSON.parse(localStorage.getItem("studyFiles") || "[]");

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      storedFiles.push({ name: file.name, url: e.target.result });
      localStorage.setItem("studyFiles", JSON.stringify(storedFiles));
      loadStudyFiles();
    };
    reader.readAsDataURL(file);
  });
});

// ---------- Scheduled Tasks ----------
function showScheduledTasks() {
  const listEl = document.getElementById("scheduledTaskList");
  if (!listEl) return;
  listEl.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("scheduledTasks") || "[]");
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = `${task.text} (Date: ${task.date || "N/A"}${task.time ? ", Time: " + task.time : ""})`;

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✅ Complete";
    completeBtn.onclick = () => deleteScheduledTask(index);

    li.appendChild(completeBtn);
    listEl.appendChild(li);
  });

  // Remove old add button if exists
  const existingBtn = document.getElementById("addScheduledBtn");
  if (existingBtn) existingBtn.remove();

  // Add button for scheduling new task
  const addBtn = document.createElement("button");
  addBtn.textContent = "＋ Add Scheduled Task";
  addBtn.className = "add-btn";
  addBtn.id = "addScheduledBtn";
  addBtn.style.marginTop = "10px";
  addBtn.onclick = () => addScheduledTask();
  
  listEl.parentElement.insertBefore(addBtn, listEl.nextSibling);
}


function addScheduledTask() {
  const taskText = prompt("Enter task:");
  const taskDate = prompt("Enter date (YYYY-MM-DD):");
  const taskTime = prompt("Enter time (optional, e.g., 14:00):");

  if (!taskText || !taskDate) return;

  const tasks = JSON.parse(localStorage.getItem("scheduledTasks") || "[]");
  tasks.push({ text: taskText, date: taskDate, time: taskTime || "" });
  localStorage.setItem("scheduledTasks", JSON.stringify(tasks));
  showScheduledTasks();
}

function deleteScheduledTask(index) {
  const tasks = JSON.parse(localStorage.getItem("scheduledTasks") || "[]");
  tasks.splice(index, 1);
  localStorage.setItem("scheduledTasks", JSON.stringify(tasks));
  showScheduledTasks();
}

// ---------- Calendar ----------
function showCalendar() {
  const calendarContainer = document.getElementById("calendarContainer");
  if (!calendarContainer) return;
  calendarContainer.innerHTML = "";

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  // --- Navigation ---
  const nav = document.createElement("div");
  nav.className = "calendar-nav";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "⬅ Prev";
  prevBtn.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    showCalendar();
  };

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ➡";
  nextBtn.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    showCalendar();
  };

  const monthHeader = document.createElement("h3");
  monthHeader.textContent = `${monthName} ${currentYear}`;

  nav.appendChild(prevBtn);
  nav.appendChild(monthHeader);
  nav.appendChild(nextBtn);
  calendarContainer.appendChild(nav);

  // --- Table ---
  const table = document.createElement("table");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  days.forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  const scheduledTasks = JSON.parse(localStorage.getItem("scheduledTasks") || "[]");
  const taskDates = scheduledTasks.map(task => task.date);

  let row = document.createElement("tr");
  for (let i = 0; i < firstDay; i++) {
    const td = document.createElement("td");
    row.appendChild(td);
  }

  for (let day = 1; day <= lastDate; day++) {
    if (row.children.length === 7) {
      tbody.appendChild(row);
      row = document.createElement("tr");
    }
    const td = document.createElement("td");
    td.textContent = day;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (taskDates.includes(dateStr)) {
      td.style.backgroundColor = "red";
      td.style.color = "white";
      td.style.fontWeight = "bold";
    }

    td.addEventListener("click", () => {
      const taskText = prompt(`Add task for ${dateStr}:`);
      if (taskText) {
        const taskTime = prompt("Enter time (optional, e.g. 14:00):");
        const tasks = JSON.parse(localStorage.getItem("scheduledTasks") || "[]");
        tasks.push({ text: taskText, date: dateStr, time: taskTime || "" });
        localStorage.setItem("scheduledTasks", JSON.stringify(tasks));
        showScheduledTasks();
        showCalendar();
      }
    });

    row.appendChild(td);
  }

  while (row.children.length < 7) {
    const td = document.createElement("td");
    row.appendChild(td);
  }

  tbody.appendChild(row);
  table.appendChild(tbody);
  calendarContainer.appendChild(table);
}
function goHome() {
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => p.classList.remove("active"));
  const homepage = document.getElementById("homepage");
  if (homepage) homepage.classList.add("active");
}
