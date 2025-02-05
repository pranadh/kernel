import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiImage, FiUser, FiClock, FiArrowLeft, FiExternalLink, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import ProfileHoverCard from './ProfileHoverCard';
import axios from '../api';

const ImageInfo = () => {
  const navigate = useNavigate();
  const { imageId } = useParams();
  const [imageInfo, setImageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const fetchImageInfo = async () => {
      try {
        const { data } = await axios.get(`/api/images/info/${imageId}`);
        setImageInfo(data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch image information');
      } finally {
        setLoading(false);
      }
    };
    fetchImageInfo();
  }, [imageId]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
      <div className="text-white">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
      <div className="text-red-400 text-xl font-semibold">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg border border-white/5 
                        bg-surface-2/50 hover:bg-surface-2 
                        flex items-center justify-center transition-colors p-0"
                >
                <FiArrowLeft className="w-4 h-4 text-white/75" />
            </button>
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                       bg-gradient-to-br from-red-500/10 to-red-600/10 
                       flex items-center justify-center">
            <FiImage className="w-6 h-6 text-red-500/75" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Image Information</h1>
            <p className="text-gray-400">Details about this image</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Author Info */}
          <Link 
            to={`/user/${imageInfo.author.handle}`} 
            className="flex items-center gap-4 hover:bg-surface-2/50 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="relative group flex-shrink-0">
              <div className="block w-10 h-10 rounded-full overflow-hidden border border-white/5">
                {imageInfo.author.avatar ? (
                  <img 
                    src={imageInfo.author.avatar}
                    alt={imageInfo.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {imageInfo.author.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="hidden group-hover:block">
                <ProfileHoverCard author={imageInfo.author} />
              </div>
            </div>
            <div>
              <div className="text-white font-medium">{imageInfo.author.username}</div>
              <div className="text-gray-400 text-sm">@{imageInfo.author.handle}</div>
            </div>
          </Link>

          {/* Image Preview */}
          <div className="relative group">
            <div className={`relative overflow-hidden rounded-lg border border-white/5
                           ${isZoomed ? 'fixed inset-4 z-50 bg-black/90' : 'w-full aspect-video'}`}>
              <img
                src={`https://i.exlt.tech/${imageInfo.imageId}`}
                alt="Preview"
                className={`w-full h-full ${isZoomed ? 'object-contain' : 'object-cover'}`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/75 
                          rounded-full transition-colors"
              >
                {isZoomed ? 
                  <FiMinimize2 className="w-5 h-5 text-white" /> : 
                  <FiMaximize2 className="w-5 h-5 text-white" />
                }
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiExternalLink className="w-4 h-4" />
                <span className="text-sm">Direct Link</span>
              </div>
              <a
                href={`https://i.exlt.tech/${imageInfo.imageId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 transition-colors text-lg font-medium"
              >
                i.exlt.tech/{imageInfo.imageId}
              </a>
            </div>

            <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiClock className="w-4 h-4" />
                <span className="text-sm">Upload Date</span>
              </div>
              <div className="text-lg font-medium text-white">
                {new Date(imageInfo.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiImage className="w-4 h-4" />
                <span className="text-sm">File Size</span>
              </div>
              <div className="text-lg font-medium text-white">
                {formatSize(imageInfo.size)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageInfo;