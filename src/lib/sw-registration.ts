const SW_URL = "/sw.js";
const UPDATE_INTERVAL = 60_000;

let waitingWorker: ServiceWorker | null = null;

function trackInstalling(
  worker: ServiceWorker,
  onUpdateReady: () => void,
): void {
  worker.addEventListener("statechange", () => {
    if (worker.state === "installed" && navigator.serviceWorker.controller) {
      waitingWorker = worker;
      onUpdateReady();
    }
  });
}

export function registerServiceWorker(onUpdateReady: () => void): void {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          void registration.unregister();
        }
      })
      .catch(() => undefined);
    return;
  }

  void navigator.serviceWorker
    .register(SW_URL, { updateViaCache: "none" })
    .then((registration) => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        waitingWorker = registration.waiting;
        onUpdateReady();
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (installing) {
          trackInstalling(installing, onUpdateReady);
        }
      });

      const checkForUpdate = () => {
        void registration.update().catch(() => undefined);
      };
      setInterval(checkForUpdate, UPDATE_INTERVAL);
      window.addEventListener("focus", checkForUpdate);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkForUpdate();
        }
      });
    })
    .catch(() => undefined);
}

export function applyUpdate(): void {
  if (!waitingWorker) {
    window.location.reload();
    return;
  }

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      window.location.reload();
    },
    { once: true },
  );

  waitingWorker.postMessage({ type: "SKIP_WAITING" });
}
