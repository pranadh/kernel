import React, { useState, useEffect } from 'react';

const random = (min, max) => Math.random() * (max - min) + min;

const MistParticle = ({ color = '#00FFFF', size, style }) => {
  const hexToRgb = (hex) => {
    // Remove '#' if present
    hex = hex.replace('#', '');
    
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Add leading zeros if needed
    while (hex.length < 6) {
      hex = hex + '0';
    }
    
    const result = /([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(color);

  const isDark = rgb && (rgb.r + rgb.g + rgb.b) / 3 < 128;
  
  // Adjust opacity based on color brightness
  const innerOpacity = isDark ? 1 : 0.4;
  const outerOpacity = isDark ? 1 : 0.1;

  return (
    <span
      className="absolute animate-mist-float"
      style={{
        ...style,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%,
          rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, ${innerOpacity}),
          rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, ${outerOpacity}))`,
        filter: 'blur(2px)',
        pointerEvents: 'none',
        '--direction': random(-1, 1) > 0 ? 'right' : 'left'
      }}
    />
  );
};

const IcyEffect = ({ children, enabled = false, config }) => {
  const [mistParticles, setMistParticles] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    const generateParticle = () => ({
      id: Math.random(),
      color: config?.color || '#00FFFF',
      size: random(6, 20),
      style: {
        left: `${random(-40, 40)}%`, // Wider spawn range
        top: `${random(20, 80)}%`,    // Full vertical range
        opacity: random(0.2, 0.7),
        '--opacity': random(0.2, 0.7)
      }
    });

    const addMistParticles = () => {
      // Create multiple particles per interval
      const particleCount = config?.particlesPerBurst || 3;
      const newParticles = Array(particleCount).fill(null).map(() => generateParticle());
      
      setMistParticles(prev => [...prev, ...newParticles]);
      
      // Remove particles after animation
      setTimeout(() => {
        newParticles.forEach(particle => {
          setMistParticles(prev => prev.filter(p => p.id !== particle.id));
        });
      }, config?.duration || 3000);
    };

    const interval = setInterval(addMistParticles, config?.frequency || 150);
    return () => clearInterval(interval);
  }, [enabled, config]);

  return (
    <span className="inline-block relative">
      {mistParticles.map(particle => (
        <MistParticle
          key={particle.id}
          color={particle.color}
          size={particle.size}
          style={particle.style}
        />
      ))}
      <span className="relative z-2">{children}</span>
    </span>
  );
};

export default IcyEffect;