import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Trash2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

// ─── Toast Item ─────────────────────────────────────────────────────────────
const ICONS = {
  success: <CheckCircle size={18} className="text-success flex-shrink-0" />,
  error: <XCircle size={18} className="text-danger flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-gold flex-shrink-0" />,
  info: <Info size={18} className="text-accent2 flex-shrink-0" />,
};

const BORDER_COLORS = {
  success: 'border-success/30',
  error: 'border-danger/30',
  warning: 'border-gold/30',
  info: 'border-accent/30',
};

const ToastItem = ({ id, message, type = 'info', onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-center gap-3 bg-surface border ${BORDER_COLORS[type]} 
        rounded-2xl px-4 py-3 shadow-2xl shadow-black/40 min-w-[260px] max-w-[340px]`}
    >
      {ICONS[type]}
      <span className="text-white text-sm font-bold flex-1">{message}</span>
      <button onClick={() => onDismiss(id)} className="text-muted hover:text-white transition-colors ml-1">
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ─── Confirm Bottom Sheet ────────────────────────────────────────────────────
const ConfirmSheet = ({ config, onResolve }) => {
  const variant = config.variant || 'default';
  const btnClass = variant === 'danger'
    ? 'bg-danger text-white hover:bg-danger/80'
    : 'bg-accent text-white hover:bg-accent/80';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-safe"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onResolve(false)}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="relative bg-surface border border-border rounded-3xl p-6 w-full max-w-sm space-y-5 z-10"
      >
        <div className="flex items-start gap-3">
          {variant === 'danger'
            ? <div className="w-10 h-10 bg-danger/20 rounded-xl flex items-center justify-center flex-shrink-0"><Trash2 size={20} className="text-danger" /></div>
            : <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0"><AlertCircle size={20} className="text-accent2" /></div>
          }
          <div>
            <div className="text-white font-bold text-base leading-tight">{config.title}</div>
            {config.description && (
              <div className="text-muted text-sm mt-1 leading-relaxed">{config.description}</div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onResolve(false)}
            className="flex-1 py-3 rounded-xl border-2 border-border text-muted font-bold text-sm hover:bg-white/5 transition-colors"
          >
            {config.cancelLabel || 'Cancelar'}
          </button>
          <button
            onClick={() => onResolve(true)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${btnClass}`}
          >
            {config.confirmLabel || 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const resolveRef = useRef(null);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ message, type = 'info' }) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirmConfig(config);
    });
  }, []);

  const handleResolve = (value) => {
    setConfirmConfig(null);
    resolveRef.current?.(value);
    resolveRef.current = null;
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast container — above bottom nav */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem {...t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm bottom sheet */}
      <AnimatePresence>
        {confirmConfig && <ConfirmSheet config={confirmConfig} onResolve={handleResolve} />}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
