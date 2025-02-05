import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { SiSharex } from "react-icons/si";
import { useState } from 'react';

const ShareXConfig = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const config = {
    Version: "13.7.0",
    Name: "exlt.tech",
    DestinationType: "ImageUploader",
    RequestURL: "https://exlt.tech/api/images",
    Headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    Body: "MultipartFormData",
    FileFormName: "image",
    ResponseType: "Text",
    URL: "$json:url$", // Changed from {json:url}
    DeletionURL: "$json:deleteUrl$" // Changed from {json:deleteUrl}
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exlt-sharex.sxcu';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy config:', error);
    }
  };

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-6">
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <SiSharex className="w-5 h-5 text-red-600" />
          <h3 className="text-xl font-semibold text-text-primary">ShareX Configuration</h3>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Upload screenshots directly to i.exlt.tech using ShareX
        </p>
      </div>

      <div className="p-5 space-y-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white hover:border-red-400 rounded-md 
            transition-colors flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download Config
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-surface-2 hover:bg-surface-1 text-white rounded-md 
                       transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <FiCheck className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4" />
                  Copy Config
                </>
              )}
            </button>
          </div>

          <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
            <h4 className="text-sm font-medium text-white mb-2">Setup Instructions:</h4>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
              <li>Download and install ShareX from <a href="https://getsharex.com" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600">getsharex.com</a></li>
              <li>Download / Copy the config file using the button above</li>
              <li>Import the config file into ShareX, containing your private user token</li>
              <li>Take a screenshot using ShareX (default: Print Screen)</li>
              <li>Your screenshot will be uploaded to <a href="https://exlt.tech" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600">i.exlt.tech</a> automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareXConfig;