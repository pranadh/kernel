import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiImage, FiClock, FiArrowLeft, FiExternalLink, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { PiMouseScroll } from "react-icons/pi";
import { SlMagnifier } from "react-icons/sl";
import { VscVerifiedFilled } from "react-icons/vsc";
import ProfileHoverCard from './ProfileHoverCard';
import UsernameDisplay from './UsernameDisplay';
import ErrorRedirect from './ErrorRedirect';
import axios from '../api';

const ImageInfo = () => {
  const navigate = useNavigate();
  const { imageId } = useParams();
  const [imageInfo, setImageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hoveredAuthor, setHoveredAuthor] = useState(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(400);
  const [magnifierEnabled, setMagnifierEnabled] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const handleWheel = (e) => {
    if (!isZoomed || !magnifierEnabled) return;
    
    const delta = e.deltaY * -0.5;
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 100), 1000));
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    
    const elem = e.currentTarget;
    const { left, top, width, height } = elem.getBoundingClientRect();
    
    // Calculate relative mouse position
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    setMagnifierPos({ x, y });
  };
  
  const handleMagEnter = (e) => {
    if (isZoomed) setShowMagnifier(true);
  };
  
  const handleMagLeave = () => {
    setShowMagnifier(false);
  };

  const handleMouseEnter = (e, author) => {
    setHoverAnchorEl(e.currentTarget);
    setHoveredAuthor(author);
  };

  const handleMouseLeave = () => {
    setHoverAnchorEl(null);
    setHoveredAuthor(null);
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
    
    // If height > width (iOS image), set zoom to 100%, otherwise 400%
    const isPortrait = naturalHeight > naturalWidth;
    setZoomLevel(isPortrait ? 100 : 400);
  };

  const toggleZoom = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsZoomed(!isZoomed);
  };

  const handleZoomClose = (e) => {
    if (e.target === e.currentTarget) {
      setIsZoomed(false);
    }
  };

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
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
      <div className="text-white">Loading...</div>
    </div>
  );

  if (error) return <ErrorRedirect message={error} />;

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
            to={`/u/${imageInfo.author.handle}`} 
            className="flex items-center gap-4 hover:bg-surface-2/50 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div 
              className="relative flex-shrink-0"
              onMouseEnter={(e) => handleMouseEnter(e, imageInfo.author)}
              onMouseLeave={handleMouseLeave}
            >
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
            </div>
            <div>
              <div className="text-white font-medium flex items-center gap-1">
                <UsernameDisplay 
                  user={imageInfo.author}
                  className="text-white font-medium"
                />
                {imageInfo.author.isVerified && (
                  <VscVerifiedFilled className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="text-gray-400 text-sm">@{imageInfo.author.handle}</div>
            </div>
          </Link>

          {/* Image Preview */}
        <div className="relative">
            {isZoomed && (
                <div 
                    className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 mt-16
                   animate-in fade-in duration-500"
                    onClick={handleZoomClose}
                >
                    <div className="relative">
                    <img
                        src={`https://i.exlt.tech/${imageInfo.imageId}`}
                        alt="Preview"
                        className={`max-h-[calc(100vh-8rem)] max-w-[90vw] object-contain
                                    ${imageLoaded ? 'opacity-100' : 'opacity-0'} 
                                    ${showMagnifier && magnifierEnabled ? 'cursor-none' : 'cursor-pointer'}
                                    transition-all duration-200`}
                        onLoad={handleImageLoad}
                        onClick={toggleZoom}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMagEnter}
                        onMouseLeave={handleMagLeave}
                        onWheel={handleWheel}
                    />
                    {showMagnifier && magnifierEnabled && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            left: `${magnifierPos.x}%`,
                            top: `${magnifierPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '200px',
                            height: '200px',
                            border: '2px solid white',
                            borderRadius: '50%',
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(https://i.exlt.tech/${imageInfo.imageId})`,
                                backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                                backgroundSize: `${zoomLevel * 5}%`, // Multiplied by 2 for better zoom effect
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    </div>
                )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMagnifierEnabled(!magnifierEnabled);
                        }}
                        className="p-2 bg-black/50 hover:bg-black/75 rounded-full transition-colors"
                      >
                        <SlMagnifier className={`w-5 h-5 ${magnifierEnabled ? 'text-white' : 'text-gray-500'}`} />
                      </button>
                      <div className="bg-black/50 rounded-full px-3 py-2 text-white text-sm">
                        <PiMouseScroll className="w-4 h-4 inline-block mr-1 -mt-1" />
                        {Math.round(zoomLevel)}%
                      </div>
                    </div>
                    <button
                        onClick={toggleZoom}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/75 
                                rounded-full transition-colors"
                    >
                        <FiMinimize2 className="w-5 h-5 text-white" />
                    </button>
                    </div>
                </div>
                )}

            <div className="relative overflow-hidden rounded-lg border border-white/5">
            <img
                src={`https://i.exlt.tech/${imageInfo.imageId}`}
                alt="Preview"
                className="w-full aspect-video object-cover cursor-pointer"
                onClick={toggleZoom}
            />
            <button
                onClick={toggleZoom}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/75 
                        rounded-full transition-colors"
            >
                <FiMaximize2 className="w-5 h-5 text-white" />
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

      {hoveredAuthor && hoverAnchorEl && (
        <ProfileHoverCard 
          author={hoveredAuthor}
          anchorEl={hoverAnchorEl}
        />
      )}
    </div>
  );
};

export default ImageInfo;