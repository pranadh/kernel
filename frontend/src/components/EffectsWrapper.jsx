import React from 'react';
import LightningEffect from './LightningEffect';

const EffectsWrapper = ({ user, children }) => {
  if (!user?.effects?.enabled || user?.effects?.type !== 'lightning') {
    return children;
  }

  return (
    <LightningEffect enabled={true} config={user?.effects?.config}>
      {children}
    </LightningEffect>
  );
};

export default EffectsWrapper;