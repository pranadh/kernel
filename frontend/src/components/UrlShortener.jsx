import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api';
import { FiLink, FiCopy, FiCheck, FiLock } from 'react-icons/fi';
import { LuAlarmClock } from "react-icons/lu";

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const { user } = useAuth();
  
  const [expiration, setExpiration] = useState({
    days: 30,
    hours: 0,
    minutes: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert expiration to minutes
      const totalMinutes = isUnlimited ? null : 
        (expiration.days * 24 * 60) + 
        (expiration.hours * 60) + 
        expiration.minutes;

      const { data } = await axios.post('/api/urls', {
        url,
        customAlias: customAlias || undefined,
        expiresIn: totalMinutes
      });

      const shortUrl = `${window.location.origin}/s/${data.customAlias || data.shortId}`;
      setShortenedUrl(shortUrl);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExpirationChange = (field, value) => {
    const limits = {
      days: user?.isVerified ? 365 : 30,
      hours: 23,
      minutes: 59
    };
  
    // Create new expiration state
    const newExpiration = { ...expiration };
    newExpiration[field] = Math.max(0, Math.min(parseInt(value) || 0, limits[field]));
  
    // Calculate total minutes
    const totalMinutes = 
      (newExpiration.days * 24 * 60) + 
      (newExpiration.hours * 60) + 
      newExpiration.minutes;
  
    // For non-verified users, cap at 30 days
    if (!user?.isVerified && totalMinutes > 30 * 24 * 60) {
      newExpiration.days = 30;
      newExpiration.hours = 0;
      newExpiration.minutes = 0;
    }

    // Enforce minimum 30 minutes
    if (totalMinutes < 30) {
        if (field === 'minutes') {
        newExpiration.minutes = 30;
        } else if (field === 'hours') {
        newExpiration.minutes = 30;
        newExpiration.hours = 0;
        } else {
        newExpiration.minutes = 30;
        newExpiration.hours = 0;
        newExpiration.days = 0;
        }
    }
  
    setExpiration(newExpiration);
  };

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-5 mt-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <FiLink className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-white">URL Shortener</h2>
    </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            className="w-full p-3 bg-surface-2 rounded-lg border border-white/5 text-white"
            required
          />
        </div>

        <div className="relative">
          <input
            type="text"
            value={customAlias}
            onChange={(e) => user?.isVerified && setCustomAlias(e.target.value)}
            placeholder="Custom alias (optional)"
            className={`w-full p-3 bg-surface-2 rounded-lg border border-white/5 text-white 
                       ${!user?.isVerified && 'opacity-50 cursor-not-allowed'}`}
            pattern="[a-zA-Z0-9-]+"
            disabled={!user?.isVerified}
          />
          {!user?.isVerified && (
            <div className="absolute right-3 top-1/2 -translate-y-5 flex items-center gap-2 text-gray-700">
              <FiLock className="w-8 h-5" />
            </div>
          )}
          <p className="text-sm text-gray-400 mt-1">
            {user?.isVerified ? 
              "Create a custom alias for your URL" : 
              "Only verified users can create custom aliases"}
          </p>
        </div>

        {/* Enhanced Expiration Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-white">
              <LuAlarmClock className="text-yellow-500" />
              <span>URL Expiration</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => user?.isVerified && setIsUnlimited(!isUnlimited)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                           ${user?.isVerified 
                             ? isUnlimited
                               ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                               : 'bg-surface-2 text-gray-400 border border-white/5 hover:bg-surface-2/80'
                             : 'bg-surface-2/50 text-gray-600 border border-white/5 cursor-not-allowed'}`}
              >
                {!user?.isVerified && <FiLock className="w-4 h-4" />}
                Never Expire
              </button>
            </div>
          </div>
          
          {!isUnlimited && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Days</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={expiration.days}
                  onChange={(e) => handleExpirationChange('days', e.target.value)}
                  className="w-full p-3 bg-surface-2 rounded-lg border border-white/5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={expiration.hours}
                  onChange={(e) => handleExpirationChange('hours', e.target.value)}
                  className="w-full p-3 bg-surface-2 rounded-lg border border-white/5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={expiration.minutes}
                  onChange={(e) => handleExpirationChange('minutes', e.target.value)}
                  className="w-full p-3 bg-surface-2 rounded-lg border border-white/5 text-white"
                />
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-400">
            {user?.isVerified ? 
                "Verified users can set custom expiration times or make URLs never expire" : 
                "Non-verified users can set expiration times up to 30 days"}
            </p>
        </div>

        <button
            type="submit"
            disabled={loading || !url}
            className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg 
                        transition-colors disabled:opacity-50 border border-transparent 
                        hover:border-yellow-400/50 focus:outline-none focus:ring-2 
                        focus:ring-yellow-500/50"
            >
            {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-400">{error}</div>
      )}

      {shortenedUrl && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4 p-3 bg-surface-2 rounded-lg border border-white/5">
            <input
              type="text"
              value={shortenedUrl}
              readOnly
              className="flex-1 bg-transparent border-none text-white focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-md transition-colors"
            >
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;