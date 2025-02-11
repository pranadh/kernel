import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api';

const EmailInterface = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.hasEmail) {
      fetchEmails();
    }
  }, [user]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/emails/inbox');
      setEmails(data.items || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.hasEmail) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-text-secondary">Email access not enabled</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-surface-1 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Email Inbox</h2>
          <button 
            onClick={fetchEmails}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Refresh
          </button>
        </div>
        
        {loading && <div className="text-center py-4">Loading emails...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}
        
        <div className="space-y-4">
            {emails.length > 0 ? (
                emails.map((email) => (
                <div key={email.id} className="p-4 bg-surface-2 rounded-lg border border-white/5">
                    <div className="flex justify-between mb-2">
                    <div className="font-medium">From: {email.message?.headers?.from}</div>
                    <div className="text-sm text-text-secondary">
                        {new Date(email.timestamp * 1000).toLocaleString()}
                    </div>
                    </div>
                    <div className="font-medium mb-2">
                    Subject: {email.message?.headers?.subject || 'No Subject'}
                    </div>
                    <div className="text-text-secondary whitespace-pre-wrap">
                    {email.message?.headers['body-plain'] || 'No content'}
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center text-text-secondary py-4">No emails found</div>
            )}
            </div>
      </div>
    </div>
  );
};

export default EmailInterface;