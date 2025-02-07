import React, { useState, useEffect } from 'react';

const Fire = ({ color = '#FF4500', style = {}, content, className }) => {
  // Convert hex to RGB for gradient effects
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(color);
  
  return (
    <span
      className={`absolute inset-0 animate-flame ${className || ''}`}
      style={{
        ...style,
        background: `linear-gradient(-45deg, 
          transparent 0%,
          rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.1) 40%,
          rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.3) 60%,
          rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.5) 80%,
          rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.7) 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextStroke: `1px rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.5)`,
        textShadow: `
          0 0 4px rgba(255, 255, 255, 0.7),
          0 0 8px rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.7),
          0 0 12px rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.7),
          2px -4px 16px rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.5)
        `,
        color: 'transparent',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        animation: 'flame 2s infinite'
      }}
    >
      {content}
    </span>
  );
};

const FireEffect = ({ children, enabled = false, config, size = 'normal' }) => {
  const [fireElements, setFireElements] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    const generateFire = () => ({
      id: Math.random(),
      color: config?.color || '#FF4500',
      style: {
        zIndex: 1,
        transform: `scale(${1 + Math.random() * 0.05})`
      },
      content: children.props.children,
      className: children.props.className
    });

    const updateFire = () => {
      setFireElements([generateFire(), generateFire()]); // Generate two layers for more dynamic effect
    };

    updateFire();
    const interval = setInterval(updateFire, config?.frequency || 100);
    return () => clearInterval(interval);
  }, [enabled, config, children]);

  return (
    <span className="inline-block relative">
      {fireElements.map(fire => (
        <Fire
          key={fire.id}
          color={fire.color}
          style={fire.style}
          content={fire.content}
          className={fire.className}
          size={size}
        />
      ))}
      <span className="relative z-2">{children}</span>
    </span>
  );
};

export default FireEffect;