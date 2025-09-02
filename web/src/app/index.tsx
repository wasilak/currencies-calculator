import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { I18nextProvider } from "react-i18next";
import i18next from "i18next";

import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import "./lib/utils";
import "./lib/index.css";

i18next.init({
    interpolation: { escapeValue: false }, // React already does escaping
});

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <I18nextProvider i18n={i18next}>
                    <App />
                </I18nextProvider>
            </ThemeProvider>
        </StrictMode>
    );
} else {
    console.error("Root element not found");
}
