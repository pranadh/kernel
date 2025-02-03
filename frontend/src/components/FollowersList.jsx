import React from 'react';
import { Link } from 'react-router-dom';
import UserBadges from './UserBadges';
import { VscVerifiedFilled } from "react-icons/vsc";
import { FaUserFriends } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const FollowersList = ({ users, title, onClose, onUserClick }) => {
  if (!users?.length) {
    return (
      <div className="w-full max-w-[1400px] mx-auto bg-surface-1/50 backdrop-blur-sm rounded-lg p-8 border border-white/5">
        <div className="flex flex-col items-center justify-center text-text-secondary space-y-3">
          <FaUserFriends className="w-12 h-12 opacity-50" />
          <p className="text-lg font-medium">No {title.toLowerCase()} yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5">
      {title && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center">
          <FaUserFriends className="w-6 h-6 text-text-secondary mr-3" />
          <h3 className="text-xl font-semibold text-text-primary flex-grow">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>
      )}
      
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="p-3 space-y-2">
          {users.map((user) => (
            <Link
              key={user._id}
              to={`/u/${user.handle}`}
              className="block group"
              onClick={() => {
                onUserClick?.();
                onClose?.();
              }}
            >
              <div className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                            transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5">
                      {user.avatar ? (
                        <img 
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                      flex items-center justify-center
                                      group-hover:from-primary/20 group-hover:to-primary-hover/20 transition-all duration-300">
                          <span className="text-xl font-semibold text-text-primary group-hover:text-primary">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary text-lg group-hover:text-primary transition-colors">
                          {user.username}
                        </span>
                        {user.isVerified && (
                          <VscVerifiedFilled className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="text-sm text-text-secondary group-hover:text-text-primary/75 transition-colors">
                        @{user.handle}
                      </div>
                    </div>
                  </div>

                  <UserBadges 
                    roles={user.roles} 
                    isVerified={false} 
                    disableHover={true}
                    disableTooltip={true}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowersList;