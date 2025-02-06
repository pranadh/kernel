import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEdit2, FiTrash2, FiCopy, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { FaRegCalendarAlt } from "react-icons/fa";
import { VscVerifiedFilled } from "react-icons/vsc";
import ProfileHoverCard from './ProfileHoverCard';
import UsernameDisplay from './UsernameDisplay';
import axios from '../api';

const DocumentViewer = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hoveredAuthor, setHoveredAuthor] = useState(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  const { documentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(`/api/documents/${documentId}/view`);
        setDocument(data);
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDocument();
  }, [documentId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/documents/${documentId}`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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

  if (loading) return <div className="min-h-screen pt-[70px] bg-[#101113] flex items-center justify-center">Loading...</div>;
  if (!document) return <div className="min-h-screen pt-[70px] bg-[#101113] flex items-center justify-center">Document not found</div>;

  const isAuthor = user?._id === document.author._id;

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      <div className="container mx-auto px-4 py-8 overflow-visible">
        <div className="max-w-4xl mx-auto bg-surface-2/50 rounded-xl border border-white/5 overflow-hidden backdrop-blur-sm">
          {/* Author Info and Stats Section */}
          <div className="bg-surface-2/50 p-6 border-b border-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-lg border border-white/5 
                          bg-surface-2/50 hover:bg-surface-2 
                          flex items-center justify-center transition-colors p-0"
                >
                  <FiArrowLeft className="w-6 h-6 text-white/75" />
                </button>
  
                <div 
                  className="relative flex-shrink-0"
                  onMouseEnter={(e) => handleMouseEnter(e, document.author)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link 
                    to={`/u/${document.author.handle}`}
                    className="flex items-center gap-3.5 p-3 rounded-lg hover:bg-[#24242f] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5">
                      {document.author.avatar ? (
                        <img 
                          src={document.author.avatar}
                          alt={document.author.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                          <span className="text-xl font-semibold text-white">
                            {document.author.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        <UsernameDisplay 
                          user={document.author}
                          className="text-lg font-medium text-white group-hover:text-primary transition-colors"
                        />
                        {document.author.isVerified && (
                          <VscVerifiedFilled className="w-5 h-5 text-primary" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-400">@{document.author.handle}</p>
                    </div>
                  </Link>
                </div>
              </div>
  
              <div className="flex items-center gap-5 text-sm text-gray-400">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <FaRegCalendarAlt className="w-4 h-4" />
                    <span>Last updated: {new Date(document.updatedAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaRegCalendarAlt className="w-4 h-4" />
                    <span>Date created: {new Date(document.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-white/30"></div>
                
                <div className="flex items-center gap-2">
                  <FiEye className="w-4 h-4" />
                  <span>{document.viewCount} views</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-white/5">
            <div className="flex justify-between items-center gap-4">
              <h1 
                className="text-2xl font-bold text-white truncate flex-1"
                title={document.title}
              >
                {document.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-surface-1 
                            text-white rounded-md transition-colors"
                  title="Copy document content"
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                {isAuthor && (
                  <>
                    <Link 
                      to={`/d/${document.documentId}/edit`}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover 
                                text-white rounded-md transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 
                                text-white rounded-md transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-surface-2/60 rounded-lg border border-white/5 p-6 min-h-[100px]">
              <div className="prose prose-invert max-w-none">
                <div className="grid grid-cols-[auto_1fr] gap-0">
                  {/* Line Numbers */}
                  <div className="text-right font-mono text-gray-500 select-none sticky left-0 bg-surface-2/60">
                    {document.content.trim().split('\n').map((_, i) => (
                      <div key={i} className="pr-4 border-r border-white/5 leading-6 h-6">
                        {i + 1}.
                      </div>
                    ))}
                  </div>
                  {/* Content with Scrollbar */}
                  <div className="overflow-x-auto">
                    <pre className="whitespace-pre font-mono text-base text-white min-w-min pl-4 leading-6">
                      {document.content.trim()}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-2 rounded-lg border border-white/5 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FiTrash2 className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Delete Document</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "<span 
                className="font-semibold text-white inline-block max-w-[200px] truncate align-bottom"
                title={document.title}
              >{document.title}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {hoveredAuthor && hoverAnchorEl && (
        <ProfileHoverCard 
          author={hoveredAuthor}
          anchorEl={hoverAnchorEl}
        />
      )}
    </div>
  );
};

export default DocumentViewer;