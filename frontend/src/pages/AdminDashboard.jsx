import React, { useState, useEffect } from 'react';
import { FaUserShield } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import UserManagement from '../components/admin/UserManagement';
import DocumentManagement from '../components/admin/DocumentManagement';
import UrlManagement from '../components/admin/UrlManagement';
import ImageManagement from '../components/admin/ImageManagement';
import AnalyticsManagement from '../components/admin/AnalyticsManagement';
import axios from '../api';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isVerifiedFilter, setIsVerifiedFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  const sections = {
    users: 'User Management',
    documents: 'Document Management',
    urls: 'URL Management',
    images: 'Image Management',
    analytics: 'System Analytics'
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/users/all');
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === 'users') {
      fetchUsers();
    }
  }, [activeSection]);

  const handleVerification = async (userId, currentStatus) => {
    try {
      await axios.patch(`/api/users/${userId}/verify`, {
        isVerified: !currentStatus
      });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isVerified: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  const handleRoleUpdate = async (userId, roles) => {
    try {
      await axios.put(`/api/users/${userId}/roles`, { roles });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, roles } : user
      ));
    } catch (error) {
      console.error('Error updating roles:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.section-dropdown')) {
        setShowSectionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8 -mt-16">
            <div className="flex items-center gap-4">
              <FaUserShield className="text-4xl text-red-500" />
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>

            <div className="relative section-dropdown">
              <button
                onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-2/50 border border-white/5 
                         rounded-md text-text-primary"
              >
                {sections[activeSection]}
                <FiChevronDown className="w-4 h-4" />
              </button>
              
              {showSectionDropdown && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-surface-2 border border-white/5 
                            rounded-md shadow-lg z-10">
                  {Object.entries(sections).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setActiveSection(value);
                        setShowSectionDropdown(false);
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

          <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
            {activeSection === 'users' && (
              <UserManagement 
                users={users}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                isVerifiedFilter={isVerifiedFilter}
                setIsVerifiedFilter={setIsVerifiedFilter}
                handleVerification={handleVerification}
                handleRoleUpdate={handleRoleUpdate}
              />
            )}
            {activeSection === 'documents' && <DocumentManagement />}
            {activeSection === 'urls' && <UrlManagement />}
            {activeSection === 'images' && <ImageManagement />}
            {activeSection === 'analytics' && <AnalyticsManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;