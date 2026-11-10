import type { RcsoDiploma } from "@/data/types/rcso";

import { parseDiplomas } from "./rcso-diplomas";

const LOAD_TIMEOUT_MS = 20_000;

export type DiplomaLoadResult =
  | { status: "found"; diplomas: RcsoDiploma[] }
  | { status: "empty" }
  | { status: "error" };

const SANDBOX_DOCUMENT = `<!doctype html><meta charset="utf-8"><script>
Object.defineProperty(window, "diplomaCodes", {
  configurable: true,
  get: function () { return undefined; },
  set: function (value) {
    var script = document.currentScript;
    if (script) { script.diplomaCodes = value; }
  }
});
function reply(message) {
  try {
    parent.postMessage(message, "*");
  } catch (error) {
    parent.postMessage({ id: message.id, ok: false, broken: true }, "*");
  }
}
addEventListener("message", function (event) {
  if (event.source !== parent) { return; }
  var id = event.data.id;
  var url = event.data.url;
  var script = document.createElement("script");
  script.onload = function () {
    reply({ id: id, ok: true, data: script.diplomaCodes });
    script.remove();
  };
  script.onerror = function () {
    script.remove();
    reply({ id: id, ok: false, broken: true });
  };
  script.src = url;
  document.head.appendChild(script);
});
parent.postMessage({ ready: true }, "*");
</script>`;

interface SandboxMessage {
  ready?: unknown;
  id?: unknown;
  ok?: unknown;
  data?: unknown;
  broken?: unknown;
}

function toResult(message: SandboxMessage): DiplomaLoadResult {
  if (!message.ok) {
    return { status: "error" };
  }

  const diplomas = parseDiplomas(message.data);
  if (!diplomas) {
    return { status: "error" };
  }
  return diplomas.length > 0
    ? { status: "found", diplomas }
    : { status: "empty" };
}

// Loads every url in one sandbox and reports each result as soon as it
// arrives. The sandbox is removed once all urls are settled or on abort.
export function loadDiplomas(
  urls: string[],
  signal: AbortSignal,
  onResult: (url: string, result: DiplomaLoadResult) => void,
): void {
  const pending = new Map<number, string>();
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const iframe = document.createElement("iframe");
  iframe.sandbox.add("allow-scripts");
  iframe.hidden = true;
  iframe.setAttribute("aria-hidden", "true");

  const cleanup = () => {
    window.removeEventListener("message", onMessage);
    signal.removeEventListener("abort", cleanup);
    timeouts.forEach(clearTimeout);
    iframe.remove();
  };

  const settle = (id: number, result: DiplomaLoadResult) => {
    const url = pending.get(id);
    if (url === undefined) {
      return;
    }
    pending.delete(id);
    onResult(url, result);
    if (pending.size === 0) {
      cleanup();
    }
  };

  const onMessage = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) {
      return;
    }
    const message = (event.data ?? {}) as SandboxMessage;
    if (message.ready) {
      for (const [id, url] of pending) {
        iframe.contentWindow?.postMessage({ id, url }, "*");
      }
      return;
    }
    if (typeof message.id === "number") {
      settle(message.id, toResult(message));
    }
  };

  if (signal.aborted) {
    return;
  }

  urls.forEach((url, id) => {
    if (!/^https:\/\/[\w./-]+$/.test(url)) {
      onResult(url, { status: "error" });
      return;
    }
    pending.set(id, url);
    timeouts.push(
      setTimeout(() => {
        settle(id, { status: "error" });
      }, LOAD_TIMEOUT_MS),
    );
  });
  if (pending.size === 0) {
    return;
  }

  window.addEventListener("message", onMessage);
  signal.addEventListener("abort", cleanup);
  iframe.srcdoc = SANDBOX_DOCUMENT;
  document.body.appendChild(iframe);
}
