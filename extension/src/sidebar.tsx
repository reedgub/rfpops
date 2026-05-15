import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function Sidebar() {
  return (
    <div className="panel">
      <div className="brand">
        <div className="mark">RFP</div>
        <div>
          <strong>RFPOps Sidebar</strong>
          <div className="muted">Local MVP companion</div>
        </div>
      </div>
      <div className="card">
        <p className="muted">
          Use the floating page button or popup to send solicitation text to the RFPOps web app running at
          http://localhost:3000.
        </p>
      </div>
      <button onClick={() => chrome.tabs.create({ url: "http://localhost:3000/score?source=extension" })}>
        Open scoring flow
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Sidebar />);
