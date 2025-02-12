import React, { useState, useEffect } from 'react';
import { FiStar, FiInbox, FiSend, FiMail, FiPaperclip } from 'react-icons/fi';
import { ImAttachment } from "react-icons/im"; 
import { FaStar } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext';
import ErrorRedirect from './ErrorRedirect';
import axios from '../api';

const Sidebar = ({ activeView, setActiveView }) => (
  <div className="w-64 bg-surface-1 border-r border-white/5 p-4 overflow-y-auto">
    <button 
      className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 mb-6 transition-colors"
      onClick={() => console.log('New message')}
    >
      <div className="flex items-center justify-center gap-2">
        <FiMail className="w-5 h-5" />
        New Message
      </div>
    </button>
    
    <nav className="space-y-2">
      {[
        { name: 'Inbox', icon: <FiInbox /> },
        { name: 'Sent', icon: <FiSend /> },
        { name: 'Starred', icon: <FaStar /> }
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
          {view.icon}
          {view.name}
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

const EmailList = ({ emails, selectedEmail, setSelectedEmail, onStarEmail }) => (
  <div className="w-80 border-r border-white/5 flex-shrink-0 h-full overflow-y-auto">
    {emails.map(email => (
      <div
        key={email._id}
        onClick={() => setSelectedEmail(email)}
        className={`p-4 border-b border-white/5 cursor-pointer transition-all
          ${selectedEmail?._id === email._id 
            ? 'bg-primary/10' 
            : 'hover:bg-surface-2'}`}
      >
        <div className="flex justify-between items-start gap-4">
          {/* Left section remains the same */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">
              {email.senderName || email.sender}
            </div>
            <div className="text-sm text-gray-400 truncate mt-1">
              {email.subject}
            </div>
          </div>

          {/* Modified right section with conditional star icon */}
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
);

const EmailContent = ({ email }) => {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">{email.subject}</h1>
          <div className="flex items-center justify-between mb-6 bg-surface-2/50 p-4 rounded-lg border border-white/5">
            <div>
              <div className="font-medium text-white">{email.sender}</div>
              <div className="text-sm text-gray-400">To: {email.recipient}</div>
            </div>
            <div className="text-sm text-gray-400">
              {new Date(email.timestamp).toLocaleString()}
            </div>
          </div>
          
          {/* Email content */}
          <div className="prose prose-invert max-w-none bg-surface-2/50 p-6 rounded-lg border border-white/5" 
            dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.bodyPlain }}
          />

          {/* Attachments section */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-6 bg-surface-2/50 p-4 rounded-lg border border-white/5">
              <h3 className="text-lg font-medium text-white mb-3">Attachments</h3>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-surface-2 rounded hover:bg-surface-1 transition-colors"
                  >
                    <FiPaperclip className="w-4 h-4" />
                    <span className="text-sm text-white">{attachment.name}</span>
                    <span className="text-xs text-gray-400">
                      ({Math.round(attachment.size / 1024)}KB)
                    </span>
                  </a>
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

  if (!user?.hasEmail) {
    return <ErrorRedirect message="No active email found" />;
  }

  useEffect(() => {
    fetchEmails();
  }, [activeView]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/emails/${activeView}`);
      setEmails(response.data);
      setSelectedEmail(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch emails');
    } finally {
      setLoading(false);
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
  
      // Update the API endpoint to match the backend route
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
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <EmailList 
        emails={emails} 
        selectedEmail={selectedEmail} 
        setSelectedEmail={setSelectedEmail}
        onStarEmail={handleStarEmail}
      />
      <EmailContent email={selectedEmail} />
    </div>
  );
};

export default EmailInterface;