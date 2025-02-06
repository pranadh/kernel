import React, { useState } from 'react';
import { FiSmartphone } from 'react-icons/fi';

const IosSetup = () => {
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem('token');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-6">
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <FiSmartphone className="w-5 h-5 text-red-600" />
          <h3 className="text-xl font-semibold text-text-primary">
            iOS Screenshot Upload
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
            <h4 className="text-sm font-medium text-white mb-2">Setup Instructions:</h4>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
              <li>Open the Shortcuts app on your iOS device</li>
              <li>Create a new shortcut</li>
              <li>Add "Get Latest Screenshot" action</li>
              <li>Add "Get Contents of URL" action with these settings:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>URL: https://exlt.tech/api/images/ios</li>
                  <li>Method: POST</li>  
                  <li>Request Body: Form</li>
                  <li>Key: image, Value: Shortcut Input</li>
                </ul>
              </li>
              <li>Add Authentication Header:
                <div className="mt-2 flex items-center gap-2">
                  <code className="bg-surface-2 px-2 py-1 rounded text-xs text-gray-300">
                    Authorization: Bearer {token?.substring(0, 15)}...
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    {copied ? 'Copied!' : 'Copy Token'}
                  </button>
                </div>
              </li>
              <li>Enable shortcut in Share Sheet</li>
              <li>Your screenshots will upload to i.exlt.tech automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IosSetup;