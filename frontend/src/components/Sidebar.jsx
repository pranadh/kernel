import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TbCrop, TbRuler, TbTextResize, TbTools } from 'react-icons/tb';
import { FiHash } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  
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
      path: '/metrics',
      name: 'URL Metrics',
      icon: <TbRuler className="w-5 h-5" />,
      description: 'Analyse URL performance'
    }
  ];

  return (
    <div className="fixed left-0 top-[70px] h-[calc(100vh-70px)] w-64 bg-surface-1 border-r border-white/5">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TbTools className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-medium text-white">Tools</h2>
        </div>
        
        <div className="space-y-2">
          {tools.map(tool => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;