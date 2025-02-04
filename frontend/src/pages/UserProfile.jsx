import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaRegCalendarAlt, FaUserPlus, FaUserCheck, FaCamera } from "react-icons/fa";
import { VscVerifiedFilled } from "react-icons/vsc";
import { SketchPicker } from 'react-color';
import axios from "../api";
import UserBadges from '../components/UserBadges';
import FollowersList from '../components/FollowersList';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';
import UserDocuments from '../components/UserDocuments';

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
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bannerColor, setBannerColor] = useState('#6366f1');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [bannerImage, setBannerImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cleanHandle = handle.replace('@', '');
        const { data } = await axios.get(`/api/users/${cleanHandle}`);
        setProfile(data);
        setIsFollowing(data.followers?.includes(currentUser?._id));
        if (data.bannerColor) {
          setBannerColor(data.bannerColor);
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const isGif = file.type === 'image/gif';
    if (isGif && !profile?.isVerified) {
      setToast({
        show: true,
        message: "Only verified users can upload GIF avatars",
        type: 'error'
      });
      return;
    }
  
    try {
      let imageData;
  
      if (isGif) {
        // Handle GIF directly without compression
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const { data } = await axios.put('/api/users/profile', {
              avatar: reader.result
            });
            setProfile(prev => ({ ...prev, avatar: data.avatar }));
            setUser(prev => ({ ...prev, ...data }));
          } catch (error) {
            setError("Failed to upload avatar");
            console.error('Upload error:', error);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Handle other image formats with compression
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const { data } = await axios.put('/api/users/profile', {
              avatar: reader.result
            });
            setProfile(prev => ({ ...prev, avatar: data.avatar }));
            setUser(prev => ({ ...prev, ...data }));
          } catch (error) {
            setError("Failed to upload avatar");
            console.error('Upload error:', error);
          }
        };
        reader.readAsDataURL(compressedFile);
      }
    } catch (error) {
      setError("Failed to process image");
      console.error('Image processing error:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      document.title = `${profile.username} (@${profile.handle}) > Kernel`;
    } else {
      document.title = 'Profile > Kernel';
    }

    return () => {
      document.title = 'Home > Kernel';
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
  <FaCamera className="text-white w-4 h-4" />
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
  
    try {
      if (isGif) {
        // Handle GIF directly
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const { data } = await axios.put('/api/users/profile', {
              bannerImage: reader.result
            });
            setBannerImage(data.bannerImage);
            setProfile(prev => ({ ...prev, bannerImage: data.bannerImage }));
          } catch (error) {
            setToast({
              show: true,
              message: "Failed to upload banner",
              type: 'error'
            });
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Compress and handle other image formats
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const { data } = await axios.put('/api/users/profile', {
              bannerImage: reader.result
            });
            setBannerImage(data.bannerImage);
            setProfile(prev => ({ ...prev, bannerImage: data.bannerImage }));
          } catch (error) {
            setToast({
              show: true,
              message: "Failed to upload banner",
              type: 'error'
            });
          }
        };
        reader.readAsDataURL(compressedFile);
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to process image",
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
          <div className="absolute bottom-6 right-6 flex gap-2 z=10">
            <label className="backdrop-blur-sm px-4 py-2 rounded-md cursor-pointer
                          transition-colors hover:bg-white/20 text-white">
              <input 
                type="file" 
                className="hidden"
                accept={profile?.isVerified ? "image/*,.gif" : "image/jpeg,image/png,image/webp"}
                onChange={handleBannerUpload}
              />
              Upload Banner
            </label>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`backdrop-blur-sm px-4 py-2 rounded-md transition-colors
                        ${isLightColor(bannerColor) 
                          ? 'bg-black/10 text-black hover:bg-black/20' 
                          : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Change Color
            </button>
          </div>
        )}
        {showColorPicker && (
          <div className="absolute top-6 right-6 z-50"> {/* Changed from bottom-16 to top-6 */}
            <SketchPicker
              color={bannerColor}
              onChange={handleColorChange}
            />
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
                <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary-hover 
                                p-2 rounded-full cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                  <FaCamera className="text-white w-4 h-4" />
                </label>
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <UserDocuments 
            documents={documents} 
            loading={loadingDocuments}
            username={profile.username}
            currentUser={currentUser}
            setDocuments={setDocuments} 
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