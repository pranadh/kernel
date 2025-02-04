import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { VscVerifiedFilled } from "react-icons/vsc";
import { FiSearch, FiFile, FiEye } from 'react-icons/fi';
import { debounce } from 'lodash';
import axios from '../api';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, setUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [userStats, setUserStats] = useState({ followers: [], following: [] });
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hideOnPaths = ['/register', '/login'];

  const searchDocuments = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    try {
      setIsSearching(true);
      setSearchError(null);
      setShowResults(true);
      const { data } = await axios.get(`/api/documents/search?q=${query}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search documents');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = debounce(searchDocuments, 300);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user?._id && isDropdownOpen) {
        try {
          const { data } = await axios.get(`/api/users/${user.handle}`);
          setUserStats({
            followers: data.followers || [],
            following: data.following || []
          });
        } catch (err) {
          console.error('Failed to fetch user stats:', err);
        }
      }
    };
  
    fetchUserStats();
  }, [user?._id, isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const renderAvatar = () => {
    // Debug user state
    console.log('User state in Navbar:', {
      hasAvatar: !!user?.avatar,
      avatarURL: user?.avatar,
      avatarError
    });
  
    if (!user?.avatar || avatarError) {
      return (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-300 select-none">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }
  
    return (
      <img 
        src={user.avatar}
        alt={user.username}
        className="w-full h-full object-cover pointer-events-none select-none"
        onError={(e) => {
          console.error('Avatar load error:', e);
          setAvatarError(true);
        }}
      />
    );
  };

  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-[70px] bg-[#1a1b1e] flex items-center justify-between px-8 z-[100] border-b border-zinc-800">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <img src={logo} alt="ToroX Logo" className="h-8" />
      </Link>

      <div className="flex-1 max-w-lg mx-auto px-4 relative" ref={searchRef}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            className="w-full bg-gray-800/50 text-gray-200 pl-10 pr-4 py-2 rounded-md border border-gray-700 
                     focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[101]">
            <div className="bg-surface-2/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg">
              {isSearching ? (
                <div className="px-4 py-8 text-center text-gray-400">
                  Searching...
                </div>
              ) : searchError ? (
                <div className="px-4 py-8 text-center text-red-400">
                  {searchError}
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-700">
                    <span className="text-sm text-gray-400">
                      Found {searchResults.length} document{searchResults.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="max-h-[calc(88px*5)] overflow-y-auto">
                    {searchResults.map((doc) => (
                      <Link
                        key={doc.documentId}
                        to={`/d/${doc.documentId}`}
                        onClick={() => {
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between gap-3 p-3 hover:bg-gray-700/50 border-b border-gray-700 last:border-0"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                                      bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                      flex items-center justify-center flex-shrink-0">
                            <FiFile className="w-6 h-6 text-primary/75" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-gray-200 font-medium truncate flex items-center gap-2">
                              {doc.title || 'Untitled Document'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/5 flex-shrink-0">
                                {doc.author.avatar ? (
                                  <img 
                                    src={doc.author.avatar}
                                    alt={doc.author.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-white">
                                      {doc.author.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-400 text-sm truncate flex items-center gap-1">
                                {doc.author.username}
                                {doc.author.isVerified && (
                                  <VscVerifiedFilled className="w-4 h-4 text-primary" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 pl-3 border-l border-gray-700">
                          <FiEye className="w-4 h-4" />
                          <span className="text-sm whitespace-nowrap">
                            {doc.viewCount || 0} views
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : searchQuery ? (
                <div className="px-4 py-8 text-center text-gray-400">
                  No documents found.
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
              style={{ padding: 0 }}
            >
              {renderAvatar()}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 z-[102]">
                <div className="px-4 py-3 bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div className="-mt-0.5">
                      <p className="text-sm font-medium text-gray-200">{user?.username}</p>
                      <p className="text-xs text-gray-400">@{user?.handle}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="text-center">
                        <div className="font-medium">{userStats.followers.length}</div>
                        <div className="text-gray-500">Followers</div>
                      </div>
                      <div className="h-8 w-px bg-gray-700"></div>
                      <div className="text-center">
                        <div className="font-medium">{userStats.following.length}</div>
                        <div className="text-gray-500">Following</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Rest of dropdown content remains the same */}
                <div className="border-t border-gray-700"></div>
                <div className="py-1">
                  <Link 
                    to={`/u/${user.handle}`} 
                    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUser className="text-sm" />
                    <span>Profile</span>
                  </Link>
                  {user.roles?.includes('admin') && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaUserShield className="text-sm" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="text-gray-300 hover:text-white transition-colors">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;