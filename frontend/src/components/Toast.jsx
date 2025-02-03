import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500/90' : 'bg-green-500/90';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in-right">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-md shadow-lg ${bgColor}
                      text-white backdrop-blur-sm border border-white/10`}>
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <IoClose className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;