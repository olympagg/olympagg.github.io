import { useEffect, useRef, useState } from "react";

import { applyUpdate, registerServiceWorker } from "@/lib/sw-registration";
import { cn } from "@/lib/utils";

export function UpdateNotifier() {
  const shown = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    registerServiceWorker(() => {
      if (shown.current) {
        return;
      }
      shown.current = true;
      setVisible(true);
    });
  }, []);

  return (
    <div
      className={cn(
        "overflow-hidden transition-[max-height] duration-300 ease-out",
        visible ? "max-h-16" : "max-h-0",
      )}
    >
      <div className="flex items-center justify-center gap-4 bg-zinc-900/80 px-4 py-2.5 text-sm text-white backdrop-blur-sm">
        <span>Мы кое-что поменяли. Перезагрузите, чтобы увидеть изменения</span>
        <button
          onClick={applyUpdate}
          className="shrink-0 rounded-md border border-white/40 px-3 py-1 text-sm font-medium transition-colors hover:bg-white/10"
        >
          Обновить
        </button>
      </div>
    </div>
  );
}
