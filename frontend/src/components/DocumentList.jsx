import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFile, FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from '../api';

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

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await axios.get('/api/documents/me');
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDeleteClick = (e, doc) => {
    e.preventDefault();
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/documents/${documentToDelete.documentId}`);
      setDocuments(documents.filter(doc => doc.documentId !== documentToDelete.documentId));
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  if (loading) return <div className="text-center py-8 mt-6">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8 mt-6">{error}</div>;

  if (!documents?.length) {
    return (
      <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg p-8 border border-white/5 mt-6">
        <div className="flex flex-col items-center justify-center text-text-secondary space-y-4">
          <FiFile className="w-12 h-12 opacity-50" />
          <p className="text-lg font-medium">No documents found</p>
          <Link 
            to="/new" 
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            New Document
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-6">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center">
            <FiFile className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-xl font-semibold text-text-primary">Your Documents</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">Total: {documents.length}</span>
            <Link 
              to="/new" 
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              New Document
            </Link>
          </div>
        </div>
        
        <div className="max-h-[415px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="p-3 flex flex-col space-y-2">
            {documents.map((doc) => (
              <div key={doc.documentId} className="block w-full">
                <div className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                              transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center justify-between gap-4">
                    <Link to={`/d/${doc.documentId}`} className="flex items-center gap-4 min-w-0 flex-1">
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary text-lg group-hover:text-primary 
                                       transition-colors truncate block">
                            {doc.title || 'Untitled Document'}
                          </span>
                        </div>
                        <div className="text-sm text-text-secondary group-hover:text-text-primary/75 
                                      transition-colors truncate">
                          {doc.content?.substring(0, 60) || 'No content'}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {/* Updated Date */}
                        <div className="relative group">
                          <button className="p-2 text-text-secondary hover:text-white hover:bg-surface-1 rounded-full transition-colors">
                            <FaRegCalendarAlt className="w-4 h-4" />
                          </button>
                          <div className="absolute right-full top-0 mr-2 w-[320px] p-2 bg-surface-2 rounded-lg border border-white/5 
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
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <FiEye className="w-4 h-4" />
                          <span className="text-sm">{doc.viewCount || 0} views</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteClick(e, doc)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                                    rounded-full transition-colors"
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
                className="font-semibold text-white inline-block max-w-[350px] truncate align-bottom"
                title={documentToDelete?.title || 'Untitled Document'}
              >{documentToDelete?.title || 'Untitled Document'}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDocumentToDelete(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentList;