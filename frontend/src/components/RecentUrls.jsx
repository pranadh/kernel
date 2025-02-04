import React, { useState, useEffect } from 'react';
import { FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { LuAlarmClock, LuMousePointerClick } from "react-icons/lu";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import axios from '../api';
import ProfileHoverCard from './ProfileHoverCard';

const RecentUrls = () => {
  const [shortUrls, setShortUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const getTimeUntilExpiry = (expiresAt) => {
    if (!expiresAt) return 'Never expires';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
  
    if (diff <= 0) return 'Expired';
  
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else if (minutes > 0) {
      return `${minutes}m left`;
    } else {
      return 'Expiring soon';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/urls/global');
        setShortUrls(data);
      } catch (error) {
        console.error('Error fetching URLs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center">
          <FiLink className="w-6 h-6 text-yellow-500 mr-3" />
          <h3 className="text-xl font-semibold text-text-primary">Recent URLs</h3>
        </div>
        <span className="text-text-secondary">Latest 20 links</span>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="p-3 flex flex-col space-y-2">
          {shortUrls.map((url) => (
            <div key={url._id} className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                                      transition-all duration-300 hover:border-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                              bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 
                              flex items-center justify-center flex-shrink-0">
                  <FiLink className="w-6 h-6 text-yellow-500/75" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="relative group flex-shrink-0">
                      <div className="block w-8 h-8 rounded-full overflow-hidden border border-white/5 cursor-pointer"
                           onClick={() => window.location.href = `/u/${url.author.handle}`}>
                        {url.author.avatar ? (
                          <img 
                            src={url.author.avatar} 
                            alt={url.author.username}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {url.author.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="hidden group-hover:block">
                        <ProfileHoverCard author={url.author} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-text-secondary hover:text-white truncate">
                        {url.originalUrl}
                      </a>
                      <div className="flex items-center gap-1">
                      <MdSubdirectoryArrowRight className="w-4 h-4 text-yellow-600" />
                        <a href={`/s/${url.shortId}`} target="_blank" rel="noopener noreferrer" 
                           className="text-yellow-500 hover:text-yellow-400 font-medium truncate">
                          {window.location.host}/s/{url.shortId}
                        </a>
                        <button
                          onClick={() => handleCopy(`${window.location.origin}/s/${url.shortId}`, url._id)}
                          className="p-1.5 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex-shrink-0"
                        >
                          {copiedUrl === url._id ? 
                            <FiCheck className="w-4 h-4 text-yellow-500" /> : 
                            <FiCopy className="w-4 h-4 text-yellow-500" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <LuAlarmClock className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                        {getTimeUntilExpiry(url.expiresAt)}
                    </span>
                  </div>
                  
                  <div className="h-8 w-px bg-white/30"></div>
                  
                  <div className="flex items-center gap-2 text-text-secondary">
                    <LuMousePointerClick className="w-4 h-4" />
                    <span className="text-sm">{url.clicks || 0} clicks</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentUrls;