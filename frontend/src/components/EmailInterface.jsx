import React, { useState, useEffect, useCallback } from 'react';
import { FiStar, FiInbox, FiSend, FiMail, FiPaperclip } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa'; 
import { ImAttachment } from "react-icons/im"; 
import { FaStar } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext';
import { ComposeEmail } from './ComposeEmail';
import ErrorRedirect from './ErrorRedirect';
import axios from '../api';

const Sidebar = ({ activeView, setActiveView, onCompose, emails }) => (
  <div className="w-64 bg-surface-1 border-r border-white/5 p-4 overflow-y-auto">
    <button 
      className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 mb-6 transition-colors"
      onClick={onCompose}
    >
      <div className="flex items-center justify-center gap-2">
        <FiMail className="w-5 h-5" />
        New Message
      </div>
    </button>
    
    <nav className="space-y-2">
      {[
        { name: 'Inbox', icon: <FiInbox />, count: emails.inbox },
        { name: 'Sent', icon: <FiSend />, count: emails.sent },
        { name: 'Starred', icon: <FaStar />, count: emails.starred }
      ].map(view => (
        <button
          key={view.name}
          onClick={() => setActiveView(view.name.toLowerCase())}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
            activeView === view.name.toLowerCase()
              ? 'bg-primary/10 text-white font-bold'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {view.icon}
            <span>{view.name}</span>
          </div>
          {view.count > 0 && (
            <div className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium min-w-[20px] text-center">
              {view.count}
            </div>
          )}
        </button>
      ))}
    </nav>
  </div>
);

const formatEmailDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Within 24 hours
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }
  
  // Within a week
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // Past a week
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric'
  });
};

