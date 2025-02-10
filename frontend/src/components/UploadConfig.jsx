import React, { useState } from 'react';
import { FiDownload, FiCopy, FiCheck, FiImage } from 'react-icons/fi';
import { FaApple } from "react-icons/fa";
import { SiSharex } from "react-icons/si";
import { useAuth } from '../context/AuthContext';

const UploadConfig = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sharex');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const token = localStorage.getItem('token');

  const sharexConfig = {
    Version: "13.7.0",
    Name: "exlt.tech",
    DestinationType: "ImageUploader",
    RequestURL: "https://exlt.tech/api/images",
    Headers: {
      Authorization: `Bearer ${token}`
    },
    Body: "MultipartFormData",
    FileFormName: "image",
    ResponseType: "Text",
    URL: "$json:url$",
    DeletionURL: "$json:deleteUrl$"
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(sharexConfig, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exlt-sharex.sxcu';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sharexConfig, null, 2));
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch (error) {
      console.error('Failed to copy config:', error);
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 -mt-8">
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center">
            <FiImage className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="text-xl font-semibold text-text-primary">Screenshot Upload Configuration</h3>
        </div>
      </div>

      <div className="flex border-b border-white/5">
      <button
        className={`rounded-none flex-1 px-6 py-3 text-sm font-medium focus:outline-none focus-visible:border-red-500 ${
            activeTab === 'sharex' 
            ? 'text-red-500 border-b-2 border-red-500 hover:border-red-500'
            : 'text-gray-400 hover:text-white border-b-2 border-transparent hover:border-transparent'
        }`}
        onClick={() => setActiveTab('sharex')}
        >
        <div className="flex items-center justify-center gap-2">
            <SiSharex className="w-4 h-4" />
            ShareX
        </div>
        </button>
        <button
        className={`rounded-none flex-1 px-6 py-3 text-sm font-medium focus:outline-none focus-visible:border-red-500 ${
            activeTab === 'ios' 
            ? 'text-red-500 border-b-2 border-red-500 hover:border-red-500' 
            : 'text-gray-400 hover:text-white border-b-2 border-transparent hover:border-transparent'
        }`}
        onClick={() => setActiveTab('ios')}
        >
        <div className="flex items-center justify-center gap-2">
            <FaApple className="w-4 h-4" />
            iOS
        </div>
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'sharex' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 hover:border-transparent text-white rounded-md 
                         transition-colors flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Download Config
              </button>
              <button
                onClick={handleCopyConfig}
                className="px-4 py-2 bg-surface-2 hover:bg-surface-1 text-white rounded-md 
                         transition-colors flex items-center gap-2"
              >
                {copiedConfig ? (
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
              <h4 className="text-sm font-medium text-white mb-2">ShareX Setup:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                <li>Download and install ShareX from <a href="https://getsharex.com" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600">getsharex.com</a></li>
                <li>Download or copy the config file</li>
                <li>Import the config into ShareX</li>
                <li>Take a screenshot (Print Screen)</li>
              </ol>
            </div>
          </div>
        ) : (
            <div className="space-y-6">
            <div className="flex items-center gap-4">
              <a 
                href="/uploads/exlt.tech.shortcut"
                download
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white hover:text-white rounded-md 
                         transition-colors flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Download Shortcut
              </a>
              <button
                onClick={handleCopyToken}
                className="px-4 py-2 bg-surface-2 hover:bg-surface-1 text-white rounded-md 
                         transition-colors flex items-center gap-2"
              >
                {copiedToken ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="w-4 h-4" />
                    Copy Token
                  </>
                )}
              </button>
            </div>
          
            <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
              <h4 className="text-sm font-medium text-white mb-2">iOS Setup:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                <li>Download the iOS shortcut file</li>
                <li>Open the shortcut file to import it into the Shortcuts app</li>
                <li>Replace YOURTOKEN with your authentication token:
                  <div className="inline-flex items-center gap-2 ml-2">
                    <code className="bg-surface-2 px-2 py-1 rounded text-xs text-gray-300">
                      {token?.substring(0, 30)}...
                    </code>
                  </div>
                </li>
                <li>Take a screenshot and interact to upload</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadConfig;