import { useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Toast {
    id: number; message: string; type: 'success' | 'error';
}

interface ToastContextType {
    toast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => { } });
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                        {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
