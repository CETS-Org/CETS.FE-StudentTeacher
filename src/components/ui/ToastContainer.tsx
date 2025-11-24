import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast, { toast } from './Toast';
import type { ToastType } from './Toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([]);

  useEffect(() => {
    // Set up the toast listener
    toast.setListener((message: string, type: ToastType) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    });
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ animationDelay: `${index * 100}ms` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}

