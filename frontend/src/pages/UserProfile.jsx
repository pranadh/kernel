import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaRegCalendarAlt, FaUserPlus, FaUserCheck } from "react-icons/fa";
import { FiTrash2, FiX } from "react-icons/fi";
import { VscVerifiedFilled } from "react-icons/vsc";
import { TbCameraPlus } from "react-icons/tb";
import { LuPaintbrush } from "react-icons/lu";
import { SketchPicker } from 'react-color';
import axios from "../api";
import UserBadges from '../components/UserBadges';
import FollowersList from '../components/FollowersList';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';
import UserDocuments from '../components/UserDocuments';
import UserUrls from '../components/UserUrls';
import UserImages from '../components/UserImages';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const isLightColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const brightness = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return brightness > 127.5;
};

const UserProfile = () => {
  const { handle } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [connections, setConnections] = useState({ followers: [], following: [] });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerColor, setColorPickerColor] = useState('#6366f1');
  const [bannerColor, setBannerColor] = useState('#6366f1');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [bannerImage, setBannerImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [urls, setUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cleanHandle = handle.replace('@', '');
        const { data } = await axios.get(`/api/users/${cleanHandle}`);
        setProfile(data);
        setIsFollowing(data.followers?.includes(currentUser?._id));
        if (data.bannerColor) {
          setBannerColor(data.bannerColor);
          setColorPickerColor(data.bannerColor); // Update color picker too
        }
        setBannerImage(data.bannerImage || null);
      } catch (error) {
        setError("Profile not found");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [handle, currentUser]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoadingDocuments(true);
        const { data } = await axios.get(`/api/users/${handle}/documents`);
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (profile) {
      fetchDocuments();
    }
  }, [handle, profile]);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoadingUrls(true);
        const { data } = await axios.get(`/api/urls/user/${handle}`);
        setUrls(data);
      } catch (error) {
        console.error('Error fetching URLs:', error);
      } finally {
        setLoadingUrls(false);
      }
    };
  
    if (profile) {
      fetchUrls();
    }
  }, [handle, profile]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        const { data } = await axios.get(`/api/images/user/${handle}`);
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoadingImages(false);
      }
    };
  
    if (profile) {
      fetchImages();
    }
  }, [handle, profile]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Don't compress if it's a GIF
    if (!file.type.includes('gif')) {
      try {
        // Compress image before uploading
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024
        };
        const compressedFile = await imageCompression(file, options);
        const formData = new FormData();
        formData.append('avatar', compressedFile);
        
        const { data } = await axios.post('/api/images/avatar', formData);
        setProfile(prev => ({ ...prev, avatar: data.url }));
        setUser(prev => ({ ...prev, avatar: data.url }));
      } catch (error) {
        setToast({
          show: true,
          message: "Failed to upload avatar",
          type: 'error'
        });
      }
    }
  };

  const handleColorPickerChange = (color) => {
    setColorPickerColor(color.hex);
  };

  const handleColorAccept = async () => {
    try {
      const { data } = await axios.put('/api/users/profile', {
        bannerColor: colorPickerColor
      });
      setBannerColor(colorPickerColor);
      setProfile(prev => ({ ...prev, bannerColor: colorPickerColor }));
      setShowColorPicker(false);
    } catch (error) {
      setError("Failed to update banner color");
    }
  };

  useEffect(() => {
    if (profile) {
      document.title = `${profile.username} (@${profile.handle}) > Exalt`;
    } else {
      document.title = 'Profile > Exalt';
    }

    return () => {
      document.title = 'Home > Exalt';
    };
  }, [profile]);
  
  // Update the file input to show accepted formats
  <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary-hover 
                p-2 rounded-full cursor-pointer group">
  <input 
    type="file" 
    className="hidden" 
    accept={profile?.isVerified ? "image/*,.gif" : "image/jpeg,image/png,image/webp"}
    onChange={handleAvatarUpload}
  />
  <TbCameraPlus className="text-white w-4 h-4" />
  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
    <div className="bg-black text-xs text-white rounded px-2 py-1 whitespace-nowrap">
      {profile?.isVerified ? 'Upload image or GIF' : 'Upload image'}
    </div>
  </div>
</label>

const handleBannerUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const isGif = file.type === 'image/gif';
  if (isGif && !profile?.isVerified) {
    setToast({
      show: true, 
      message: "Only verified users can upload GIF banners",
      type: 'error'
    });
    return;
  }

  const formData = new FormData();
  formData.append('banner', file);

  try {
    const { data } = await axios.post('/api/images/banner', formData);
    setBannerImage(data.url);
    setProfile(prev => ({ ...prev, bannerImage: data.url }));
  } catch (error) {
    setToast({
      show: true,
      message: "Failed to upload banner",
      type: 'error' 
    });
  }
};

  const handleRemoveAvatar = async () => {
    try {
      await axios.delete('/api/images/avatar');
      setProfile(prev => ({ ...prev, avatar: null }));
      setUser(prev => ({ ...prev, avatar: null }));
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Failed to remove avatar",
        type: 'error'
      });
    }
  };

  const handleRemoveBanner = async () => {
    try {
      await axios.delete('/api/images/banner');
      setProfile(prev => ({ ...prev, bannerImage: null }));
      setBannerImage(null);
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Failed to remove banner",
        type: 'error'
      });
    }
  };
  
  const handleColorChange = async (color) => {
    try {
      const { data } = await axios.put('/api/users/profile', {
        bannerColor: color.hex
      });
      
      // Update both banner color and profile state
      setBannerColor(color.hex);
      setProfile(prev => ({ ...prev, bannerColor: color.hex }));
      
      // Close color picker after successful update
      setShowColorPicker(false);
    } catch (error) {
      setError("Failed to update banner color");
      console.error('Color update error:', error);
    }
  };

  const fetchConnections = async (type) => {
    try {
      setLoadingConnections(true);
      const { data } = await axios.get(`/api/users/${handle}/${type}`);
      setConnections(prev => ({ ...prev, [type]: data }));
    } catch (error) {
      setError(`Failed to fetch ${type}`);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await axios.post(`/api/users/${profile.handle}/follow`);
      setIsFollowing(data.isFollowing);
      setProfile(prev => ({
        ...prev,
        followers: data.isFollowing 
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(id => id !== currentUser._id)
      }));
    } catch (error) {
      setError("Failed to update follow status");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;
  if (!profile) return <div className="text-center mt-20">No profile found</div>;

  return (
    <div className="min-h-screen bg-[#101113]">
      {/* Banner */}
      <div 
        className="h-48 md:h-100 lg:h-96 w-full relative" // Updated height classes
        style={{ 
          backgroundColor: bannerColor,
          backgroundImage: profile.bannerImage ? `url(${profile.bannerImage})` : null,
          backgroundSize: 'cover',  // Changed to cover
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {currentUser?._id === profile._id && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <label className="backdrop-blur-sm p-3 rounded-md cursor-pointer
                          transition-colors bg-black/40 text-white hover:bg-black/30 w-12 h-12
                          flex items-center justify-center">
            <input 
              type="file" 
              className="hidden"
              accept={profile?.isVerified ? "image/*,.gif" : "image/jpeg,image/png,image/webp"}
              onChange={handleBannerUpload}
            />
            <TbCameraPlus className="w-6 h-6" />
          </label>
          {profile.bannerImage && (
            <button
              onClick={handleRemoveBanner}
              className="backdrop-blur-sm p-0 rounded-md transition-colors
                      bg-black/40 text-white hover:bg-black/30 w-12 h-12
                      flex items-center justify-center"
            >
              <FiX className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`backdrop-blur-sm p-3 rounded-md transition-colors w-12 h-12
                      flex items-center justify-center
                      ${isLightColor(bannerColor) 
                        ? 'bg-black/40 text-white hover:bg-black/30' 
                        : 'bg-black/40 text-white hover:bg-black/30'}`}
          >
            <LuPaintbrush className="w-6 h-6" />
          </button>
        </div>
      )}
        {showColorPicker && (
          <div className="absolute bottom-0 right-6 translate-y-full mt-2 z-50">
            <div className="p-4 bg-surface-2 rounded-lg border border-white/10">
              <SketchPicker
                color={colorPickerColor}
                onChange={handleColorPickerChange}
                disableAlpha={true}
                styles={{
                  default: {
                    picker: {
                      background: '#22222A', // Dark background
                      boxShadow: 'none'
                    },
                    saturation: {
                      borderRadius: '4px'
                    },
                    hue: {
                      borderRadius: '4px'
                    },
                    input: {
                      background: '#2a2b2e',
                      boxShadow: 'none',
                      color: '#fff'
                    },
                    label: {
                      color: '#9ca3af' // Gray text
                    },
                    hash: {
                      color: '#9ca3af'
                    }
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="px-4 py-2 bg-surface-1 hover:bg-surface-2 text-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleColorAccept}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-16 md:-mt-20 lg:-mt-24 relative z-10">
        <div className="max-w-4xl mx-auto bg-surface-1 rounded-lg p-8 shadow-lg">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-surface-1 overflow-hidden">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-4xl text-gray-300">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {currentUser?._id === profile._id && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-between"> {/* Changed: positioning and layout */}
                  {profile.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="bg-red-500 hover:bg-red-600 p-2 rounded-full translate-x-[-8px]" /* Added: translate for positioning */
                      title="Remove avatar"
                    >
                      <FiTrash2 className="text-white w-4 h-4" />
                    </button>
                  )}
                  <label className="bg-primary hover:bg-primary-hover p-2 rounded-full cursor-pointer translate-x-[8px]"> {/* Added: translate for positioning */}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    <TbCameraPlus className="text-white w-4 h-4" />
                  </label>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col gap-4 flex-grow">
              {/* Header with Username and Badges */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">
                      {profile.username}
                    </h1>
                    {profile.isVerified && (
                      <div className="relative group">
                      <VscVerifiedFilled className="w-5 h-5 text-primary" />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                    whitespace-nowrap border border-black">
                        Verified User
                      </div>
                    </div>
                    )}
                  </div>
                  <p className="text-gray-400">@{profile.handle}</p>
                </div>
                
                {/* Role Badges */}
                <div className="ml-auto">
                  <UserBadges 
                    roles={profile.roles} 
                    isVerified={false} 
                    splitBadges={true}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <button 
                    onClick={() => {
                      if (profile.followers?.length > 0) {
                        fetchConnections('followers');
                        setShowFollowers(true);
                      }
                    }}
                    disabled={!profile.followers?.length}
                    className={`text-gray-400 transition-colors ${
                      profile.followers?.length > 0 
                        ? 'hover:text-white cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-bold text-white">
                      {profile.followers?.length || 0}
                    </span>
                    {' '}followers
                  </button>
                  <button 
                    onClick={() => {
                      if (profile.following?.length > 0) {
                        fetchConnections('following');
                        setShowFollowing(true);
                      }
                    }}
                    disabled={!profile.following?.length}
                    className={`text-gray-400 transition-colors ${
                      profile.following?.length > 0 
                        ? 'hover:text-white cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-bold text-white">
                      {profile.following?.length || 0}
                    </span>
                    {' '}following
                  </button>
                </div>

                {/* Follow Button */}
                {currentUser && currentUser.handle !== profile.handle && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isFollowing 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <FaUserCheck />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-gray-400 mt-2">
                <FaRegCalendarAlt className="text-gray-500" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[2160px] px-1 py-8">
        <div className="max-w-[2160px] w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <UserDocuments 
            documents={documents} 
            loading={loadingDocuments}
            username={profile.username}
            handle={profile.handle}
            currentUser={currentUser}
            setDocuments={setDocuments} 
          />
          <UserUrls
            urls={urls}
            loading={loadingUrls}
            username={profile.username}
            handle={profile.handle}
            currentUser={currentUser}
            onUrlsUpdate={setUrls}
          />
          <UserImages
            images={images}
            loading={loadingImages}
            username={profile.username}
            handle={profile.handle}
            currentUser={currentUser}
            setImages={setImages}
          />
        </div>
      </div>

      {/* Modals */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4">
            <FollowersList
              users={connections.followers}
              title="Followers"
              onClose={() => setShowFollowers(false)}
              onUserClick={() => setShowFollowers(false)}
              loading={loadingConnections}
            />
          </div>
        </div>
      )}

      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'error' })}
        />
      )}

      {showFollowing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4">
            <FollowersList
              users={connections.following}
              title="Following"
              onClose={() => setShowFollowing(false)}
              onUserClick={() => setShowFollowing(false)}
              loading={loadingConnections}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;