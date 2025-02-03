import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import UserBadges from './UserBadges';
import { VscVerifiedFilled } from "react-icons/vsc";

const ProfileHoverCard = ({ author }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div 
      className={`absolute top-full left-0 mt-2 w-[400px] bg-surface-2/95 backdrop-blur-sm 
                  rounded-lg border-4 shadow-xl z-50 overflow-hidden cursor-pointer
                  transition-all duration-200 transform
                  ${isVisible ? 'opacity-100 translate-y-0 animate-fade-in' : 'opacity-0 translate-y-1'}`}
      style={borderStyle} 
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
    </div>
  );
};

export default ProfileHoverCard;