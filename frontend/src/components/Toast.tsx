import React from "react";

export type ToastItem = { id: string; title: string; message: string };

export default function Toasts({ items, onClose }: { items: ToastItem[]; onClose: (id: string) => void }) {
  return (
    <div className="toast-wrap">
      {items.map(t => (
        <div className="toast" key={t.id} onClick={() => onClose(t.id)} role="button" aria-label="Close toast">
          <div className="toast-title">{t.title}</div>
          <p className="toast-msg">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
