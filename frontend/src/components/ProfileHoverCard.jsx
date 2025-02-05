import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from '../api';
import UserBadges from './UserBadges';
import { VscVerifiedFilled } from "react-icons/vsc";

const ProfileHoverCard = ({ author, anchorEl }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const cardRef = useRef(null);

  const calculatePosition = () => {
    if (!anchorEl || !cardRef.current) return;

    const avatarRect = anchorEl.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = avatarRect.bottom + 8;
    let left = avatarRect.left;

    if (top + cardRect.height > viewportHeight) {
      top = avatarRect.top - cardRect.height - 8;
    }

    if (left + cardRect.width > viewportWidth) {
      left = viewportWidth - cardRect.width - 16;
    }

    left = Math.max(16, left);
    setPosition({ top, left });
  };

  useEffect(() => {
    if (userData && cardRef.current) {
      calculatePosition();
      setTimeout(() => setIsVisible(true), 50);

      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [anchorEl, userData]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`/api/users/${author.handle}`);
        setUserData(data);
        setTimeout(() => setIsVisible(true), 50);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      setIsVisible(false);
    };
  }, [author.handle]);

  const handleProfileClick = () => {
    navigate(`/u/${userData.handle}`);
  };

  if (loading) return null;

  const bannerStyle = {
    backgroundColor: userData?.bannerColor || '#6366f1',
    backgroundImage: userData?.bannerImage ? `url(${userData.bannerImage})` : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  const borderStyle = {
    borderColor: userData?.bannerColor || '#6366f1'
  };

  return createPortal(
    <div
      ref={cardRef}
      className={`fixed w-[400px] bg-surface-2/95 backdrop-blur-sm rounded-lg border-4 
                shadow-xl overflow-hidden cursor-pointer z-[9999]
                transition-opacity duration-200 ease-in-out
                ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        ...borderStyle,
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: `translateY(${isVisible ? '0' : '8px'})`,
        transition: 'opacity 200ms ease-in-out, transform 200ms ease-in-out'
      }}
      onClick={handleProfileClick}
    >
      {/* Banner and Avatar */}
      <div className="h-24 relative" style={bannerStyle}>
        <div className="absolute -bottom-8 left-4">
          <div className="w-20 h-20 rounded-full border-4 border-surface-2 overflow-hidden">
            {userData?.avatar ? (
              <img src={userData.avatar} alt={userData.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface-1 flex items-center justify-center">
                <span className="text-xl font-semibold text-white">
                  {userData?.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Badges - Moved here */}
      {userData?.roles?.length > 0 && (
        <div className="flex justify-end px-4 mt-3">
          <UserBadges 
            roles={userData.roles} 
            disableHover={false}
            disableTooltip={true}
            iconSize={14}
          />
        </div>
      )}

      {/* Username and Handle Section */}
      <div className={`px-4 pb-4 ${(!userData?.roles?.length && !userData?.isVerified) ? 'mt-10' : 'mt-2'}`}>
        <div className="w-full bg-surface-1/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-xl">{userData?.username}</span>
            {userData?.isVerified && <VscVerifiedFilled className="w-5 h-5 text-primary" />}
          </div>
          <p className="text-sm text-gray-400">@{userData?.handle}</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileHoverCard;