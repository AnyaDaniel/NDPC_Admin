"use client";
import { useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, children }: DrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(10,12,30,0.4)" }} onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
           style={{ width: "min(560px, 92vw)", background: "var(--bg-elev)", borderLeft: "1px solid var(--line)", boxShadow: "var(--shadow-pop)", animation: "drawerIn 0.24s ease" }}>
        {children}
      </div>
      <style>{`@keyframes drawerIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </>
  );
}
