import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaUserShield, FaCog, FaSearch } from 'react-icons/fa';
import { VscVerifiedFilled } from "react-icons/vsc";
import { FiFile, FiEye } from 'react-icons/fi';
import { FaRegUserCircle } from "react-icons/fa";
import { debounce } from 'lodash';
import UsernameDisplay from "./UsernameDisplay";
import SparkleEffect from './SparkleEffect';
import axios from '../api';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, setUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [userStats, setUserStats] = useState({ followers: [], following: [] });
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownWidth, setDropdownWidth] = useState(288);
  const [logoHovered, setLogoHovered] = useState(false);
  const statsRef = useRef(null);

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

  useEffect(() => {
    if (!isDropdownOpen || !statsRef.current) return;
  
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentWidth = entry.target.scrollWidth;
        const containerWidth = entry.target.clientWidth;
        
        if (contentWidth > containerWidth) {
          // Content is overflowing, increase dropdown width
          setDropdownWidth(Math.min(contentWidth + 64, 384)); // max 96 * 4
        }
      }
    });
  
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [isDropdownOpen]);

  if (hideOnPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-[70px] bg-surface-1 backdrop-blur-sm 
                    flex items-center justify-between px-8 z-[100] border-b border-white/5">
      <Link 
        to="/" 
        className="hover:scale-110 transition-transform duration-100 relative"
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
      >
        <SparkleEffect enabled={logoHovered}>
          <img src={logo} alt="Exalt" className="h-8" />
        </SparkleEffect>
      </Link>

      <div className="flex-1 max-w-lg mx-auto px-4 relative" ref={searchRef}>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            className="w-full bg-surface-2/50 text-text-primary pl-10 pr-4 py-2 rounded-md 
                     border border-white/5 placeholder:text-text-secondary/50
                     focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50
                     transition-all duration-300"
          />
        </div>

        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[101]">
            <div className="bg-surface-2/95 backdrop-blur-sm rounded-lg border border-white/5 shadow-lg">
              {isSearching ? (
                <div className="px-4 py-8 text-center text-text-secondary">
                  Searching...
                </div>
              ) : searchError ? (
                <div className="px-4 py-8 text-center text-status-error">
                  {searchError}
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-2 border-b border-white/5">
                    <span className="text-sm text-text-secondary">
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
                        className="flex items-center justify-between gap-3 p-3 hover:bg-white/5 
                                 border-b border-white/5 last:border-0 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 
                                      bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                      flex items-center justify-center flex-shrink-0">
                            <FiFile className="w-6 h-6 text-primary/75" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-text-primary font-medium truncate flex items-center gap-2">
                              {doc.title || 'Untitled Document'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/5 flex-shrink-0">
                                {doc.author.avatar ? (
                                  <img 
                                    src={doc.author.avatar.startsWith('http') 
                                      ? doc.author.avatar 
                                      : `https://i.exlt.tech/avatar/${doc.author.avatar}`}
                                    alt={doc.author.username}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                               flex items-center justify-center">
                                    <span className="text-xs font-semibold text-text-primary">
                                      {doc.author.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-text-secondary text-sm truncate flex items-center gap-1">
                                {doc.author.username}
                                {doc.author.isVerified && (
                                  <VscVerifiedFilled className="w-4 h-4 text-primary" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary pl-3 border-l border-white/5">
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
                <div className="px-4 py-8 text-center text-text-secondary">
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
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface-2 
                       hover:bg-surface-2/80 border border-transparent hover:border-primary
                       transition-all duration-200 p-0"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-hover/10 
                             flex items-center justify-center">
                  <span className="text-lg font-semibold text-text-primary">
                    {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
            </button>
            {isDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-[${dropdownWidth}px] bg-[#101113]/95 backdrop-blur-sm rounded-sm 
              shadow-lg overflow-hidden border border-white/5 z-[102]`}>
                <div className="px-4 py-3 bg-[#16171a]">
                  <div className="flex items-start gap-2 mt-1">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/5 -ml-2">
                      {user.avatar ? (
                        <img 
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                    flex items-center justify-center">
                          <span className="text-lg font-semibold text-text-primary">
                            {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between flex-1">
                    <div>
                      <p className="text-sm font-medium text-text-primary flex items-center gap-1">
                      <UsernameDisplay 
                        user={user}
                        className="text-sm font-medium text-text-primary"
                      />
                        {user?.isVerified && (
                          <VscVerifiedFilled className="w-4 h-4 text-primary" />
                        )}
                      </p>
                      <p className="text-xs text-text-secondary">@{user?.handle}</p>
                    </div>

                      <div ref={statsRef} className="flex items-center gap-2 -mt-1 ml-9">
                        <FaRegUserCircle className="w-4 h-4 text-text-secondary" />
                        <div className="flex flex-col items-end text-xs text-text-secondary">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{userStats.followers.length}</span>
                            <span className="text-text-muted">Followers</span>
                          </div>
                          <div className="w-full h-px bg-white/10 my-1.5"></div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{userStats.following.length}</span>
                            <span className="text-text-muted">Following</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-white/5"></div>
                <div className="">
                  <Link 
                    to={`/u/${user.handle}`} 
                    className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUser className="text-sm" />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaCog className="text-sm" />
                    <span>Settings</span>
                  </Link>
                  {user.roles?.includes('admin') && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:bg-white/5 hover:text-red-400 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaUserShield className="text-sm" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  
                  <div className="border-t border-white/5"></div>
                  
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-2 px-4 py-3 text-status-error
                             hover:bg-status-error/10 hover:border-red-600 bg-[#101113]/95 transition-colors"
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-text-secondary hover:text-text-primary transition-colors">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;