const SearchBar = ({ searchQuery, setSearchQuery, searchType, setSearchType, activeView }) => (
  <div className="p-4 border-b border-white/5">
    <div className="flex gap-2">
      <div className="relative flex-1">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder={`Search by ${searchType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2/50 border border-white/5 rounded-md pl-10 pr-24 py-2 
                     text-text-primary placeholder:text-text-secondary/50
                     focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={() => setSearchType(prev => prev === (activeView === 'sent' ? 'recipient' : 'sender') ? 'subject' : prev === 'subject' ? 'content' : (activeView === 'sent' ? 'recipient' : 'sender'))}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs 
                     bg-surface-2 text-text-secondary rounded-md hover:bg-surface-1 
                     transition-colors z-10"
          >
            {searchType === (activeView === 'sent' ? 'recipient' : 'sender') ? (activeView === 'sent' ? 'Recipient' : 'Sender') : searchType === 'subject' ? 'Subject' : 'Content'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const EmailList = ({ emails, selectedEmail, setSelectedEmail, onStarEmail, activeView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState(activeView === 'sent' ? 'recipient' : 'sender');
  const { user } = useAuth();

  useEffect(() => {
    setSearchType(activeView === 'sent' ? 'recipient' : 'sender');
  }, [activeView]);

  const getDisplayName = (email) => {
    if (activeView === 'sent') {
      return `To: ${email.recipient}`;
    }
    
    if (activeView === 'starred') {
      // If the current user is the sender (it's a sent email)
      if (email.sender === user.email) {
        return `To: ${email.recipient}`;
      }
      // If it's a received email
      return email.senderName || email.sender;
    }
    
    return email.senderName || email.sender;
  };

  const filteredEmails = emails.filter(email => {
    const query = searchQuery.toLowerCase();
    switch (searchType) {
      case 'recipient':
      case 'sender':
        if (activeView === 'sent') {
          return email.recipient.toLowerCase().includes(query);
        }
        return (email.senderName || email.sender).toLowerCase().includes(query);
      case 'subject':
        return email.subject.toLowerCase().includes(query);
      case 'content':
        return (email.bodyPlain || '').toLowerCase().includes(query) || 
               (email.bodyHtml || '').toLowerCase().includes(query);
      default:
        return true;
    }
  });

  return (
    <div className="w-108 border-r border-white/5 flex-shrink-0 h-full flex flex-col">
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchType={searchType}
        setSearchType={setSearchType}
        activeView={activeView}
      />
      <div className="overflow-y-auto flex-1">
        {filteredEmails.map(email => (
          <div
            key={email._id}
            onClick={() => setSelectedEmail(email)}
            className={`p-4 border-b border-white/5 cursor-pointer transition-all
              ${selectedEmail?._id === email._id 
                ? 'bg-primary/10' 
                : 'hover:bg-surface-2'}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">
                  {getDisplayName(email)}
                </div>
                <div className="text-sm text-gray-400 truncate mt-1">
                  {email.subject}
                </div>
              </div>

              <div className="flex items-start gap-2 flex-shrink-0">
                <span className="text-sm text-gray-400 whitespace-nowrap mt-1">
                  {formatEmailDate(email.timestamp)}
                </span>
                <div className="flex flex-col items-center w-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStarEmail(email._id);
                    }}
                    className={`p-1 rounded hover:bg-surface-2 transition-colors ${
                      email.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    {email.starred ? <FaStar className="w-5 h-5" /> : <FiStar className="w-5 h-5" />}
                  </button>
                  {email.attachments?.length > 0 && (
                    <div className="p-1 text-gray-400">
                      <ImAttachment className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const EmailContent = ({ email }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (attachment) => {
    try {
      setDownloading(true);
      const response = await axios.get(
        `/api/emails/${email._id}/attachments/${attachment.filename}`,
        { responseType: 'blob' }
      );
      
      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = attachment.originalName || attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download attachment:', error);
    } finally {
      setDownloading(false);
    }
  };
  
  if (!email) return (
    <div className="flex-1 flex items-center justify-center text-gray-400 overflow-y-auto">
      <div className="text-center">
        <FiMail className="w-12 h-12 mb-4 mx-auto opacity-50" />
        <p>Select an email to read</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-surface-1/30">
      <div className="p-8">
        <div className="max-w mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">{email.subject}</h1>
          <div className="flex items-center justify-between mb-6 bg-surface-2/50 p-4 rounded-lg border border-white/5">
            <div>
              <div className="font-medium text-white">
                {email.senderName ? (
                  <>
                    {email.senderName} ({email.sender})
                  </>
                ) : (
                  email.sender
                )}
              </div>
              <div className="text-sm text-gray-400">To: {email.recipient}</div>
            </div>
            <div className="text-sm text-gray-400">
              {new Date(email.timestamp).toLocaleString()}
            </div>
          </div>
          
          {/* Updated Email content styling */}
          <div 
            className="prose prose-invert max-w-none bg-surface-2/50 p-6 rounded-lg border border-white/5
                    [&_*]:!text-gray-200
                    [&_div]:!text-gray-200
                    [&_span]:!text-gray-200
                    [&_p]:!text-gray-200
                    [&_body]:!text-gray-200
                    [&_.elementToProof]:!text-gray-200
                    [&_div[style]]:!text-gray-200
                    [&_*[style*='color']]:!text-gray-200
                    [&_table]:!bg-surface-2/50
                    [&_td]:!bg-surface-2/50
                    [&_tr]:!bg-surface-2/50
                    [&_th]:!bg-surface-2/50
                    [&_*[style*='background']]:!bg-surface-2/50
                    [&_*[style*='background-color']]:!bg-surface-2/50"
            dangerouslySetInnerHTML={{ 
              __html: email.bodyHtml?.replace(/background-color:\s*#ffffff/g, 'background-color: rgba(23, 23, 35, 0.9)') 
                || email.bodyPlain 
            }}
          />
          {/* Attachments section */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-6 bg-surface-2/50 p-4 rounded-lg border border-white/5">
              <h3 className="text-lg font-medium text-white mb-3">
                Attachments ({email.attachments.length})
              </h3>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <button
                    key={index}
                    onClick={() => handleDownload(attachment)}
                    disabled={downloading}
                    className="w-full flex items-center gap-3 p-3 bg-surface-2 rounded-lg hover:bg-surface-1 transition-colors disabled:opacity-50"
                  >
                    <FiPaperclip className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-gray-400">
                        {attachment.contentType} • {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmailInterface = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [emailCounts, setEmailCounts] = useState({
    inbox: 0,
    sent: 0,
    starred: 0
  });

  if (!user?.hasEmail) {
    return <ErrorRedirect message="No active email found" />;
  }

  const handleEmailSent = (email) => {
    if (activeView === 'sent') {
      setEmails(prev => [email, ...prev]);
    }
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const token = localStorage.getItem('token');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws?token=${token}`);
  
      let reconnectTimeout;
      let isConnected = false;
  
      ws.onopen = () => {
        console.log('WebSocket connected');
        isConnected = true;
      };
  
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'EMAIL_UPDATE') {
          // Update counts when receiving new email
          setEmailCounts(prev => ({
            ...prev,
            inbox: data.email.recipient === user.email ? prev.inbox + 1 : prev.inbox,
            sent: data.email.sender === user.email ? prev.sent + 1 : prev.sent
          }));
      
          // Update email list if in relevant view
          if (activeView === 'inbox' && data.email.recipient === user.email) {
            setEmails(prev => [data.email, ...prev]);
          }
          if (activeView === 'sent' && data.email.sender === user.email) {
            setEmails(prev => [data.email, ...prev]);
          }
        }
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (!isConnected) {
          // Only retry if never connected
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      };
  
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        isConnected = false;
        if (!ws.wasClean) {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      };
  
      return () => {
        clearTimeout(reconnectTimeout);
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    };
  
    const cleanup = connectWebSocket();
    return () => cleanup();
  }, [activeView, user.email]);

  // Remove polling implementation
  useEffect(() => {
    fetchEmails();
  }, [activeView]);

  // Modify fetchEmails to handle background refreshes
  const fetchEmails = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
  
      // Fetch all counts in parallel for efficiency
      const [inboxEmails, sentEmails, starredEmails] = await Promise.all([
        axios.get('/api/emails/inbox'),
        axios.get('/api/emails/sent'),
        axios.get('/api/emails/starred')
      ]);
      
      // Set counts based on the length of each response
      setEmailCounts({
        inbox: inboxEmails.data.length,
        sent: sentEmails.data.length,
        starred: starredEmails.data.length
      });
  
      // Set emails based on active view
      const activeEmails = {
        inbox: inboxEmails.data,
        sent: sentEmails.data,
        starred: starredEmails.data
      }[activeView] || [];
  
      if (isBackgroundRefresh) {
        const existingIds = new Set(emails.map(e => e._id));
        const uniqueNewEmails = activeEmails.filter(email => !existingIds.has(email._id));
        
        if (uniqueNewEmails.length > 0) {
          setEmails(prev => [...uniqueNewEmails, ...prev]);
        }
      } else {
        setEmails(activeEmails);
        setSelectedEmail(null);
      }
      
      setError(null);
    } catch (err) {
      if (!isBackgroundRefresh) {
        setError(err.response?.data?.message || 'Failed to fetch emails');
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const handleStarEmail = async (emailId) => {
    try {
      const email = emails.find(e => e._id === emailId);
      const newStarredState = !email.starred;
      
      // Update UI optimistically
      setEmails(emails.map(e => 
        e._id === emailId 
          ? { ...e, starred: newStarredState }
          : e
      ));
  
      // Update starred count
      setEmailCounts(prev => ({
        ...prev,
        starred: prev.starred + (newStarredState ? 1 : -1)
      }));
  
      const response = await axios.post(`/api/emails/${emailId}/star`, {
        starred: newStarredState
      });
  
      if (!response.data.success) {
        throw new Error('Failed to star email');
      }
  
    } catch (err) {
      console.error('Failed to star email:', err);
      // Revert on error
      setEmails(emails.map(e => 
        e._id === emailId 
          ? { ...e, starred: !newStarredState }
          : e
      ));
      // Revert starred count
      setEmailCounts(prev => ({
        ...prev,
        starred: prev.starred + (newStarredState ? -1 : 1)
      }));
    }
  };

  if (loading) return (
    <div className="h-[calc(100vh-70px)] flex items-center justify-center">
      <div className="text-text-secondary">Loading emails...</div>
    </div>
  );

  if (error) return (
    <div className="h-[calc(100vh-70px)] flex items-center justify-center">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-70px)] flex overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        onCompose={() => setShowCompose(true)}
        emails={emailCounts}
      />
      <EmailList 
        emails={emails} 
        selectedEmail={selectedEmail} 
        setSelectedEmail={setSelectedEmail}
        onStarEmail={handleStarEmail}
        activeView={activeView} // Add this prop
      />
      <EmailContent email={selectedEmail} />
      {showCompose && (
        <ComposeEmail 
          onClose={() => setShowCompose(false)}
          onEmailSent={handleEmailSent}
        />
      )}
    </div>
  );
};

export default EmailInterface;