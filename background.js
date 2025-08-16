let focusMode = false;
let blockedSites = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
];

// Ambil status awal saat extension di-install atau browser dibuka
function initializeFocusMode() {
  chrome.storage.local.get(["focusMode", "blockedSites"], (data) => {
    focusMode = data.focusMode || false;
    if (Array.isArray(data.blockedSites)) {
      blockedSites = data.blockedSites;
    } else {
      chrome.storage.local.set({ blockedSites }); // simpan default
    }

    if (focusMode) enableFocusMode();
  });
}

chrome.runtime.onInstalled.addListener(initializeFocusMode);
chrome.runtime.onStartup.addListener(initializeFocusMode);

// Toggle via shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-focus-mode") {
    focusMode = !focusMode;
    chrome.storage.local.set({ focusMode });
    if (focusMode) enableFocusMode();
    else disableFocusMode();
  }
});

// Toggle via popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleFocus") {
    focusMode = message.focusMode;
    chrome.storage.local.set({ focusMode });
    if (focusMode) enableFocusMode();
    else disableFocusMode();
    sendResponse({ status: "ok" });
  }
});

// Reaktif terhadap perubahan storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.focusMode) {
      focusMode = changes.focusMode.newValue;
      if (focusMode) enableFocusMode();
      else disableFocusMode();
    }
    if (changes.blockedSites) {
      blockedSites = changes.blockedSites.newValue;
    }
  }
});

// Cek tab saat dibuat atau diupdate
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (focusMode && changeInfo.status === "complete") {
    checkAndBlock(tab);
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (focusMode) {
    checkAndBlock(tab);
  }
});

// Fungsi utama
function enableFocusMode() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (isBlocked(tab.url)) {
        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("block.html") });
      }
    });
  });
}

function disableFocusMode() {
  // Tidak restore tab, hanya nonaktifkan pemblokiran
}

function isBlocked(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return blockedSites.some(site => hostname.includes(site));
  } catch {
    return false;
  }
}

function checkAndBlock(tab) {
  const urlToCheck = tab.pendingUrl || tab.url;
  if (isBlocked(urlToCheck)) {
    chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("block.html") });
  }
}
