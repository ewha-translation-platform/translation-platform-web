import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://ce8bbc53f72e42bb9c33520ba9744343@o1118404.ingest.sentry.io/6152294",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// reportWebVitals();
