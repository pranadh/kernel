import React, { useState } from 'react';
import { FiSettings, FiUser, FiZap, FiCloud } from 'react-icons/fi';
import { VscFlame } from "react-icons/vsc";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useAuth } from '../context/AuthContext';
import axios from '../api';
import Toast from '../components/Toast';
import EffectSection from '../components/EffectSection';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [effect, setEffect] = useState(user?.effects?.type || null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [openEffect, setOpenEffect] = useState(null);
  const [effectsEnabled, setEffectsEnabled] = useState(user?.effects?.enabled || false);
  const [effectConfig, setEffectConfig] = useState({
    lightning: {
      color: user?.effects?.config?.color || '#FFFFF',
      frequency: user?.effects?.config?.frequency || 200
    },
    sparkle: {
      color: user?.effects?.config?.color || '#FFFFFF', 
      frequency: user?.effects?.config?.frequency || 100
    },
    glow: {
      color: user?.effects?.config?.color || '#FFFFF',
      frequency: user?.effects?.config?.frequency || 2000
    },
    fire: {
      color: user?.effects?.config?.color || '#FF4500',
      frequency: user?.effects?.config?.frequency || 100
    },
    icy: {
      color: user?.effects?.config?.color || '#00FFFF',
      frequency: user?.effects?.config?.frequency || 2000
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
        enabled: effectsEnabled,
        config: {
          color: effectConfig[type].color,
          frequency: parseInt(effectConfig[type].frequency)
        }
      });
  
      setEffect(type);
      updateUser(data);
  
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

  const handleEffectToggle = async () => {
    try {
      const currentEffect = openEffect || effect;
      if (!currentEffect) return;
  
      const { data } = await axios.put('/api/users/effects', {
        type: currentEffect,
        enabled: !effectsEnabled, // Toggle global enabled state
        config: {
          color: effectConfig[currentEffect].color,
          frequency: parseInt(effectConfig[currentEffect].frequency)
        }
      });
  
      setEffectsEnabled(data.effects.enabled);
      updateUser(data);
  
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
                  // Profile Section
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
                  // Effects Section
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <FiZap className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold text-white">Effects Settings</h2>
                        <p className="text-text-secondary">Customize your profile effects</p>
                      </div>
                    </div>
  
                    {/* Global Effects Toggle - Moved to top */}
                    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border border-white/5 mb-4">
                      <span className="text-white font-medium">Enable Effects</span>
                      <button
                        onClick={handleEffectToggle}
                        className={`px-4 py-2 rounded transition-colors ${
                          effectsEnabled
                            ? 'bg-primary text-white hover:bg-primary-hover'
                            : 'bg-surface-1 text-text-secondary hover:bg-surface-1/80'
                        }`}
                      >
                        {effectsEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
  
                    <div className="space-y-4">
                      {/* Lightning Effect */}
                      <EffectSection 
                        type="lightning"
                        icon={<FiZap className="w-5 h-5 text-primary" />}
                        title="Lightning Effect"
                        isOpen={openEffect === 'lightning'}
                        onToggle={() => setOpenEffect(openEffect === 'lightning' ? null : 'lightning')}
                        config={effectConfig.lightning}
                        onConfigChange={(config) => setEffectConfig(prev => ({
                          ...prev,
                          lightning: config
                        }))}
                        onSave={() => handleEffectSave('lightning')}
                      />
  
                      {/* Sparkle Effect */}
                      <EffectSection 
                        type="sparkle"
                        icon={<HiOutlineSparkles className="w-5 h-5 text-primary" />}
                        title="Sparkle Effect"
                        isOpen={openEffect === 'sparkle'}
                        onToggle={() => setOpenEffect(openEffect === 'sparkle' ? null : 'sparkle')}
                        config={effectConfig.sparkle}
                        onConfigChange={(config) => setEffectConfig(prev => ({
                          ...prev,
                          sparkle: config
                        }))}
                        onSave={() => handleEffectSave('sparkle')}
                      />
  
                      {/* Glow Effect */}
                      <EffectSection 
                        type="glow"
                        icon={<FiZap className="w-5 h-5 text-primary" />}
                        title="Glow Effect"
                        isOpen={openEffect === 'glow'}
                        onToggle={() => setOpenEffect(openEffect === 'glow' ? null : 'glow')}
                        config={effectConfig.glow}
                        onConfigChange={(config) => setEffectConfig(prev => ({
                          ...prev,
                          glow: config
                        }))}
                        onSave={() => handleEffectSave('glow')}
                      />

                      {/* Fire Effect */}
                      <EffectSection 
                        type="fire"
                        icon={<VscFlame className="w-5 h-5 text-primary" />}
                        title="Fire Effect"
                        isOpen={openEffect === 'fire'}
                        onToggle={() => setOpenEffect(openEffect === 'fire' ? null : 'fire')}
                        config={effectConfig.fire}
                        onConfigChange={(config) => setEffectConfig(prev => ({
                          ...prev,
                          fire: config
                        }))}
                        onSave={() => handleEffectSave('fire')}
                      />

                      {/* Icy Effect */}
                      <EffectSection 
                        type="icy"
                        icon={<FiCloud className="w-5 h-5 text-primary" />}
                        title="Icy Effect"
                        isOpen={openEffect === 'icy'}
                        onToggle={() => setOpenEffect(openEffect === 'icy' ? null : 'icy')}
                        config={effectConfig.icy}
                        onConfigChange={(config) => setEffectConfig(prev => ({
                          ...prev,
                          icy: config
                        }))}
                        onSave={() => handleEffectSave('icy')}
                      />
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