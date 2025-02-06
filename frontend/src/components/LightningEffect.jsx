import React from 'react';
import { useEffect, useState } from 'react';

const Lightning = ({ color = '#FFF', size = 8, style = {} }) => {
  return (
    <span
      className="absolute inline-block animate-lightning"
      style={{
        ...style,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 32L12 24H14L10 16H18L14 8H20L16 0" 
          stroke={color}
          strokeWidth="4"
          fill="none"
        />
      </svg>
    </span>
  );
};

const LightningEffect = ({ children, enabled = false, config }) => {
    const [bolts, setBolts] = useState([]);
  
    useEffect(() => {
      if (!enabled) return;
  
      const generateBolt = () => {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 20 + 5;
          
          return {
            id: Math.random(),
            createdAt: Date.now(),
            // Use config.color instead of hardcoded white
            color: config?.color || '#FFF',
            size: Math.random() * 12 + 8,
            style: {
              top: `calc(-5px + ${Math.random() * 10}px)`,
              left: `calc(-5px + ${Math.random() * 80}%)`,
              transform: `rotate(${angle * (180/Math.PI)}deg)`,
              transformOrigin: 'bottom',
              zIndex: 2
            }
          };
        };
  
      const addBolts = () => {
        const numBolts = Math.floor(Math.random() * 3) + 2;
        const newBolts = Array(numBolts).fill().map(() => generateBolt());
        
        setBolts(prev => [...prev, ...newBolts]);
        
        setTimeout(() => {
          setBolts(prev => prev.filter(b => !newBolts.includes(b)));
        }, 150);
      };
  
      const interval = setInterval(addBolts, config?.frequency || 200);
      return () => clearInterval(interval);
    }, [enabled, config]);  // Add config to dependency array

  return (
    <span className="inline-block relative">
      {bolts.map(bolt => (
        <Lightning
          key={bolt.id}
          color={bolt.color}
          size={bolt.size}
          style={bolt.style}
        />
      ))}
      <span className="relative z-1">{children}</span>
    </span>
  );
};

export default LightningEffect;