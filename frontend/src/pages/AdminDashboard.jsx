import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaCheck, FaTimes, FaUsers, FaSearch } from 'react-icons/fa';
import axios from '../api';
import { useAuth } from '../context/AuthContext';
import UserBadges from '../components/UserBadges';
import RoleManager from '../components/RoleManager';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isVerifiedFilter, setIsVerifiedFilter] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.roles?.includes('admin')) {
      navigate('/');
      return;
    }
  
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/users/all');
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  useEffect(() => {
    let filtered = users.filter(user => 
      user.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedRole) {
      filtered = filtered.filter(user => 
        user.roles.includes(selectedRole)
      );
    }

    if (isVerifiedFilter !== null) {
      filtered = filtered.filter(user => 
        user.isVerified === isVerifiedFilter
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, selectedRole, isVerifiedFilter, users]);

  const handleVerification = async (userId, currentStatus) => {
    try {
      const { data } = await axios.patch(`/api/users/${userId}/verify`, {
        isVerified: !currentStatus
      });
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isVerified: data.isVerified } : user
      ));
    } catch (error) {
      setError('Failed to update verification status');
      console.error('Error:', error);
    }
  };

  const handleRoleUpdate = async (userId, newRoles) => {
    try {
      await axios.put(`/api/users/${userId}/roles`, { roles: newRoles });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, roles: newRoles } : user
      ));
    } catch (error) {
      setError('Failed to update roles');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[70px] bg-[#101113] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-[70px] bg-[#101113] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <FaUserShield className="text-4xl text-primary text-red-500" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>

          <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5">
            <div className="px-6 py-4 border-b border-white/5">
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
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="bg-surface-2/50 border border-white/5 rounded-md px-4 py-2 text-text-primary focus:outline-none"
                    >
                      <option value="">User</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="bug_hunter">Bug Hunter</option>
                      <option value="contributor">Contributor</option>
                    </select>

                    <select
                      value={isVerifiedFilter}
                      onChange={(e) => setIsVerifiedFilter(e.target.value ? JSON.parse(e.target.value) : null)}
                      className="bg-surface-2/50 border border-white/5 rounded-md px-4 py-2 text-text-primary focus:outline-none"
                    >
                      <option value="">-</option>
                      <option value="true">Verified</option>
                      <option value="false">Not Verified</option>
                    </select>
                  </div>

                  <span className="text-text-secondary whitespace-nowrap">
                    Total: {filteredUsers.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                          <span className="font-medium text-text-primary text-lg">
                            {user.username}
                          </span>
                        </div>
                        <div className="text-sm text-text-secondary">
                          @{user.handle}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;