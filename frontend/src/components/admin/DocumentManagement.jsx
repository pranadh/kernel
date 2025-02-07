import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFile, FiSearch, FiEdit2, FiTrash2, FiChevronDown, FiEye } from 'react-icons/fi';
import { FaRegCalendarAlt } from "react-icons/fa";
import ProfileHoverCard from '../ProfileHoverCard';
import Toast from '../Toast';
import axios from '../../api';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('title');
  const [hoveredAuthor, setHoveredAuthor] = useState(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const searchTypes = {
    title: 'Title',
    handle: 'Author Handle',
    documentId: 'Document ID'
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await axios.get('/api/documents/all');
        setDocuments(data);
        setFilteredDocs(data);
      } catch (err) {
        setError('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    const filtered = documents.filter(doc => {
      const searchLower = searchQuery.toLowerCase();
      switch(searchType) {
        case 'title':
          return doc.title.toLowerCase().includes(searchLower);
        case 'handle':
          return doc.author.handle.toLowerCase().includes(searchLower);
        case 'documentId':
          return doc.documentId.toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
    setFilteredDocs(filtered);
  }, [searchQuery, searchType, documents]);

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

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`/api/documents/${documentId}`);
      setDocuments(docs => docs.filter(d => d.documentId !== documentId));
      setToast({
        show: true,
        message: 'Document deleted successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to delete document',
        type: 'error'
      });
    }
  };

  const handleMouseEnter = (e, author) => {
    setHoverAnchorEl(e.currentTarget);
    setHoveredAuthor(author);
  };

  const handleMouseLeave = () => {
    setHoverAnchorEl(null);
    setHoveredAuthor(null);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <FiFile className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Document Management</h2>
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
            Total: {filteredDocs.length}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {filteredDocs.map(doc => (
          <div key={doc.documentId} className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                                           transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center gap-4">
              <Link to={`/d/${doc.documentId}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                              bg-gradient-to-br from-primary/10 to-primary-hover/10 
                              flex items-center justify-center flex-shrink-0">
                  <FiFile className="w-6 h-6 text-primary/75" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                  <div 
                    className="relative flex-shrink-0"
                    onMouseEnter={(e) => handleMouseEnter(e, doc.author)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link 
                      to={`/u/${doc.author.handle}`}
                      className="block w-8 h-8 rounded-full overflow-hidden border border-white/5"
                    >
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
                    </Link>
                  </div>

                    <div className="min-w-0">
                      <h3 className="font-medium text-lg text-white truncate">
                        {doc.title || 'Untitled Document'}
                      </h3>
                      <p className="text-sm text-gray-400">@{doc.author.handle}</p>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="flex flex-col gap-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <FaRegCalendarAlt className="w-4 h-4" />
                    <span>Updated: {formatDate(doc.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiEye className="w-4 h-4" />
                    <span>{doc.viewCount || 0} views</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/30"></div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/d/${doc.documentId}/edit`}
                    className="p-2 text-primary hover:text-white hover:bg-white/5 rounded-full transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(doc.documentId)}
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

export default DocumentManagement;