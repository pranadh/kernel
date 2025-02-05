import React, { useState } from 'react';
import { FiImage, FiCopy, FiCheck, FiDownload, FiHardDrive, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { LuAlarmClock } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
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
    return 'Invalid date';
  }
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const UserImages = ({ images = [], loading, username, handle, currentUser, setImages }) => {
  const navigate = useNavigate();
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [editingImage, setEditingImage] = useState(null);
  const [editForm, setEditForm] = useState({ imageId: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleEdit = (e, image) => {
    e.stopPropagation();
    if (!currentUser?.isVerified) {
      setToast({
        show: true,
        message: 'Only verified users can edit image IDs',
        type: 'error'
      });
      return;
    }
    setEditingImage(image._id);
    setEditForm({ imageId: image.imageId });
  };

  const handleCancel = () => {
    setEditingImage(null);
    setEditForm({ imageId: '' });
  };

  const handleSave = async (e, imageId) => {
    e.stopPropagation();
    if (editForm.imageId.length > 8) {
      setToast({
        show: true,
        message: 'Image ID cannot be longer than 8 characters',
        type: 'error'
      });
      return;
    }
  
    try {
      // Change from _id to imageId in the endpoint
      const { data } = await axios.put(`/api/images/${imageId}`, editForm);
      setImages(prevImages => 
        prevImages.map(img => 
          img.imageId === imageId ? { ...img, ...data } : img
        )
      );
      setEditingImage(null);
      setEditForm({ imageId: '' });
      setToast({
        show: true,
        message: 'Image updated successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to update image',
        type: 'error'
      });
    }
  };

  const handleDelete = (e, image) => {
    e.stopPropagation();
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/images/${imageToDelete.imageId}`); // Using imageId instead of _id
      setImages(prevImages => prevImages.filter(img => img.imageId !== imageToDelete.imageId));
      setToast({
        show: true,
        message: 'Image deleted successfully',
        type: 'success'
      });
      setShowDeleteModal(false);
      setImageToDelete(null);
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to delete image',
        type: 'error'
      });
    }
  };

  const handleCardClick = (imageId, e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/info/i/${imageId}`);
  };

  if (loading) return <div className="text-center py-8">Loading images...</div>;

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-3">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center">
          <FiImage className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-xl font-semibold text-text-primary">
            {username ? `${username}'s Images` : 'Images'}
          </h3>
        </div>
        <span className="text-text-secondary">Total: {images?.length || 0}</span>
      </div>
      
      <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="w-full p-3 flex flex-col space-y-2">
          {images?.length > 0 ? (
            images.map((image) => (
              <div 
                key={image._id} 
                onClick={(e) => handleCardClick(image.imageId, e)}
                className="p-3 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                          transition-all duration-300 hover:border-red-500/20 hover:shadow-lg 
                          hover:shadow-red-500/5 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/5 bg-surface-2 flex-shrink-0">
                    <img 
                      src={`https://i.exlt.tech/${image.imageId}`}
                      alt="Screenshot"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingImage === image._id ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editForm.imageId}
                          onChange={(e) => setEditForm({ imageId: e.target.value })}
                          className="w-full bg-surface-2 border border-white/5 rounded px-3 py-2 text-white"
                          placeholder="New Image ID (max 8 characters)"
                          maxLength={8}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleSave(e, image.imageId)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-500 rounded"
                          >
                            <FiSave className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingImage(null);
                              setEditForm({ imageId: '' });
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded"
                          >
                            <FiX className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <a 
                          href={`https://i.exlt.tech/${image.imageId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-500 hover:text-red-400 font-medium truncate"
                        >
                          i.exlt.tech/{image.imageId}
                        </a>

                        <div className="flex items-center gap-4 text-sm text-text-secondary mt-2">
                          <div className="flex items-center gap-2">
                            <LuAlarmClock className="w-4 h-4" />
                            <span>{formatDate(image.createdAt)}</span>
                          </div>
                          <div className="h-8 w-px bg-white/30" />
                          <div className="flex items-center gap-2">
                            <FiHardDrive className="w-4 h-4" />
                            <span>{formatSize(image.size)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(`https://i.exlt.tech/${image.imageId}`, image._id);
                      }}
                      className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400
                              rounded-full transition-colors relative group"
                    >
                      {copiedUrl === image._id ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Copy URL
                      </div>
                    </button>

                    <a
                      href={`https://i.exlt.tech/${image.imageId}`}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 
                              rounded-full transition-colors relative group"
                    >
                      <FiDownload className="w-4 h-4" />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Download
                      </div>
                    </a>

                    <button
                      onClick={(e) => handleEdit(e, image)}
                      className={`p-2 rounded-full transition-colors relative group
                              ${currentUser?.isVerified 
                                ? "text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400" 
                                : "text-gray-600 cursor-not-allowed bg-surface-2/50"}`}
                    >
                      <FiEdit2 className="w-4 h-4" />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {currentUser?.isVerified ? "Edit Image ID" : "Verified users only"}
                      </div>
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, image)}
                      className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 
                              rounded-full transition-colors relative group"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Delete Image
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FiImage className="w-12 h-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">No images found</p>
              <p className="text-text-secondary/75 text-sm mt-2">
                {username ? `${username} hasn't uploaded any images yet` : 'No images available'}
              </p>
            </div>
          )}
        </div>
            {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface-2 rounded-lg border border-white/5 p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                <FiTrash2 className="w-6 h-6 text-red-400 " />
                <h3 className="text-xl font-semibold text-white">Delete Image</h3>
                </div>
                <p className="text-gray-300 mb-6">
                Are you sure you want to delete this image? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                <button
                    onClick={() => {
                    setShowDeleteModal(false);
                    setImageToDelete(null);
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
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}
    </div>
  );
};

export default UserImages;