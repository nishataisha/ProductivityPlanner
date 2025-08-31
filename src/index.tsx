import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpotifyCallback from "./SpotifyCallback";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
