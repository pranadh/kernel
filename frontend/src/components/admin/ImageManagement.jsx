import React, { useState, useEffect } from 'react';
import { FiImage, FiSearch, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { FiClock, FiHardDrive } from 'react-icons/fi';
import ProfileHoverCard from '../ProfileHoverCard';
import Toast from '../Toast';
import axios from '../../api';

const ImageManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchType, setSearchType] = useState('imageId');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get('/api/images');
        setImages(data);
        setFilteredImages(data);
      } catch (err) {
        setError('Failed to fetch images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const searchTypes = {
    imageId: 'Image ID',
    handle: 'Author Handle'
  };

  useEffect(() => {
    const filtered = images.filter(image => {
      const searchLower = searchQuery.toLowerCase();
      switch(searchType) {
        case 'imageId':
          return image.imageId.toLowerCase().includes(searchLower);
        case 'handle':
          return image.author.handle.toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
    setFilteredImages(filtered);
  }, [searchQuery, searchType, images]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/api/images/${imageId}`);
      setImages(images.filter(image => image.imageId !== imageId));
      setToast({
        show: true,
        message: 'Image deleted successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to delete image',
        type: 'error'
      });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <FiImage className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-text-primary">Image Management</h2>
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
                          focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                />
              </div>
            </div>
          </div>

          <span className="text-text-secondary whitespace-nowrap">
            Total: {filteredImages.length}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {filteredImages.map(image => (
          <div key={image._id} className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                                      transition-all duration-300 hover:border-red-500/20 hover:shadow-lg hover:shadow-red-500/5">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/5 bg-surface-2 flex-shrink-0">
                <img 
                  src={`https://i.exlt.tech/${image.imageId}`}
                  alt="Screenshot"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative group flex-shrink-0">
                      <div className="block w-8 h-8 rounded-full overflow-hidden border border-white/5 cursor-pointer"
                           onClick={() => window.location.href = `/u/${image.author.handle}`}>
                        {image.author.avatar ? (
                          <img 
                            src={image.author.avatar} 
                            alt={image.author.username}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {image.author.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="hidden group-hover:block">
                        <ProfileHoverCard author={image.author} />
                      </div>
                    </div>

                    <div>
                      <a 
                        href={`https://i.exlt.tech/${image.imageId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:text-red-400 font-medium"
                      >
                        i.exlt.tech/{image.imageId}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-secondary">
                          {formatDate(image.createdAt)}
                        </span>
                      </div>
                      
                      <div className="h-8 w-px bg-white/10" />
                      
                      <div className="flex items-center gap-2">
                        <FiHardDrive className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-secondary">
                          {formatSize(image.size)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(image.imageId)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
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
    </>
  );
};

export default ImageManagement;