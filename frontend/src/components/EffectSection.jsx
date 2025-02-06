import React from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const ColorPreview = ({ color }) => (
  <div 
    className="w-6 h-6 rounded border border-white/10" 
    style={{ 
      backgroundColor: color,
      boxShadow: `0 0 10px ${color}`
    }}
  />
);

const EffectSection = ({ 
  type,
  icon,
  title,
  isOpen,
  onToggle,
  config,
  onConfigChange,
  onSave
}) => {
  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between bg-surface-2 hover:bg-surface-2/80 transition-colors"
      >
        <div className="flex items-center gap-4">
          {icon}
          <span className="text-white font-medium">{title}</span>
        </div>
        {isOpen ? (
          <FiChevronDown className="w-5 h-5 text-text-secondary" />
        ) : (
          <FiChevronRight className="w-5 h-5 text-text-secondary" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-surface-1 border-t border-white/5">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary">Color (Hex)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={config.color}
                  onChange={(e) => onConfigChange({
                    ...config,
                    color: e.target.value
                  })}
                  className="flex-1 p-2 bg-surface-2 rounded border border-white/5 
                           text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  placeholder="#00FFFF"
                />
                <ColorPreview color={config.color} />
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary">Frequency (ms)</label>
              <input
                type="number"
                value={config.frequency}
                onChange={(e) => onConfigChange({
                  ...config,
                  frequency: e.target.value
                })}
                className="mt-1 w-full p-2 bg-surface-2 rounded border border-white/5 
                         text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                placeholder={type === 'glow' ? '2000' : type === 'sparkle' ? '100' : '200'}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={onSave}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded 
                         transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EffectSection;