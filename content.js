function getText() {
  // Try <article>
  const article = document.querySelector("article");
  if (article && article.innerText.trim().length > 50) {
    return article.innerText.trim();
  }

  // Try common content containers (added LeetCode's .elfjS)
  const selectors = [
    "main",
    ".content",
    ".post-content",
    ".story-body",
    ".article-body",
    ".elfjS" // ✅ LeetCode question container
  ];
  
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim().length > 50) {
      return el.innerText.trim();
    }
  }

  // Fallback: grab all paragraphs
  const paragraphs = Array.from(document.querySelectorAll("p"))
    .map((p) => p.innerText.trim())
    .filter((t) => t.length > 0);
  
  return paragraphs.join("\n");
}

// Wait for dynamic content (like on LeetCode)
function waitForContent(callback) {
  const observer = new MutationObserver(() => {
    const text = getText();
    if (text && text.length > 50) {
      observer.disconnect();
      callback(text);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === "GET_ARTICLE_TEXT") {
    // First try immediately
    let text = getText();
    if (text && text.length > 50) {
      sendResponse({ text });
    } else {
      // If not found, wait for dynamic load
      waitForContent((newText) => {
        sendResponse({ text: newText });
      });
    }
    // Required when using async sendResponse
    return true;
  }
});
