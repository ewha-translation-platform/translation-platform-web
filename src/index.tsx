import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://ce8bbc53f72e42bb9c33520ba9744343@o1118404.ingest.sentry.io/6152294",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// reportWebVitals();
