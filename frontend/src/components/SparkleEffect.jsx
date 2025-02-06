import React from 'react';
import { useEffect, useState } from 'react';

const Sparkle = ({ color = '#FFF', size = 4, style = {} }) => {
  return (
    <span
      className="absolute inline-block animate-sparkle-fade"
      style={{
        ...style,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 160 160" fill="none">
        <path
          d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
          fill={color}
        />
      </svg>
    </span>
  );
};

const SparkleEffect = ({ children, enabled = false }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    const generateSparkle = () => ({
      id: Math.random(),
      createdAt: Date.now(),
      color: ['#FFF', '#FFD', '#FFE'][Math.floor(Math.random() * 3)],
      size: Math.random() * 4 + 2, // Increased size range
      style: {
        top: Math.random() * 100 - 10 + '%', // Expanded range above and below
        left: Math.random() * 110 - 10 + '%', // Expanded range left and right
        zIndex: 2
      }
    });

    const addSparkles = () => {
      // Generate 10 sparkles at once
      const numSparkles = Math.floor(Math.random() * 3) + 5;
      const newSparkles = Array(numSparkles).fill().map(() => generateSparkle());
      
      setSparkles(prev => [...prev, ...newSparkles]);
      
      // Remove sparkles after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => !newSparkles.includes(s)));
      }, 500);
    };

    const interval = setInterval(addSparkles, 200); // Reduced interval
    return () => clearInterval(interval);
  }, [enabled]);

  return (
    <span className="inline-block relative">
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          color={sparkle.color}
          size={sparkle.size}
          style={sparkle.style}
        />
      ))}
      <span className="relative z-1">{children}</span>
    </span>
  );
};

export default SparkleEffect;