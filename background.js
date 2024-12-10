// context menu options
chrome.runtime.onInstalled.addListener(() => {
	// Add "Save Note" for text selection
	chrome.contextMenus.create({
		id: "saveNote",
		title: "Save Note to Second-Brain",
		contexts: ["selection"],
	});

	// Add "Save URL" for address bar and general page
	chrome.contextMenus.create({
		id: "saveURL",
		title: "Save URL to Second-Brain",
		contexts: ["page", "link"],
	});

	// Add "Save Tweet" dynamically
	chrome.contextMenus.create({
		id: "saveTweet",
		title: "Save Tweet to Second-Brain",
		contexts: ["page"],
		visible: false, // Dynamically show for Twitter pages
	});
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
	const timestamp = new Date().toISOString();

	if (info.menuItemId === "saveNote") {
		// Save selected text
		const payload = {
			selectedText: info.selectionText,
			timestamp,
			url: tab.url,
		};
		sendToBackend(payload);
	} else if (info.menuItemId === "saveURL") {
		// Save URL
		const payload = { url: tab.url, timestamp };
		sendToBackend(payload);
	} else if (info.menuItemId === "saveTweet") {
		// Extract tweet ID and save
		const tweetId = extractTweetId(tab.url);
		if (tweetId) {
			const payload = { tweetId, timestamp };
			sendToBackend(payload);
		}
	}
});

// Detect Twitter and show "Save Tweet"
chrome.tabs.onUpdated.addListener(() => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const tab = tabs[0];
		if (tab.url.includes("twitter.com")) {
			chrome.contextMenus.update("saveTweet", { visible: true });
		} else {
			chrome.contextMenus.update("saveTweet", { visible: false });
		}
	});
});

// Utility: Extract tweet ID
function extractTweetId(url) {
	const match = url.match(/twitter\.com\/.*\/status\/(\d+)/);
	return match ? match[1] : null;
}

// Utility: Send data to backend
function sendToBackend(data) {
	fetch("https://your-api-endpoint.com/save", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	}).then((response) => console.log("Saved successfully:", response));
}
