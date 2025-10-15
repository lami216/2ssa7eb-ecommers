import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import i18n from "./lib/i18n";
import LanguageProvider from "./components/LanguageProvider.jsx";

createRoot(document.getElementById("root")).render(
        <StrictMode>
                <I18nextProvider i18n={i18n}>
                        <LanguageProvider>
                                <BrowserRouter>
                                        <App />
                                </BrowserRouter>
                        </LanguageProvider>
                </I18nextProvider>
        </StrictMode>
);
