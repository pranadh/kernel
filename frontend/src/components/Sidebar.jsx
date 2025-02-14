import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiMusic } from 'react-icons/fi';
import { TbCrop, TbDeviceHeartMonitor, TbTextResize, TbTools, TbKeyboard } from 'react-icons/tb';
import { PiVinylRecord } from "react-icons/pi";
import { useAuth } from '../context/AuthContext'; // Add this import

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth(); // Add this hook
  
  const tools = [
    {
      path: '/crop',
      name: 'Image Crop',
      icon: <TbCrop className="w-5 h-5" />,
      description: 'Crop and resize images'
    },
    {
      path: '/wordcounter',
      name: 'Word Counter',
      icon: <TbTextResize className="w-5 h-5" />,
      description: 'Count words and characters'
    },
    {
      path: '/stats',
      name: 'Website Metrics',
      icon: <TbDeviceHeartMonitor className="w-5 h-5" />,
      description: 'View platform statistics'
    },
    {
      path: '/typingtest',
      name: 'Typing Test',
      icon: <TbKeyboard className="w-5 h-5" />,
      description: 'Test your typing speed'
    },
    {
      path: '/spotify',
      name: 'Song Requests',
      icon: <PiVinylRecord className="w-5 h-5" />,
      description: 'Play songs in my room'
    },
    {
      path: '/email',
      name: 'Email',
      icon: <FiMail className="w-5 h-5" />,
      description: 'Access your @exlt.tech email',
      requiresEmail: true // Add this flag
    }
  ];

  const renderToolLink = (tool) => {
    if (tool.requiresEmail && !user?.hasEmail) {
      return (
        <div
          key={tool.path}
          className="flex items-center gap-3 px-3 py-2 rounded-md 
                     text-gray-600 cursor-not-allowed bg-surface-2/50
                     group relative"
        >
          {tool.icon}
          <div>
            <div className="text-sm font-medium">{tool.name}</div>
            <div className="text-xs text-text-muted">Verified users only</div>
          </div>
          <FiLock className="w-4 h-4 ml-auto opacity-50" />
          
          {/* Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-black/90 
                        text-xs text-white rounded opacity-0 group-hover:opacity-100 
                        transition-opacity pointer-events-none whitespace-nowrap">
            Ask @toro for an exlt.tech email
          </div>
        </div>
      );
    }

    // Regular tool link
    return (
      <Link
        key={tool.path}
        to={tool.path}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
          ${location.pathname === tool.path 
            ? 'bg-primary/10 text-white' 
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'}`}
      >
        {tool.icon}
        <div>
          <div className="text-sm font-medium">{tool.name}</div>
          <div className="text-xs text-text-muted">{tool.description}</div>
        </div>
      </Link>
    );
  };

  return (
    <div className="fixed left-0 top-[70px] h-[calc(100vh-70px)] w-64 bg-surface-1 border-r border-white/5">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TbTools className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-medium text-white">Tools</h2>
        </div>
        
        <div className="space-y-2">
          {tools.map(tool => renderToolLink(tool))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;