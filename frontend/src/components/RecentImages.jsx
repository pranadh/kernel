import React, { useState, useEffect } from 'react';
import { FiImage, FiCopy, FiCheck, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import ProfileHoverCard from './ProfileHoverCard';

const RecentImages = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get('/api/images');
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
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

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center">
          <FiImage className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-xl font-semibold text-text-primary">Recent Images</h3>
        </div>
        <span className="text-text-secondary">Latest 20 uploads</span>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="p-3 flex flex-col space-y-2">
          {images.map((image) => (
            <div 
              key={image._id} 
              className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                        transition-all duration-300 hover:border-red-500/20 hover:shadow-lg 
                        hover:shadow-red-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/5 bg-surface-2 flex-shrink-0">
                  <img 
                    src={`https://i.exlt.tech/${image.imageId}`}
                    alt="Screenshot"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
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
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <a 
                      href={`https://i.exlt.tech/${image.imageId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-400 font-medium truncate"
                    >
                      i.exlt.tech/{image.imageId}
                    </a>
                    <button
                      onClick={() => handleCopy(`https://i.exlt.tech/${image.imageId}`, image._id)}
                      className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors flex-shrink-0"
                    >
                      {copiedUrl === image._id ? 
                        <FiCheck className="w-4 h-4 text-red-500" /> : 
                        <FiCopy className="w-4 h-4 text-red-500" />
                      }
                    </button>
                    <a
                      href={`https://i.exlt.tech/${image.imageId}`}
                      download
                      className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors flex-shrink-0"
                    >
                      <FiDownload className="w-4 h-4 text-red-500" />
                    </a>
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

export default RecentImages;