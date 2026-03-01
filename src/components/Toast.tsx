import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-slideIn ${
        toast.type === 'success' 
          ? 'bg-white text-green-800 border-green-100' 
          : 'bg-white text-red-800 border-red-100'
      }`}
    >
      {toast.type === 'success' ? (
        <div className="p-1 bg-green-100 rounded-full">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      ) : (
        <div className="p-1 bg-red-100 rounded-full">
          <XCircle className="h-4 w-4 text-red-600" />
        </div>
      )}
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button 
        onClick={() => onRemove(toast.id)} 
        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <>
      {/* Backdrop overlay with blur - covers entire viewport */}
      <div 
        className="fixed inset-0 z-[9998] bg-white/30 backdrop-blur-lg"
        style={{ 
          pointerEvents: 'none',
        }}
      />
      
      {/* Toast notifications - above backdrop */}
      <div className="fixed z-[9999] bottom-6 right-6 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
