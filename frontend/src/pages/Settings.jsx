import React, { useState } from 'react';
import { FiSettings, FiUser, FiZap, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { HiOutlineSparkles } from "react-icons/hi2";
import { useAuth } from '../context/AuthContext';
import axios from '../api';
import Toast from '../components/Toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [effect, setEffect] = useState(user?.effects?.type || null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [openEffect, setOpenEffect] = useState(null);
  const [effectConfig, setEffectConfig] = useState({
    lightning: {
      color: user?.effects?.config?.color || '#FFFFF',
      frequency: user?.effects?.config?.frequency || 200,
      enabled: user?.effects?.enabled && user?.effects?.type === 'lightning' || false
    },
    sparkle: {
      color: user?.effects?.config?.color || '#FFFFFF', 
      frequency: user?.effects?.config?.frequency || 100,
      enabled: user?.effects?.enabled && user?.effects?.type === 'sparkle' || false
    },
    glow: {
      color: user?.effects?.config?.color || '#FFFFF',
      frequency: user?.effects?.config?.frequency || 2000,
      enabled: user?.effects?.enabled && user?.effects?.type === 'glow' || false
    }
  });
  
  const ColorPreview = ({ color }) => (
    <div 
      className="w-6 h-6 rounded border border-white/10" 
      style={{ 
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}`
      }}
    />
  );

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put('/api/users/settings/username', { username });
      updateUser(data);
      setToast({
        show: true,
        message: 'Username updated successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to update username',
        type: 'error'
      });
    }
  };

  const handleEffectSave = async (type) => {
    try {
      const { data } = await axios.put('/api/users/effects', {
        type,
        enabled: effectConfig[type].enabled,
        config: {
          color: effectConfig[type].color,
          frequency: parseInt(effectConfig[type].frequency)
        }
      });
  
      // Update both effect type and config
      setEffect(type);
      updateUser(data); // Update the user context with new data
  
      setEffectConfig(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          enabled: data.effects.enabled
        }
      }));
  
      setToast({
        show: true,
        message: 'Effect updated successfully', 
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to update effect',
        type: 'error' 
      });
    }
  };

  const handleEffectToggle = async (type) => {
    try {
      // Send update to backend first
      const { data } = await axios.put('/api/users/effects', {
        type,
        enabled: !effectConfig[type].enabled, // Toggle from current state
        config: {
          color: effectConfig[type].color,
          frequency: parseInt(effectConfig[type].frequency)
        }
      });
  
      // Update local state after successful backend update
      setEffect(type);
      updateUser(data);
  
      // Update effect config from server response
      setEffectConfig(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          enabled: data.effects.enabled
        }
      }));
  
      setToast({
        show: true, 
        message: `Effects ${data.effects.enabled ? 'enabled' : 'disabled'}`,
        type: 'success'
      });
  
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to update effects',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#101113] pt-[70px]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <FiSettings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>

          <div className="flex gap-8">
            {/* Navigation Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-surface-1 rounded-none border-none hover:border-none focus:border-none overflow-hidden">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full flex items-center rounded-none gap-3 px-4 py-3 transition-colors
                    ${activeSection === 'profile' 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                >
                  <FiUser className="w-5 h-5" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => user?.isVerified && setActiveSection('effects')}
                  className={`w-full flex items-center rounded-none gap-3 px-4 py-3 transition-colors
                    ${!user?.isVerified 
                      ? 'opacity-50 cursor-not-allowed text-text-secondary' 
                      : activeSection === 'effects'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                >
                  <FiZap className="w-5 h-5" />
                  <span>Effects Settings</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-surface-1 rounded-lg border border-white/5 p-6">
                {activeSection === 'profile' ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <FiUser className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
                        <p className="text-text-secondary">Update your username</p>
                      </div>
                    </div>

                    <form onSubmit={handleUsernameSubmit} className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-white">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="mt-1 w-full p-3 bg-surface-2 rounded-lg border border-white/5 
                                   text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                          placeholder="Enter new username"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg 
                                 transition-colors"
                      >
                        Update Username
                      </button>
                    </form>
                  </>
                ) : (
                    <>
                    <div className="flex items-center gap-4 mb-6">
                      <FiZap className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold text-white">Effects Settings</h2>
                        <p className="text-text-secondary">Customize your profile effects</p>
                      </div>
                    </div>
                  
                    <div className="space-y-4">
                      {/* Lightning Effect Dropdown */}
                      <div className="border border-white/5 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenEffect(openEffect === 'lightning' ? null : 'lightning')}
                          className="w-full p-4 flex items-center justify-between bg-surface-2 hover:bg-surface-2/80 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <FiZap className="w-5 h-5 text-primary" />
                            <span className="text-white font-medium">Lightning Effect</span>
                          </div>
                          {openEffect === 'lightning' ? (
                            <FiChevronDown className="w-5 h-5 text-text-secondary" />
                          ) : (
                            <FiChevronRight className="w-5 h-5 text-text-secondary" />
                          )}
                        </button>
                        
                        {openEffect === 'lightning' && (
                          <div className="p-4 bg-surface-1 border-t border-white/5">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm text-text-secondary">Color (Hex)</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                    type="text"
                                    value={effectConfig.glow.color}
                                    onChange={(e) => setEffectConfig(prev => ({
                                        ...prev,
                                        glow: { ...prev.glow, color: e.target.value }
                                    }))}
                                    className="flex-1 p-2 bg-surface-2 rounded border border-white/5 
                                                text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                    placeholder="#00FFFF"
                                    />
                                    <ColorPreview color={effectConfig.glow.color} />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm text-text-secondary">Frequency (ms)</label>
                                <input
                                  type="number"
                                  value={effectConfig.lightning.frequency}
                                  onChange={(e) => setEffectConfig(prev => ({
                                    ...prev,
                                    lightning: { ...prev.lightning, frequency: e.target.value }
                                  }))}
                                  className="mt-1 w-full p-2 bg-surface-2 rounded border border-white/5 
                                           text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                  placeholder="200"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleEffectSave('lightning')}
                                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded 
                                           transition-colors"
                                >
                                  Save Configuration
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                  
                      {/* Sparkle Effect Dropdown */}
                      <div className="border border-white/5 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenEffect(openEffect === 'sparkle' ? null : 'sparkle')}
                          className="w-full p-4 flex items-center justify-between bg-surface-2 hover:bg-surface-2/80 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <HiOutlineSparkles className="w-5 h-5 text-primary" />
                            <span className="text-white font-medium">Sparkle Effect</span>
                          </div>
                          {openEffect === 'sparkle' ? (
                            <FiChevronDown className="w-5 h-5 text-text-secondary" />
                          ) : (
                            <FiChevronRight className="w-5 h-5 text-text-secondary" />
                          )}
                        </button>
                        
                        {openEffect === 'sparkle' && (
                          <div className="p-4 bg-surface-1 border-t border-white/5">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm text-text-secondary">Color (Hex)</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                    type="text"
                                    value={effectConfig.glow.color}
                                    onChange={(e) => setEffectConfig(prev => ({
                                        ...prev,
                                        glow: { ...prev.glow, color: e.target.value }
                                    }))}
                                    className="flex-1 p-2 bg-surface-2 rounded border border-white/5 
                                                text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                    placeholder="#00FFFF"
                                    />
                                    <ColorPreview color={effectConfig.glow.color} />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm text-text-secondary">Frequency (ms)</label>
                                <input
                                  type="number"
                                  value={effectConfig.sparkle.frequency}
                                  onChange={(e) => setEffectConfig(prev => ({
                                    ...prev,
                                    sparkle: { ...prev.sparkle, frequency: e.target.value }
                                  }))}
                                  className="mt-1 w-full p-2 bg-surface-2 rounded border border-white/5 
                                           text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                  placeholder="100"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleEffectSave('sparkle')}
                                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded 
                                           transition-colors"
                                >
                                  Save Configuration
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Glow Effect Dropdown */}
                        <div className="border border-white/5 rounded-lg overflow-hidden">
                            <button
                            onClick={() => setOpenEffect(openEffect === 'glow' ? null : 'glow')}
                            className="w-full p-4 flex items-center justify-between bg-surface-2 hover:bg-surface-2/80 transition-colors"
                            >
                            <div className="flex items-center gap-4">
                                <FiZap className="w-5 h-5 text-primary" />
                                <span className="text-white font-medium">Glow Effect</span>
                            </div>
                            {openEffect === 'glow' ? (
                                <FiChevronDown className="w-5 h-5 text-text-secondary" />
                            ) : (
                                <FiChevronRight className="w-5 h-5 text-text-secondary" />
                            )}
                            </button>
                            
                            {openEffect === 'glow' && (
                            <div className="p-4 bg-surface-1 border-t border-white/5">
                                <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-text-secondary">Color (Hex)</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                        type="text"
                                        value={effectConfig.glow.color}
                                        onChange={(e) => setEffectConfig(prev => ({
                                            ...prev,
                                            glow: { ...prev.glow, color: e.target.value }
                                        }))}
                                        className="flex-1 p-2 bg-surface-2 rounded border border-white/5 
                                                    text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                        placeholder="#00FFFF"
                                        />
                                        <ColorPreview color={effectConfig.glow.color} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-text-secondary">Frequency (ms)</label>
                                    <input
                                    type="number"
                                    value={effectConfig.glow.frequency}
                                    onChange={(e) => setEffectConfig(prev => ({
                                        ...prev,
                                        glow: { ...prev.glow, frequency: e.target.value }
                                    }))}
                                    className="mt-1 w-full p-2 bg-surface-2 rounded border border-white/5 
                                            text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                    placeholder="2000"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                    onClick={() => handleEffectSave('glow')}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded 
                                            transition-colors"
                                    >
                                    Save Configuration
                                    </button>
                                </div>
                                </div>
                            </div>
                            )}
                        </div>
                  
                      {/* Global Effects Toggle */}
                      <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border border-white/5">
                        <span className="text-white font-medium">Enable Effects</span>
                        <button
                            onClick={() => {
                                const currentEffect = openEffect || effect;
                                if (!currentEffect) return;
                                handleEffectToggle(currentEffect);
                            }}
                            className={`px-4 py-2 rounded transition-colors ${
                                effectConfig[openEffect || effect]?.enabled
                                ? 'bg-primary text-white hover:bg-primary-hover'
                                : 'bg-surface-1 text-text-secondary hover:bg-surface-1/80'
                            }`}
                            >
                            {effectConfig[openEffect || effect]?.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'error' })}
        />
      )}
    </div>
  );
};

export default Settings;