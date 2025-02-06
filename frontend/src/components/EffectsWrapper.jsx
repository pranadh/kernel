import React from 'react';
import LightningEffect from './LightningEffect';
import SparkleEffect from './SparkleEffect';

const EffectsWrapper = ({ user, children }) => {
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
    default:
      return children;
  }
};

export default EffectsWrapper;