chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// log messages from sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);

  if (message.type === "TRANSCRIPT_UPDATE") {
    // Persist transcripts in chrome.storage
    chrome.storage.local.set({ transcript: message.data });
  }
});
