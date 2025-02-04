import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFile, FiEye, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from '../api';
import ProfileHoverCard from './ProfileHoverCard';

const GlobalDocuments = ({ showUrlSection = true }) => {
  const [documents, setDocuments] = useState([]);
  const [shortUrls, setShortUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsResponse, urlsResponse] = await Promise.all([
          axios.get('/api/documents/global'),
          axios.get('/api/urls/global')
        ]);
        setDocuments(docsResponse.data);
        setShortUrls(urlsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
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
        
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                          <div className="relative group flex-shrink-0">
                            <div className="block w-8 h-8 rounded-full overflow-hidden border border-white/5 cursor-pointer"
                                 onClick={(e) => {
                                   e.preventDefault();
                                   window.location.href = `/u/${doc.author.handle}`;
                                 }}>
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
                            <div className="hidden group-hover:block">
                              <ProfileHoverCard author={doc.author} />
                            </div>
                          </div>
                          
                          <span className="font-medium text-text-primary text-lg truncate">
                            {doc.title || 'Untitled Document'}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex flex-col gap-2 text-sm text-text-secondary font-normal">
                        <div className="flex items-center gap-2">
                          <FaRegCalendarAlt className="w-4 h-4" />
                          <span className="font-normal">Last updated: {formatDate(doc.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaRegCalendarAlt className="w-4 h-4" />
                          <span className="font-normal">Date created: {formatDate(doc.createdAt)}</span>
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

      {/* Shortened URLs Section - Only show if showUrlSection is true */}
      {showUrlSection && (
        <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center">
              <FiLink className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold text-text-primary">Recent Shortened URLs</h3>
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
                          <div className="flex items-center gap-2">
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
                        <FaRegCalendarAlt className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-secondary">
                          {formatDate(url.createdAt)}
                        </span>
                      </div>
                      
                      <div className="h-8 w-px bg-white/30"></div>
                      
                      <div className="flex items-center gap-2 text-text-secondary">
                        <FiEye className="w-4 h-4" />
                        <span className="text-sm">{url.clicks || 0} clicks</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalDocuments;