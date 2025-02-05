import React, { useState } from 'react';
import { FiLink, FiCopy, FiCheck, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { LuAlarmClock, LuMousePointerClick } from "react-icons/lu";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { BiInfinite } from "react-icons/bi";
import { Link, useNavigate } from 'react-router-dom';
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

const getTimeUntilExpiry = (expiresAt) => {
  if (!expiresAt) return 'Never expires';
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    return `${minutes}m left`;
  } else {
    return 'Expiring soon';
  }
};

const UserUrls = ({ urls = [], loading, username, handle, currentUser, onUrlsUpdate }) => {
    const navigate = useNavigate();
    const [copiedUrl, setCopiedUrl] = React.useState(null);
    const [editingUrl, setEditingUrl] = useState(null);
    const [editForm, setEditForm] = useState({
      shortId: '',
      originalUrl: ''
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [urlToDelete, setUrlToDelete] = useState(null);

    const isValidUrl = (url) => {
        try {
        new URL(url);
        return true;
        } catch {
        return false;
        }
    };
  
    const handleCopy = async (url, id) => {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(id);
        setTimeout(() => setCopiedUrl(null), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    };

    const handleRenew = async (urlId) => {
        try {
          const { data } = await axios.post(`/api/urls/${urlId}/renew`);
          if (onUrlsUpdate) {
            onUrlsUpdate(prevUrls => 
              prevUrls.map(url => 
                url._id === urlId ? { ...url, ...data } : url
              )
            );
          }
          setToast({
            show: true,
            message: 'URL expiration renewed successfully',
            type: 'success'
          });
        } catch (error) {
          setToast({
            show: true,
            message: error.response?.data?.message || 'Failed to renew URL',
            type: 'error'
          });
        }
      };

      const handleSetNeverExpire = async (urlId) => {
        try {
          const { data } = await axios.put(`/api/urls/${urlId}`, { 
            expiresAt: null 
          });
          
          if (onUrlsUpdate) {
            onUrlsUpdate(prevUrls => 
              prevUrls.map(url => 
                url._id === urlId ? { ...url, ...data, author: url.author } : url
              )
            );
          }
          
          setToast({
            show: true,
            message: 'URL set to never expire',
            type: 'success'
          });
        } catch (error) {
          setToast({
            show: true,
            message: error.response?.data?.message || 'Failed to update expiration',
            type: 'error'
          });
        }
      };
  
    const handleEdit = (url) => {
      setEditingUrl(url._id);
      setEditForm({
        shortId: url.shortId,
        originalUrl: url.originalUrl
      });
    };
  
    const handleCancel = () => {
      setEditingUrl(null);
      setEditForm({ shortId: '', originalUrl: '' });
    };
  
    const handleSave = async (urlId) => {
        // Validate URL before saving
        if (!isValidUrl(editForm.originalUrl)) {
          setToast({
            show: true,
            message: 'Please enter a valid URL (e.g. https://exlt.tech)',
            type: 'error'
          });
          return;
        }
    
        try {
          const { data } = await axios.put(`/api/urls/${urlId}`, editForm);
          if (onUrlsUpdate) {
            onUrlsUpdate(prevUrls => 
              prevUrls.map(url => 
                url._id === urlId ? { ...url, ...data, author: url.author } : url
              )
            );
          }
          setEditingUrl(null);
          setEditForm({ shortId: '', originalUrl: '' });
          setToast({
            show: true,
            message: 'URL updated successfully',
            type: 'success'
          });
        } catch (error) {
          setToast({
            show: true, 
            message: error.response?.data?.message || 'Failed to update URL',
            type: 'error'
          });
        }
      };
  
    const handleDelete = (e, url) => {
      e.stopPropagation();
      setUrlToDelete(url);
      setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
      try {
        await axios.delete(`/api/urls/${urlToDelete._id}`);
        if (onUrlsUpdate) {
          onUrlsUpdate(prevUrls => prevUrls.filter(url => url._id !== urlToDelete._id));
        }
        setToast({
          show: true,
          message: 'URL deleted successfully',
          type: 'success'
        });
        setShowDeleteModal(false);
        setUrlToDelete(null);
      } catch (error) {
        setToast({
          show: true,
          message: error.response?.data?.message || 'Failed to delete URL',
          type: 'error'
        });
      }
    };

    const handleCardClick = (shortId, e) => {
      // Prevent navigation if clicking on buttons or links
      if (e.target.closest('button') || e.target.closest('a')) {
        return;
      }
      navigate(`/info/s/${shortId}`);
    };

  if (loading) return <div className="text-center py-8">Loading URLs...</div>;

  const isOwnProfile = currentUser?.handle === handle;

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 mt-3">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center">
          <FiLink className="w-6 h-6 text-yellow-500 mr-3" />
          <h3 className="text-xl font-semibold text-text-primary">
            {username ? `${username}'s URLs` : 'Shortened URLs'}
          </h3>
        </div>
        <span className="text-text-secondary">Total: {urls?.length || 0}</span>
      </div>
      
      <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {urls?.length > 0 ? (
          <div className="w-full p-3 flex flex-col space-y-2">
            {urls.map((url) => (
              <div 
                key={url._id} 
                onClick={(e) => handleCardClick(url.shortId, e)}
                className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                        transition-all duration-300 hover:border-yellow-500/20 hover:shadow-lg 
                        hover:shadow-yellow-500/5 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                                bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 
                                flex items-center justify-center flex-shrink-0">
                    <FiLink className="w-6 h-6 text-yellow-500/75" />
                  </div>
  
                  <div className="flex-1 min-w-0">
                  {editingUrl === url._id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                        type="text"
                        value={editForm.shortId}
                        onChange={(e) => setEditForm({ ...editForm, shortId: e.target.value })}
                        className={`w-full bg-surface-2 border border-white/5 rounded px-3 py-2 text-white
                                ${!currentUser?.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Short ID"
                        disabled={!currentUser?.isVerified}
                        />
                        <input
                        type="url" 
                        value={editForm.originalUrl}
                        onChange={(e) => setEditForm({ ...editForm, originalUrl: e.target.value })}
                        className="w-full bg-surface-2 border border-white/5 rounded px-3 py-2 text-white"
                        placeholder="https://example.com"
                        pattern="https?://.*"
                        title="Please enter a valid URL starting with http:// or https://"
                        />
                        <div className="flex gap-2">
                        <button
                            onClick={() => handleSave(url._id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-500 rounded"
                        >
                            <FiSave className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded"
                        >
                            <FiX className="w-4 h-4" />
                            Cancel
                        </button>
                        </div>
                    </div>
                    ) : (
                    <div className="flex flex-col gap-1">
                      <a 
                        href={url.originalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        className="text-white hover:text-white truncate"
                      >
                        {url.originalUrl}
                      </a>
                      <div className="flex items-center gap-1">
                        <MdSubdirectoryArrowRight className="w-4 h-4 text-yellow-600" />
                        <a 
                          href={`/s/${url.shortId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-yellow-500 hover:text-yellow-400 font-medium truncate"
                        >
                          {window.location.host}/s/{url.shortId}
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(`${window.location.origin}/s/${url.shortId}`, url._id);
                          }}
                          className="p-1.5 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex-shrink-0"
                        >
                          {copiedUrl === url._id ? 
                            <FiCheck className="w-4 h-4 text-yellow-500" /> : 
                            <FiCopy className="w-4 h-4 text-yellow-500" />
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="flex flex-col gap-3"> {/* Changed from flex-row to flex-col */}
                    <div className="flex items-center gap-2">
                      <LuAlarmClock className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {getTimeUntilExpiry(url.expiresAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-text-secondary">
                      <LuMousePointerClick className="w-4 h-4" />
                      <span className="text-sm">{url.clicks || 0} clicks</span>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenew(url._id);
                        }}
                        className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 
                                rounded-full transition-colors relative group"
                      >
                        <LuAlarmClock className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Renew URL (30 days)
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(url);
                        }}
                        className="p-2 text-primary hover:text-white hover:bg-white/5 rounded-full transition-colors relative group"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Edit URL
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          currentUser?.isVerified && handleSetNeverExpire(url._id);
                        }}
                        className={`p-2 rounded-full transition-colors relative group
                                ${currentUser?.isVerified 
                                  ? "text-white hover:text-white hover:bg-white/5" 
                                  : "text-gray-600 cursor-not-allowed bg-surface-2/50"}`}
                      >
                        <BiInfinite className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {currentUser?.isVerified 
                            ? "Set to never expire" 
                            : "Verified users only"}
                        </div>
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, url)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors relative group"
                        >
                        <FiTrash2 className="w-4 h-4" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs text-white rounded
                                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Delete URL
                        </div>
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <FiLink className="w-12 h-12 text-text-secondary mb-4" />
          <p className="text-text-secondary text-lg">No shortened URLs found</p>
          <p className="text-text-secondary/75 text-sm mt-2">
            {username ? `${username} hasn't shortened any URLs yet` : 'No URLs available'}
          </p>
        </div>
      )}
    </div>

    {showDeleteModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-surface-2 rounded-lg border border-white/5 p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <FiTrash2 className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Delete URL</h3>
          </div>
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete "<span 
              className="font-semibold text-white inline-block max-w-[200px] truncate align-bottom"
              title={urlToDelete?.originalUrl}
            >
              {urlToDelete?.originalUrl}
            </span>"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setUrlToDelete(null);
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

    {toast.show && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'error' })}
      />
    )}
  </div>
);
};

export default UserUrls;