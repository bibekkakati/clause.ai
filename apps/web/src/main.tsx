import App from "@/App";
import "@/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root")!;

const appNode = (
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
    ReactDOM.hydrateRoot(rootElement, appNode);
} else {
    ReactDOM.createRoot(rootElement).render(appNode);
}
