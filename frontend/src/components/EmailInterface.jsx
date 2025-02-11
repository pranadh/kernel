import React, { useState, useEffect } from 'react';
import axios from '../api';

const EmailInterface = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/emails/inbox');
      setEmails(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading emails...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inbox</h2>
        <button 
          onClick={fetchEmails}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {emails.map((email) => (
        <div key={email._id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex justify-between">
            <div className="font-medium">{email.sender}</div>
            <div className="text-sm text-gray-500">
              {new Date(email.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="font-bold mt-2">{email.subject}</div>
          <div className="mt-2 text-gray-600">
            {email.strippedText || email.bodyPlain}
          </div>
        </div>
      ))}
      
      {emails.length === 0 && (
        <div className="text-center text-gray-500">No emails found</div>
      )}
    </div>
  );
};

export default EmailInterface;