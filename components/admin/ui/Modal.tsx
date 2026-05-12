"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(10,12,30,0.5)" }}
         onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-elev)", border: "1px solid var(--line)",
          borderRadius: 16, boxShadow: "var(--shadow-pop)",
          width: size === "lg" ? "min(840px, 95vw)" : "min(560px, 92vw)",
          maxHeight: "90vh", display: "flex", flexDirection: "column",
          animation: "modalIn 0.22s ease",
        }}>
        <div className="flex items-center justify-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ padding: 18, overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && (
          <div className="flex justify-end gap-2" style={{ padding: "12px 18px", borderTop: "1px solid var(--hairline)", background: "var(--bg-sunk)" }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { transform: translateY(8px) scale(0.98); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </div>
  );
}
