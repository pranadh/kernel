import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFile, FiEye } from 'react-icons/fi';
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from '../api';
import ProfileHoverCard from './ProfileHoverCard';

const GlobalDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalDocuments = async () => {
      try {
        const { data } = await axios.get('/api/documents/global');
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching global documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalDocuments();
  }, []);

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
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-6">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center">
          <FiFile className="w-6 h-6 text-text-secondary mr-3" />
          <h3 className="text-xl font-semibold text-text-primary">Recent Documents</h3>
        </div>
        <span className="text-text-secondary">Latest 20 documents</span>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="p-3 flex flex-col space-y-2">
          {documents.map((doc) => (
            <Link key={doc.documentId} to={`/d/${doc.documentId}`} className="block w-full">
              <div className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                            transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                                bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                flex items-center justify-center flex-shrink-0">
                    <FiFile className="w-6 h-6 text-primary/75" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="relative group flex-shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/5">
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

                  <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex flex-col gap-2 text-sm text-text-secondary font-normal">  {/* Add font-normal */}
                    <div className="flex items-center gap-2">
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span className="font-normal">Last updated: {formatDate(doc.updatedAt)}</span>  {/* Add font-normal */}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span className="font-normal">Date created: {formatDate(doc.createdAt)}</span>  {/* Add font-normal */}
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalDocuments;