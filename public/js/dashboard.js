console.log("Its Working");

const token = getToken();
if (!token) {
  window.location.replace("/login.html");
}

let habits = [];
let dailyEntry = { habits: [] };
let editingHabitId = null;

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(date) {
  const parts = date.split("-");
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Date
const today = formatDateValue(new Date());
let selectedDate = today;

const dateSelector = document.getElementById("date-selector");
dateSelector.max = today;
dateSelector.value = today;

// General
const habitList = document.getElementById("habit-list");
const loadingSpinner = document.getElementById("loading-indicator");
const progressCircle = document.getElementById("progress-circle");
const progressPercent = document.getElementById("progress-percent");
const weekDates = document.getElementById("week-dates");

// Habit Modal
const habitModal = document.getElementById("habit-modal");
const habitName = document.getElementById("habit-name");
const habitDescription = document.getElementById("habit-description");
const habitIcon = document.getElementById("habit-icon");
const habitSaveButton = document.getElementById("save-button");
const habitModalMessage = document.getElementById("habit-modal-message");

// Profile Modal
const profileModal = document.getElementById("profile-modal");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");

// Modal
const modalTitle = document.getElementById("modal-title");

function showLoading(isLoading) {
  if (isLoading) {
    loadingSpinner.classList.remove("hidden");
    loadingSpinner.classList.add("flex");
    habitList.classList.add("opacity-40", "pointer-events-none");
  } else {
    loadingSpinner.classList.remove("flex");
    loadingSpinner.classList.add("hidden");
    habitList.classList.remove("opacity-40", "pointer-events-none");
  }
}

async function loadData() {
  showLoading(true);
  renderDates();
  try {
    const profileResponse = await authFetch("/api/auth/me");
    const habitsResponse = await authFetch("/api/habits");
    const dailyEntryResponse = await authFetch(
      "/api/dailyEntry/" + selectedDate,
    );

    if (!habitsResponse.ok || !dailyEntryResponse.ok) {
      alert("Could not load.");
      return;
    }

    habits = await habitsResponse.json();
    dailyEntry = await dailyEntryResponse.json();
    const profile = await profileResponse.json();
    profileName.value = profile.user.name;
    profileEmail.value = profile.user.email;

    renderHabits();
    updateProgress();
  } catch (error) {
    console.error(error);
    // alert("Network request failed");
  } finally {
    showLoading(false);
  }
}

function changeDate(date) {
  if (date === "" || date > today) {
    dateSelector.value = selectedDate;
    return;
  }

  selectedDate = date;

  loadData();
}

function renderDates() {
  dateSelector.value = selectedDate;
  weekDates.textContent = "";

  const selected = parseDateValue(selectedDate);

  for (let i = 0; i < 5; i++) {
    const date = new Date(selected);
    date.setDate(selected.getDate() + i - 2);

    const dateValue = formatDateValue(date);
    const button = document.createElement("button");
    const dayName = document.createElement("span");
    const dayNumber = document.createElement("strong");

    button.type = "button";
    button.className =
      "rounded-lg border border-surface p-3 hover:bg-surface cursor-pointer";

    if (dateValue === selectedDate) {
      button.className = "rounded-lg bg-primary p-3 text-white cursor-pointer";
      button.setAttribute("aria-pressed", "true");
    }

    if (dateValue > today) {
      button.disabled = true;
      button.className = "rounded-lg border border-surface p-3 text-surface";
    }

    dayName.className = "block text-xs";
    dayName.textContent = date.toLocaleDateString(undefined, {
      weekday: "short",
    });
    dayNumber.textContent = date.getDate();

    button.appendChild(dayName);
    button.appendChild(dayNumber);
    button.addEventListener("click", function () {
      changeDate(dateValue);
    });
    weekDates.appendChild(button);
  }
}

function isCompleted(habitId) {
  for (let i = 0; i < dailyEntry.habits.length; i++) {
    if (dailyEntry.habits[i].habit === habitId) {
      return dailyEntry.habits[i].completed;
    }
  }

  return false;
}

function setCompletion(habitId, completed) {
  for (let i = 0; i < dailyEntry.habits.length; i++) {
    if (dailyEntry.habits[i].habit === habitId) {
      dailyEntry.habits[i].completed = completed;
      return;
    }
  }

  dailyEntry.habits.push({ habit: habitId, completed: completed });
}

function isAllCompleted() {
  let completedCount = 0;
  for (let i = 0; i < habits.length; i++) {
    if (isCompleted(habits[i]._id)) {
      completedCount += 1;
    }
  }

  return completedCount === habits.length;
}

async function updateCompletion(habitId, completed) {
  const previousValue = isCompleted(habitId);
  const date = selectedDate;

  setCompletion(habitId, completed);
  renderHabits(habitId);
  updateProgress();
  if (isAllCompleted()) {
    showConfetti();
  }

  try {
    const response = await authFetch("/api/dailyEntry/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date,
        habitId: habitId,
        completed: completed,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not save habit completion.");
    }
  } catch (error) {
    console.error(error);

    if (selectedDate === date) {
      setCompletion(habitId, previousValue);
      renderHabits();
      updateProgress();
    }
  }
}

function renderHabits(habitIdCompleted) {
  habitList.textContent = "";

  if (habits.length === 0) {
    habitList.textContent = "No habits yet. Click Add Habit to create one.";
    return;
  }

  for (let i = 0; i < habits.length; i++) {
    const habit = habits[i];
    const completed = isCompleted(habit._id);

    const card = document.createElement("div");
    const icon = document.createElement("div");
    const details = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const buttons = document.createElement("div");

    const editButton = document.createElement("img");
    editButton.src = "/images/edit-icon.svg";
    editButton.title = "Edit";

    const deleteButton = document.createElement("img");
    deleteButton.src = "/images/bin-icon.svg";
    deleteButton.title = "Delete";

    const completeButton = document.createElement("button");

    card.className =
      "flex flex-wrap items-center gap-4 border border-surface p-4 rounded-lg";
    icon.className =
      "flex h-12 w-12 shink-0 items-center justify-center bg-surface font-bold rounded-lg";
    details.classList = "min-w-0 flex-1";
    title.className = "font-bold";
    description.className = "text-sm text-foreground/70";
    buttons.className = "ml-auto flex flex-row items-center gap-3";

    editButton.className =
      "w-4 h-4 opacity-40 hover:opacity-100 cursor-pointer select-none";
    deleteButton.className =
      "w-4 h-4 opacity-40 hover:opacity-100 text-red-500 cursor-pointer select-none";
    completeButton.className =
      "h-10 w-10 rounded-full border-2 border-surface cursor-pointer";

    if (completed) {
      completeButton.className =
        "h-10 w-10 rounded-full bg-primary border-2 border-surface cursor-pointer";

      details.classList.add("line-through", "opacity-50");
      icon.classList.add("opacity-50");
    }

    if (habitIdCompleted === habit._id) {
      completeButton.classList.add("animate-pop-in");
    }

    title.textContent = habit.name;
    icon.textContent = habit.icon;
    description.textContent = habit.description;

    editButton.addEventListener("click", function () {
      editHabitModal(habit);
    });

    deleteButton.addEventListener("click", function () {
      deleteHabit(habit._id);
    });

    completeButton.addEventListener("click", function () {
      updateCompletion(habit._id, !completed);
    });

    details.appendChild(title);
    details.appendChild(description);

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);
    buttons.appendChild(completeButton);

    card.appendChild(icon);
    card.appendChild(details);
    card.appendChild(buttons);

    habitList.appendChild(card);
  }
}

