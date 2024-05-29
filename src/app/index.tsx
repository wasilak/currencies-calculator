import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { I18nextProvider } from "react-i18next";
import i18next from "i18next";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

i18next.init({
    interpolation: { escapeValue: false }, // React already does escaping
});

root.render(
    <StrictMode>
        <I18nextProvider i18n={i18next}>
            <App />
        </I18nextProvider>
    </StrictMode>
);
