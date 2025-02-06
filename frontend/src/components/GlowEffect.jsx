import React from 'react';
import { useEffect, useState } from 'react';

const Glow = ({ color = '#00FFFF', style = {}, content, className }) => {
  const isVeryDark = color === '#000' || color === '#000000';
  
  return (
    <span
      className={`absolute inset-0 animate-pulse-glow ${className || ''}`}
      style={{
        ...style,
        WebkitTextStroke: `2px ${color}`,
        // Increased blur radius and added more shadow layers
        textShadow: isVeryDark 
          ? `0 0 4px #fff, 0 0 15px ${color}, 0 0 30px ${color}, 0 0 45px ${color}, 0 0 60px ${color}`
          : `0 0 15px ${color}, 0 0 30px ${color}, 0 0 45px ${color}, 0 0 60px ${color}`,
        color: 'transparent',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none'
      }}
    >
      {content}
    </span>
  );
};

const GlowEffect = ({ children, enabled = false, config, size = 'normal' }) => {
  const [glowElements, setGlowElements] = useState([]);

  useEffect(() => {
    if (!enabled) return;
  
    const generateGlow = () => ({
      id: Math.random(),
      color: config?.color || '#00FFFF',
      style: {
        zIndex: 1
      },
      content: children.props.children,
      className: children.props.className
    });
  
    const updateGlow = () => {
      const newGlow = generateGlow();
      setGlowElements([newGlow]);
    };
  
    // Initial glow
    updateGlow();
  
    // Update glow periodically
    const interval = setInterval(updateGlow, config?.frequency || 2000);
    return () => clearInterval(interval);
  }, [enabled, config, children]);

  return (
    <span className="inline-block relative">
      {glowElements.map(glow => (
        <Glow
          key={glow.id}
          color={glow.color}
          style={glow.style}
          content={glow.content}
          className={glow.className} // Pass className to Glow component
          size={size}
        />
      ))}
      <span className="relative z-2">{children}</span>
    </span>
  );
};

export default GlowEffect;