import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (import.meta.hot) {
  const data = import.meta.hot.data as { root?: ReturnType<typeof createRoot> };
  const root = (data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}
