const appUrl = "http://localhost:3000";
const urlTerms = ["sam.gov", "solicitation", "opportunity", "procurement", "bid", "rfp"];
const textTerms = [
  "solicitation",
  "naics",
  "due date",
  "statement of work",
  "proposal",
  "amendment",
  "contracting officer"
];

function visibleText() {
  return (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 24000);
}

function detectPage() {
  const url = window.location.href.toLowerCase();
  const text = visibleText().toLowerCase();
  const urlHit = urlTerms.some((term) => url.includes(term));
  const textHits = textTerms.filter((term) => text.includes(term));
  return {
    detected: urlHit || textHits.length >= 2,
    urlHit,
    textHits
  };
}

async function scoreCurrentPage() {
  const text = visibleText();
  const payload = {
    title: document.title || "Browser opportunity",
    url: window.location.href,
    text
  };

  try {
    const response = await fetch(`${appUrl}/api/extension/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    window.open(`${appUrl}${data.redirectUrl || "/score?source=extension"}`, "_blank");
  } catch {
    const params = new URLSearchParams({
      source: "extension",
      title: payload.title,
      url: payload.url
    });
    window.open(`${appUrl}/score?${params.toString()}`, "_blank");
  }
}

function injectButton() {
  if (document.getElementById("rfpops-score-button")) return;
  const detection = detectPage();
  if (!detection.detected) return;

  const button = document.createElement("button");
  button.id = "rfpops-score-button";
  button.textContent = "Score with RFPOps";
  button.style.position = "fixed";
  button.style.right = "18px";
  button.style.bottom = "18px";
  button.style.zIndex = "2147483647";
  button.style.border = "1px solid rgba(201,166,77,0.55)";
  button.style.borderRadius = "8px";
  button.style.background = "#c9a64d";
  button.style.color = "#090b10";
  button.style.font = "700 13px Inter, system-ui, sans-serif";
  button.style.padding = "11px 14px";
  button.style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)";
  button.addEventListener("click", scoreCurrentPage);
  document.body.appendChild(button);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "RFPOPS_DETECT") {
    sendResponse({ ...detectPage(), title: document.title, url: window.location.href });
  }
  if (message?.type === "RFPOPS_SCORE") {
    scoreCurrentPage().then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});

injectButton();
