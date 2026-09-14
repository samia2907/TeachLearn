import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css";
import "./design-system.css";
import "./workspace-theme.css";
import "./refined-ui.css";

import { LanguageProvider } from "./context/LanguageContext.jsx";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
