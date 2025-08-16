const blockedSites = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
];

const focusToggle = document.getElementById("focusToggle");
const blockedList = document.getElementById("blockedList");
const statusBadge = document.getElementById("statusBadge");

// Render daftar blocked sites
function renderBlockedList() {
  blockedList.innerHTML = "";
  blockedSites.forEach(site => {
    const li = document.createElement("li");
    li.textContent = site;
    blockedList.appendChild(li);
  });
}

// Update badge status
function updateStatusBadge(isOn) {
  statusBadge.textContent = isOn ? "Aktif 🔒" : "Nonaktif 🔓";
  statusBadge.style.background = isOn ? "#3498db" : "#bdc3c7";
  statusBadge.style.color = isOn ? "#fff" : "#333";
}

// Ambil status awal dari storage
chrome.storage.local.get("focusMode", (data) => {
  const isOn = data.focusMode || false;
  focusToggle.checked = isOn;
  updateStatusBadge(isOn);
});

// Toggle fokus mode dan update badge
focusToggle.addEventListener("change", () => {
  const isOn = focusToggle.checked;
  chrome.storage.local.set({ focusMode: isOn });
  chrome.runtime.sendMessage({ action: "toggleFocus", focusMode: isOn })
    .catch((err) => console.warn("Gagal kirim pesan:", err));
  updateStatusBadge(isOn);
});

renderBlockedList();
