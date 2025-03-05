import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaSearch, FaCheck, FaTimes, FaEnvelope } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import UserBadges from '../UserBadges';
import RoleManager from '../RoleManager';
import UsernameDisplay from '../UsernameDisplay';
import axios from '../../api';

const UserManagement = ({ 
  users,
  searchQuery,
  setSearchQuery,
  selectedRole,
  setSelectedRole,
  isVerifiedFilter,
  setIsVerifiedFilter,
  handleVerification,
  handleRoleUpdate,
  setUsers
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showVerifiedDropdown, setShowVerifiedDropdown] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.roles.includes(selectedRole);
    const matchesVerified = isVerifiedFilter === '' || user.isVerified === (isVerifiedFilter === "true");
    
    return matchesSearch && matchesRole && matchesVerified;
  });

  const roles = {
    "": "All Roles",
    "admin": "Admin",
    "staff": "Staff",
    "dj": "DJ",
    "contributor": "Contributor"
  };

  const verifiedStatus = {
    "": "All Users",
    "true": "Verified",
    "false": "Not Verified"
  };

  const handleEmailUpdate = async (userId) => {
    try {
      // Validate email format before sending request
      if (!email.endsWith('@exlt.tech')) {
        setEmailError('Email must end with @exlt.tech');
        return;
      }

      const response = await axios.put(`/api/users/${userId}/email`, { 
        email: email.toLowerCase().trim() 
      });
      
      // Update users list with the response data
      const updatedUsers = users.map(user => 
        user._id === userId 
          ? { 
              ...user, 
              email: response.data.user.email, 
              hasEmail: response.data.user.hasEmail 
            }
          : user
      );
      
      setUsers(updatedUsers);
      setShowEmailModal(false);
      setEmail('');
      setEmailError('');

    } catch (error) {
      console.error('Email update error:', error);
      setEmailError(
        error.response?.data?.message || 
        'Failed to update email. Please try again.'
      );
    }
  };

  const EmailButton = ({ user }) => (
    <button
      onClick={() => {
        setSelectedUser(user);
        setEmail(user.email || '');
        setShowEmailModal(true);
      }}
      className={`p-1.5 rounded transition-colors ${
        user.hasEmail 
          ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' 
          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
      }`}
    >
      <FaEnvelope />
    </button>
  );

  const EmailModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-4">
          Update Email for @{selectedUser?.handle}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(''); // Clear error on input change
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEmailUpdate(selectedUser._id);
                  }
                }}
                placeholder="username@exlt.tech"
                className={`w-full bg-surface-2/50 border ${
                  emailError ? 'border-red-500' : 'border-white/5'
                } rounded-md px-4 py-2 text-text-primary placeholder:text-text-secondary/50`}
              />
              {!email.includes('@') && email.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                  @exlt.tech
                </span>
              )}
            </div>
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmail('');
                setEmailError('');
              }}
              className="px-4 py-2 text-text-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleEmailUpdate(selectedUser._id)}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md"
            >
              Update Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FaUsers className="w-6 h-6 text-text-secondary" />
          <h2 className="text-xl font-semibold text-text-primary">User Management</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:flex-none">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search by handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-auto bg-surface-2/50 border border-white/5 rounded-md pl-10 pr-4 py-2 
                        text-text-primary placeholder:text-text-secondary/50
                        focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50
                        transition-all duration-300"
            />
          </div>

          <div className="flex gap-4">
            {/* Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-2/50 border border-white/5 
                         rounded-md text-text-primary min-w-[150px] justify-between"
              >
                {roles[selectedRole]}
                <FiChevronDown className="w-4 h-4" />
              </button>
              
              {showRoleDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-2 border border-white/5 
                            rounded-md shadow-lg z-10">
                  {Object.entries(roles).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setSelectedRole(value);
                        setShowRoleDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-white/5 text-text-primary"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowVerifiedDropdown(!showVerifiedDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-2/50 border border-white/5 
                         rounded-md text-text-primary min-w-[150px] justify-between"
              >
                {verifiedStatus[isVerifiedFilter]}
                <FiChevronDown className="w-4 h-4" />
              </button>
              
              {showVerifiedDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-2 border border-white/5 
                            rounded-md shadow-lg z-10">
                  {Object.entries(verifiedStatus).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setIsVerifiedFilter(value);
                        setShowVerifiedDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-white/5 text-text-primary"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <span className="text-text-secondary whitespace-nowrap">
            Total: {filteredUsers.length}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {filteredUsers.map(user => (
          <div key={user._id} className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                                     transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between gap-4">
              <Link 
                to={`/u/${user.handle}`}
                className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5">
                  {user.avatar ? (
                    <img 
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                  flex items-center justify-center">
                      <span className="text-xl font-semibold text-text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <UsernameDisplay 
                      user={user}
                      className="text-white text-lg font-medium"
                    />
                  </div>
                  <div className="text-sm text-text-secondary">
                    @{user.handle}
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <EmailButton user={user} /> 
                <button
                  onClick={() => handleVerification(user._id, user.isVerified)}
                  className={`p-1.5 rounded transition-colors ${
                    user.isVerified 
                      ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {user.isVerified ? <FaCheck /> : <FaTimes />}
                </button>
                <UserBadges 
                  roles={user.roles} 
                  isVerified={user.isVerified}
                  disableHover={true}
                  disableTooltip={true}
                />
                <RoleManager
                  userId={user._id}
                  currentRoles={user.roles}
                  onUpdate={(roles) => handleRoleUpdate(user._id, roles)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {showEmailModal && selectedUser && <EmailModal />}
    </>
  );
};

export default UserManagement;