function updateProgress() {
  let completedCount = 0;

  for (let i = 0; i < habits.length; i++) {
    if (isCompleted(habits[i]._id)) {
      completedCount += 1;
    }
  }

  let percent = 0;

  if (habits.length > 0) {
    percent = Math.round((completedCount / habits.length) * 100);
  }

  progressPercent.textContent = `${percent}%`;
  progressCircle.style.background =
    "conic-gradient(var(--color-primary) " +
    percent +
    "%, var(--color-surface) 0)";
  progressCircle.setAttribute("aria-valuenow", percent);
}

function showConfetti() {
  const end = Date.now() + 2000;
  const colors = ["#91d06c", "#4c8ce4"];
  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

async function saveHabit() {
  habitSaveButton.textContent = "Loading...";
  habitSaveButton.setAttribute("disabled", true);
  try {
    const name = habitName.value.trim();
    const description = habitDescription.value.trim();
    const icon = habitIcon.value.trim();

    if (name === "" || description === "") {
      habitModalMessage.textContent = "Name and description is required";
      return;
    }

    let url = "/api/habits/add";
    let method = "POST";

    const body = {
      name: name,
      description: description,
      icon: icon,
    };

    if (editingHabitId !== null) {
      url = "/api/habits/update";
      method = "PATCH";
      body.id = editingHabitId;
    }

    await authFetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    closeModals();
    loadData();
  } catch (error) {
    console.error(error);
    habitModalMessage.textContent = "Could not save habit";
  } finally {
    habitSaveButton.textContent = "Save Habit";
    habitSaveButton.removeAttribute("disabled");
    habitName.value = "";
    habitDescription.value = "";
    habitIcon.value = "";
  }
}

async function deleteHabit(habitId) {
  showLoading(true);
  try {
    await authFetch("/api/habits/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId: habitId }),
    });

    loadData();
  } catch (error) {
    console.error(error);
    alert("Could not delete habit.");
  } finally {
    showLoading(false);
  }
}

function openHabitModal() {
  editingHabitId = null;
  modalTitle.textContent = "Add Habit";
  habitName.value = "";
  habitDescription.value = "";
  habitIcon.value = "";
  habitModal.classList.remove("hidden");
  habitModal.classList.add("flex");
}

function editHabitModal(habit) {
  editingHabitId = habit._id;
  modalTitle.textContent = "Edit Habit";
  habitName.value = habit.name;
  habitDescription.value = habit.description;
  habitIcon.value = habit.icon;
  habitModal.classList.remove("hidden");
  habitModal.classList.add("flex");
}

function openProfileModal() {
  profileModal.classList.remove("hidden");
  profileModal.classList.add("flex");
}

function closeModals() {
  habitModal.classList.remove("flex");
  habitModal.classList.add("hidden");

  profileModal.classList.remove("flex");
  profileModal.classList.add("hidden");

  habitModalMessage.textContent = "";
}

// Habit Modal
document
  .getElementById("add-habit-button")
  .addEventListener("click", function () {
    openHabitModal();
  });
habitSaveButton.addEventListener("click", function () {
  saveHabit();
});
document.getElementById("cancel-button").addEventListener("click", function () {
  closeModals();
});

//Profile Modal
document
  .getElementById("profile-button")
  .addEventListener("click", function () {
    openProfileModal();
  });
document.getElementById("logout-button").addEventListener("click", function () {
  logout();
});
document
  .getElementById("profile-cancel-button")
  .addEventListener("click", function () {
    closeModals();
  });

//Date
dateSelector.addEventListener("change", function () {
  changeDate(dateSelector.value);
});

loadData();
