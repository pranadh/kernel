import React, { useState, useEffect } from 'react';
import axios from '../api';
import { FaUserShield } from 'react-icons/fa';

const RoleManager = ({ userId, currentRoles, onUpdate }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(currentRoles || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axios.get('/api/roles/list');
        setRoles(data.roles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleRoleToggle = async (role) => {
    try {
      setLoading(true);
      const newRoles = selectedRoles.includes(role)
        ? selectedRoles.filter(r => r !== role)
        : [...selectedRoles, role];

      const { data } = await axios.post('/api/roles/assign', {
        userId,
        roles: newRoles
      });

      setSelectedRoles(data.roles);
      if (onUpdate) onUpdate(data.roles);
    } catch (error) {
      console.error('Error updating roles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaUserShield className="text-blue-500" />
        Manage Roles
      </h3>
      <div className="flex flex-wrap gap-2">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => handleRoleToggle(role)}
            disabled={loading}
            className={`px-3 py-1 rounded ${
              selectedRoles.includes(role)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            } transition-colors`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleManager;