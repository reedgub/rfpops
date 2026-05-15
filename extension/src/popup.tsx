import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Gauge, LayoutDashboard } from "lucide-react";
import "./styles.css";

type Detection = {
  detected: boolean;
  title: string;
  url: string;
  textHits: string[];
};

function Popup() {
  const [detection, setDetection] = useState<Detection | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "RFPOPS_DETECT" }, (response) => {
        if (!chrome.runtime.lastError && response) setDetection(response);
      });
    });
  }, []);

  function sendToRfpops() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) {
        chrome.tabs.create({ url: "http://localhost:3000/score?source=extension" });
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: "RFPOPS_SCORE" }, () => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({ url: "http://localhost:3000/score?source=extension" });
        }
      });
    });
  }

  return (
    <div className="panel">
      <div className="brand">
        <div className="mark">RFP</div>
        <div>
          <strong>RFPOps</strong>
          <div className="muted">Bid-decision check</div>
        </div>
      </div>
      <div className="card">
        <span className="status">{detection?.detected ? "Likely RFP page" : "No RFP signal yet"}</span>
        <p className="muted">{detection?.title || "Open a procurement or solicitation page to score it."}</p>
        {detection?.textHits?.length ? <p className="muted">Signals: {detection.textHits.join(", ")}</p> : null}
      </div>
      <button onClick={sendToRfpops}>
        <Gauge size={16} /> Send page to RFPOps
      </button>
      <button className="secondary" onClick={() => chrome.tabs.create({ url: "http://localhost:3000/dashboard" })}>
        <LayoutDashboard size={16} /> Open dashboard
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
