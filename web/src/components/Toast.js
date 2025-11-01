import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import '../theme.css';

const ToastContext = createContext({ notify: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = useCallback((opts) => {
    const id = Math.random().toString(36).slice(2);
    const toast = { id, type: opts.type || 'info', title: opts.title || '', message: opts.message || '' };
    setToasts(prev => [toast, ...prev]);
    const ttl = opts.ttl ?? 3500;
    if (ttl > 0) setTimeout(() => remove(id), ttl);
  }, [remove]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="hud-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`hud-toast ${t.type}`}>
            <div className="hud-icon" />
            <div>
              {t.title && <div className="hud-title">{t.title}</div>}
              {t.message && <div className="hud-message">{t.message}</div>}
            </div>
            <div className="hud-close" onClick={() => remove(t.id)}>✕</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;


