"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastContextValue = { show: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

// README: "Toast: fixed bottom-right, navy, with a green ✓. Appears after
// every save or action and disappears after 2.2 seconds." Shared across the
// admin section so any page's Server Actions can report success the same way.
export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    setMessage(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-navy-800 px-4 py-3 text-sm font-medium text-white shadow-[0_12px_32px_rgba(11,20,48,0.35)]"
        >
          <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success text-[11px] text-white">
            ✓
          </span>
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx.show;
}
