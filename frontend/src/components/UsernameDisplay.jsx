import React from 'react';
import EffectsWrapper from './EffectsWrapper';

const UsernameDisplay = ({ user, className = "" }) => {
  return (
    <EffectsWrapper user={user}>
      <span className={className}>
        {user.username}
      </span>
    </EffectsWrapper>
  );
};

export default UsernameDisplay;