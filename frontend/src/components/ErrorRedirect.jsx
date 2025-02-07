import React, { useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';

const ErrorRedirect = ({ message = 'Content not found', redirectDelay = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'https://exlt.tech';
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [redirectDelay]);

  return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6 text-center">
        <div className="text-red-400 text-xl font-semibold mb-4">{message}</div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <FiExternalLink className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-semibold text-white">
            Redirecting to <span className="text-red-400">https://exlt.tech</span>...
          </h2>
        </div>
        <div className="w-full bg-surface-2/50 rounded-full h-1 mb-6">
          <div className="bg-red-400 h-1 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default ErrorRedirect;