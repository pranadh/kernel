import React from 'react';
import LightningEffect from './LightningEffect';
import SparkleEffect from './SparkleEffect';
import GlowEffect from './GlowEffect';
import FireEffect from './FireEffect';
import IcyEffect from './IcyEffect';

const EffectsWrapper = ({ user, children, location }) => {
    
  // Get size based on current context
  const getEffectSize = () => {
    if (location?.includes('/u/')) return 'large';
    if (location?.includes('profile-hover')) return 'large';
    return 'normal';
  };

  if (!user?.effects?.enabled) {
    return children;
  }

  switch (user?.effects?.type) {
    case 'lightning':
      return (
        <LightningEffect enabled={true} config={user?.effects?.config}>
          {children}
        </LightningEffect>
      );
    case 'sparkle':
      return (
        <SparkleEffect enabled={true} config={user?.effects?.config}>
          {children}
        </SparkleEffect>
      );
    // In the switch statement:
    case 'glow':
      return (
        <GlowEffect 
          enabled={true} 
          config={user?.effects?.config}
          size={getEffectSize()}
        >
          {children}
        </GlowEffect>
      );
    case 'fire':
      return (
        <FireEffect enabled={true} config={user?.effects?.config}>
          {children}
        </FireEffect>
      );
    case 'icy':
      return (
        <IcyEffect enabled={true} config={user?.effects?.config}>
          {children}
        </IcyEffect>
      );
    default:
      return children;
  }
};

export default EffectsWrapper;