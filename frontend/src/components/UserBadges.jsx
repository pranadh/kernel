import React from 'react';
import { RiVipCrownLine } from "react-icons/ri";
import { VscVerifiedFilled } from "react-icons/vsc";
import { PiHammerBold } from "react-icons/pi";
import { LuBrain } from "react-icons/lu";
import { ImHeadphones } from "react-icons/im";

const UserBadges = ({ roles, isVerified, splitBadges = false, disableHover = false, disableTooltip = false, iconSize = 20 }) => {
  const getBadgeInfo = (role) => {
    const badges = {
      admin: { 
        icon: <RiVipCrownLine size={iconSize} />,
        color: 'text-red-500', 
        title: 'Admin',
        description: 'Site Administrator with full privileges'
      },
      staff: { 
        icon: <PiHammerBold size={iconSize} />, 
        color: 'text-violet-700', 
        title: 'Staff',
        description: 'Moderator helping maintain the community'
      },
      dj: { 
        icon: <ImHeadphones size={iconSize} />, 
        color: 'text-purple-500', 
        title: 'DJ',
        description: 'Ability to control music playback'
      },
      contributor: { 
        icon: <LuBrain size={iconSize} />, 
        color: 'text-rose-300', 
        title: 'Contributor',
        description: 'Active community contributor'
      }
    };
    return badges[role] || null;
  };

  const RoleBadges = () => (
    <div className="flex flex-row gap-2">
      {roles?.map((role) => {
        const badge = getBadgeInfo(role);
        if (!badge) return null;
        
        return (
          <div key={role} className={`relative inline-block ${disableTooltip ? '' : 'group'}`}>
            <span 
              className={`${badge.color} inline-flex items-center justify-center 
                         ${iconSize <= 16 ? 'px-4 py-1' : 'px-5 py-2'} 
                         rounded-md bg-black/70`}
            >
              {badge.icon}
            </span>
            {/* Only render tooltip if not disabled */}
            {!disableTooltip && (
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 absolute top-full left-1/2 transform -translate-x-1/2 mt-2 min-w-[200px] z-50">
                <div className="bg-black text-white rounded-md p-4 border border-neutral-950 flex flex-col items-center">
                  <div className={`${badge.color} text-2xl mb-2`}>
                    {badge.icon}
                  </div>
                  <strong className="text-lg mb-1">{badge.title}</strong>
                  <p className="text-sm text-gray-300 text-center">{badge.description}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const VerifiedBadge = () => (
    isVerified && (
      <div className="group relative">
        <span className="text-violet-700">
          <VscVerifiedFilled size={20} />
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <strong>Verified User</strong>
          <p className="text-xs text-gray-300">Account verified by staff</p>
        </div>
      </div>
    )
  );

  return splitBadges ? (
    <>
      <VerifiedBadge />
      <div className="ml-auto">
        <RoleBadges />
      </div>
    </>
  ) : (
    <div className="flex items-center gap-2">
      <RoleBadges />
      <VerifiedBadge />
    </div>
  );
};

export default UserBadges;