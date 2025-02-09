import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLink, FiUser, FiClock, FiEye, FiArrowLeft } from 'react-icons/fi';
import { LuMousePointerClick } from "react-icons/lu";
import { Link } from 'react-router-dom';
import { VscVerifiedFilled } from "react-icons/vsc";
import ProfileHoverCard from './ProfileHoverCard';
import UsernameDisplay from './UsernameDisplay';
import ErrorRedirect from './ErrorRedirect';
import axios from '../api';

const UrlInfo = () => {
  const navigate = useNavigate();
  const { shortId } = useParams();
  const [urlInfo, setUrlInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredAuthor, setHoveredAuthor] = useState(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null);

  const handleMouseEnter = (e, author) => {
    setHoverAnchorEl(e.currentTarget);
    setHoveredAuthor(author);
  };

  const handleMouseLeave = () => {
    setHoverAnchorEl(null);
    setHoveredAuthor(null);
  };

  useEffect(() => {
    const fetchUrlInfo = async () => {
      try {
        const { data } = await axios.get(`/api/urls/info/${shortId}`);
        setUrlInfo(data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch URL information');
      } finally {
        setLoading(false);
      }
    };

    fetchUrlInfo();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) return <ErrorRedirect message={error} />;

  const getTimeUntilExpiry = (expiresAt) => {
    if (!expiresAt) return 'Never expires';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
  
    if (diff <= 0) return 'Expired';
  
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m left`;
    return 'Expiring soon';
  };

  return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
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
                       bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 
                       flex items-center justify-center">
            <FiLink className="w-6 h-6 text-yellow-500/75" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">URL Information</h1>
            <p className="text-gray-400">Details about this shortened URL</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Author Info */}
          <Link 
            to={`/user/${urlInfo.author.handle}`} 
            className="flex items-center gap-4 hover:bg-surface-2/50 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div 
              className="relative flex-shrink-0"
              onMouseEnter={(e) => handleMouseEnter(e, urlInfo.author)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="block w-10 h-10 rounded-full overflow-hidden border border-white/5">
                {urlInfo.author.avatar ? (
                  <img 
                    src={urlInfo.author.avatar}
                    alt={urlInfo.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {urlInfo.author.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-white font-medium flex items-center gap-1">
                <UsernameDisplay 
                  user={urlInfo.author}
                  className="text-white font-medium"
                />
                {urlInfo.author.isVerified && (
                  <VscVerifiedFilled className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="text-gray-400 text-sm">@{urlInfo.author.handle}</div>
            </div>
          </Link>

          {/* URL Info */}
          <div className="space-y-4 bg-surface-2/50 rounded-lg p-4 border border-white/5">
            <div>
              <div className="text-gray-400 text-sm mb-1">Original URL</div>
              <a 
                href={urlInfo.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors break-all"
              >
                {urlInfo.originalUrl}
              </a>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Shortened URL</div>
              <a 
                href={`/s/${urlInfo.shortId}`}
                className="text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                {window.location.host}/s/{urlInfo.shortId}
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <LuMousePointerClick className="w-4 h-4" />
                <span className="text-sm">Total Clicks</span>
              </div>
              <div className="text-2xl font-bold text-white">{urlInfo.clicks}</div>
            </div>

            <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiClock className="w-4 h-4" />
                <span className="text-sm">Expires In</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {getTimeUntilExpiry(urlInfo.expiresAt)}
              </div>
            </div>

            <div className="bg-surface-2/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiClock className="w-4 h-4" />
                <span className="text-sm">Created On</span>
              </div>
              <div className="text-lg font-bold text-white">
                {new Date(urlInfo.createdAt).toLocaleDateString()}
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

export default UrlInfo;