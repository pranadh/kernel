import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFile, FiEye, FiTrash2 } from 'react-icons/fi';
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

const UserDocuments = ({ documents, loading, handle, username, currentUser, setDocuments }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  if (loading) return <div className="text-center py-8">Loading documents...</div>;

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

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-6">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center">
          <FiFile className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-xl font-semibold text-text-primary">
            {username ? `${username}'s Documents` : 'Documents'}
          </h3>
        </div>
        <span className="text-text-secondary">Total: {documents?.length || 0}</span>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {documents?.length > 0 ? (
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary text-lg truncate">
                          {doc.title || 'Untitled Document'}
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary truncate">
                        {doc.content?.substring(0, 60) || 'No content'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {/* Calendar Hover Button */}
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
                        <div className="flex items-center gap-2 text-text-secondary font-normal">
                          <FiEye className="w-4 h-4" />
                          <span className="text-sm">{doc.viewCount || 0} views</span>
                        </div>
                        
                        {currentUser?.handle === handle && (
                          <button
                            onClick={(e) => handleDeleteClick(e, doc)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                                      rounded-full transition-colors relative group"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                          opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100]">
                              Delete
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FiFile className="w-12 h-12 text-text-secondary mb-4" />
            <p className="text-text-secondary text-lg">No documents found</p>
            <p className="text-text-secondary/75 text-sm mt-2">
              {username ? `${username} hasn't created any documents yet` : 'No documents available'}
            </p>
          </div>
        )}
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
    </div>
  );
};

export default UserDocuments;