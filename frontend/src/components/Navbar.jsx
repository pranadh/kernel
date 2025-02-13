import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaUserShield, FaCog, FaSearch } from 'react-icons/fa';
import { VscVerifiedFilled } from "react-icons/vsc";
import { FiFile, FiEye, FiLink, FiImage } from 'react-icons/fi';
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
  const [searchResults, setSearchResults] = useState({
    users: [],
    documents: [],
    urls: [],
    images: []
  });
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

  const searchAll = async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], documents: [], urls: [], images: [] });
      setShowResults(false);
      return;
    }
    
    try {
      setIsSearching(true);
      setSearchError(null);
      setShowResults(true);
      const { data } = await axios.get(`/api/search?q=${query}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search');
      setSearchResults({ users: [], documents: [], urls: [], images: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = debounce(searchAll, 300);

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

  const ResultSection = ({ title, icon: Icon, items, renderItem }) => {
    return (
      <div className="w-full h-full">
        <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
          <Icon className="w-4 h-4 text-text-secondary" />
          <span className="text-sm font-medium text-text-secondary">{title}</span>
          <span className="text-xs text-text-muted ml-auto">{items?.length || 0}</span>
        </div>
        {items?.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto 
                      scrollbar-thin hover:scrollbar-thumb-white/20">
            {items.map(renderItem)}
          </div>
        ) : (
          <div className="py-4 text-center text-text-secondary text-sm">
            No {title.toLowerCase()} found
          </div>
        )}
      </div>
    );
  };

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

      <div className="flex-1 max-w-xl mx-auto px-4 relative translate-x-8" ref={searchRef}>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search Exalt"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            className="w-full bg-surface-2/50 text-text-primary pl-10 pr-4 py-2 rounded-md 
                     border border-white/5 placeholder:text-text-secondary/50
                     focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50
                     transition-all duration-300"
          />
        </div>

        {showResults && searchQuery && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1200px] mt-2 z-[101]">
            <div className="bg-surface-2/95 backdrop-blur-sm rounded-lg border border-white/5 shadow-lg">
              {isSearching ? (
                <div className="px-4 py-8 text-center text-text-secondary">
                  Searching...
                </div>
              ) : searchError ? (
                <div className="px-4 py-8 text-center text-status-error">
                  {searchError}
                </div>
              ) : (searchResults.users.length > 0 || 
                   searchResults.documents.length > 0 || 
                   searchResults.urls.length > 0 || 
                   searchResults.images.length > 0) ? (
                <div className="grid grid-cols-4 divide-x divide-white/5">
                  <ResultSection
                    title="Users"
                    icon={FaUser}
                    items={searchResults.users}
                    renderItem={(user) => (
                      <Link
                        key={user._id}
                        to={`/u/${user.handle}`}
                        onClick={() => { setShowResults(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/5">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                        flex items-center justify-center">
                              <span className="text-sm font-semibold text-text-primary">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-text-primary truncate">
                              {user.username}
                            </span>
                            {user.isVerified && (
                              <VscVerifiedFilled className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-text-secondary block">
                            @{user.handle}
                          </span>
                        </div>
                      </Link>
                    )}
                  />

                  <ResultSection
                    title="Documents"
                    icon={FiFile}
                    items={searchResults.documents}
                    renderItem={(doc) => (
                      <Link
                        key={doc.documentId}
                        to={`/d/${doc.documentId}`}
                        onClick={() => { setShowResults(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5 
                                    bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                    flex items-center justify-center">
                          <FiFile className="w-4 h-4 text-primary/75" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">
                            {doc.title || 'Untitled Document'}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-text-secondary">
                            <span>by {doc.author.username}</span>
                            {doc.author.isVerified && (
                              <VscVerifiedFilled className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          <FiEye className="w-3.5 h-3.5" />
                          <span>{doc.viewCount || 0}</span>
                        </div>
                      </Link>
                    )}
                  />

                  <ResultSection
                    title="URLs"
                    icon={FiLink}
                    items={searchResults.urls}
                    renderItem={(url) => (
                      <Link
                        key={url._id}
                        to={`/info/s/${url.shortId}`}
                        onClick={() => { setShowResults(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5 
                                      bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 
                                      flex items-center justify-center">
                          <FiLink className="w-4 h-4 text-yellow-500/75" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-text-primary">
                              {url.shortId}
                            </span>
                            <span className="text-xs text-text-secondary">
                              by {url.author.username}
                              {url.author.isVerified && (
                                <VscVerifiedFilled className="w-3 h-3 text-primary ml-0.5 -mt-0.5 inline-block" />
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-text-secondary truncate mt-0.5">
                            {url.originalUrl}
                          </div>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {url.clicks || 0} clicks
                        </div>
                      </Link>
                    )}
                  />

                  <ResultSection
                    title="Images"
                    icon={FiImage}
                    items={searchResults.images}
                    renderItem={(image) => (
                      <Link
                        key={image._id}
                        to={`/info/i/${image.imageId}`}
                        onClick={() => { setShowResults(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5">
                          <img 
                            src={`https://i.exlt.tech/${image.imageId}`}
                            alt={image.imageId}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-text-primary">
                              {image.imageId}
                            </span>
                            <span className="text-xs text-text-secondary">
                              by {image.author.username}
                              {image.author.isVerified && (
                                <VscVerifiedFilled className="w-3 h-3 text-primary ml-0.5 -mt-0.5 inline-block" />
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-text-secondary">
                            {(image.size / 1024).toFixed(1)}KB
                          </div>
                        </div>
                      </Link>
                    )}
                  />
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-text-secondary">
                  No results found
                </div>
              )}
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