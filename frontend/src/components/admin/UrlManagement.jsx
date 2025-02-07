import React, { useState, useEffect } from 'react';
import { FiLink, FiSearch, FiTrash2, FiEdit2, FiSave, FiX, FiChevronDown } from 'react-icons/fi';
import { LuAlarmClock, LuMousePointerClick } from "react-icons/lu";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { Link } from 'react-router-dom';
import ProfileHoverCard from '../ProfileHoverCard';
import Toast from '../Toast';
import axios from '../../api';

const UrlManagement = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [searchType, setSearchType] = useState('shortId');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [error, setError] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [hoveredAuthor, setHoveredAuthor] = useState(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null);
  const [editForm, setEditForm] = useState({
    shortId: '',
    originalUrl: ''
  });

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const { data } = await axios.get('/api/urls/all');
        setUrls(data);
        setFilteredUrls(data);
      } catch (err) {
        setError('Failed to fetch URLs');
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  useEffect(() => {
    const filtered = urls.filter(url => 
      url.shortId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.author.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUrls(filtered);
  }, [searchQuery, urls]);

  const handleEdit = (url) => {
    setEditingUrl(url._id);
    setEditForm({
      shortId: url.shortId,
      originalUrl: url.originalUrl
    });
  };

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

  const handleCancel = () => {
    setEditingUrl(null);
    setEditForm({ shortId: '', originalUrl: '' });
  };

  const handleMouseEnter = (e, author) => {
    setHoverAnchorEl(e.currentTarget);
    setHoveredAuthor(author);
  };

  const handleMouseLeave = () => {
    setHoverAnchorEl(null);
    setHoveredAuthor(null);
  };

  const handleSave = async (urlId) => {
    try {
      const { data } = await axios.put(`/api/urls/${urlId}`, editForm);
      setUrls(urls.map(url => 
        url._id === urlId ? { ...url, ...data, author: url.author } : url
      ));
      setEditingUrl(null);
      setEditForm({ shortId: '', originalUrl: '' });
      setToast({
        show: true,
        message: 'URL updated successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to update URL',
        type: 'error'
      });
    }
  };

  const handleDelete = async (urlId) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) return;
    try {
      await axios.delete(`/api/urls/${urlId}`);
      setUrls(urls.filter(url => url._id !== urlId));
      setToast({
        show: true,
        message: 'URL deleted successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to delete URL',
        type: 'error'
      });
    }
  };

  const searchTypes = {
    shortId: 'Short ID',
    handle: 'Author Handle',
    originalUrl: 'Original URL'
  };

  useEffect(() => {
    const filtered = urls.filter(url => {
      const searchLower = searchQuery.toLowerCase();
      switch(searchType) {
        case 'shortId':
          return url.shortId.toLowerCase().includes(searchLower);
        case 'handle':
          return url.author.handle.toLowerCase().includes(searchLower);
        case 'originalUrl':
          return url.originalUrl.toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
    setFilteredUrls(filtered);
  }, [searchQuery, searchType, urls]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <FiLink className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-text-primary">URL Management</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-2/50 border-r-0 border border-white/5 
                             rounded-l-md text-text-primary"
                >
                  {searchTypes[searchType]}
                  <FiChevronDown className="w-4 h-4" />
                </button>
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-surface-2 border border-white/5 
                                rounded-md shadow-lg z-10">
                    {Object.entries(searchTypes).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setSearchType(value);
                          setShowSearchDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-white/5 text-text-primary"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search by ${searchTypes[searchType].toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-2/50 border border-white/5 rounded-r-md pl-10 pr-4 py-2 
                            text-text-primary placeholder:text-text-secondary/50
                            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          <span className="text-text-secondary whitespace-nowrap">
            Total: {filteredUrls.length}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {filteredUrls.map(url => (
          <div key={url._id} className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                                    transition-all duration-300 hover:border-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                            bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 
                            flex items-center justify-center flex-shrink-0">
                <FiLink className="w-6 h-6 text-yellow-500/75" />
              </div>

              <div className="flex-1 min-w-0">
                {editingUrl === url._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.shortId}
                      onChange={(e) => setEditForm({ ...editForm, shortId: e.target.value })}
                      className="w-full bg-surface-2 border border-white/5 rounded px-3 py-2 text-white"
                      placeholder="Short ID"
                    />
                    <input
                      type="url"
                      value={editForm.originalUrl}
                      onChange={(e) => setEditForm({ ...editForm, originalUrl: e.target.value })}
                      className="w-full bg-surface-2 border border-white/5 rounded px-3 py-2 text-white"
                      placeholder="Original URL"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(url._id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-500 rounded"
                      >
                        <FiSave className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div 
                      className="relative flex-shrink-0"
                      onMouseEnter={(e) => handleMouseEnter(e, url.author)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link 
                        to={`/u/${url.author.handle}`}
                        className="block w-8 h-8 rounded-full overflow-hidden border border-white/5"
                      >
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
                      </Link>
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
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="flex items-center gap-4">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(url)}
                    className="p-2 text-primary hover:text-white hover:bg-white/5 rounded-full transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(url._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'error' })}
        />
      )}
      {hoveredAuthor && hoverAnchorEl && (
        <ProfileHoverCard 
          author={hoveredAuthor}
          anchorEl={hoverAnchorEl}
        />
      )}
    </>
  );
};

export default UrlManagement;