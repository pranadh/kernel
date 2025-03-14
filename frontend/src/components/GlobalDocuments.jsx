import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiFile, FiEye, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from '../api';
import ProfileHoverCard from './ProfileHoverCard';

const GlobalDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAuthor, setHoveredAuthor] = useState(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsResponse] = await Promise.all([
          axios.get('/api/documents/global')
        ]);
        setDocuments(docsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMouseEnter = (e, author) => {
    setHoverAnchorEl(e.currentTarget);
    setHoveredAuthor(author);
  };

  const handleMouseLeave = () => {
    setHoverAnchorEl(null);
    setHoveredAuthor(null);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

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
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Documents Section */}
      <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-6">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center">
            <FiFile className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-xl font-semibold text-text-primary">Recent Documents</h3>
          </div>
          <span className="text-text-secondary">Latest 20 documents</span>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" ref={containerRef}>
          <div className="p-3 flex flex-col space-y-2">
            {documents.map((doc) => (
              <div key={doc.documentId} className="block w-full">
                <div className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                              transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center gap-4">
                    <Link to={`/d/${doc.documentId}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                                    bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                    flex items-center justify-center flex-shrink-0">
                        <FiFile className="w-6 h-6 text-primary/75" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div 
                            className="relative flex-shrink-0"
                            onMouseEnter={(e) => handleMouseEnter(e, doc.author)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className="block w-8 h-8 rounded-full overflow-hidden border border-white/5 cursor-pointer">
                              {doc.author.avatar ? (
                                <img 
                                  src={doc.author.avatar} 
                                  alt={doc.author.username}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-white">
                                    {doc.author.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <span className="font-medium text-text-primary text-lg truncate">
                            {doc.title || 'Untitled Document'}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {/* Calendar Hover Button */}
                        <div className="relative group">
                          <button className="p-2 text-text-secondary hover:text-white hover:bg-surface-1 rounded-full transition-colors">
                            <FaRegCalendarAlt className="w-4 h-4" />
                          </button>
                          <div className="absolute right-full top-0 mr-2 w-[320px] p-2 bg-neutral-900 rounded-lg border border-white/5 
                                        opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
                            <div className="text-sm text-text-secondary grid grid-cols-2 gap-4">
                              <div>
                                <div className="mb-1">Last updated:</div>
                                <div className="font-medium text-white">{formatDate(doc.updatedAt)}</div>
                              </div>
                              <div>
                                <div className="mb-1">Created:</div>
                                <div className="font-medium text-white">{formatDate(doc.createdAt)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-8 w-px bg-white/30"></div>
                      
                      <div className="flex items-center gap-2 text-text-secondary">
                        <FiEye className="w-4 h-4" />
                        <span className="text-sm">{doc.viewCount || 0} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

export default GlobalDocuments;