import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api';

const EmailInterface = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    to: '',
    subject: '',
    text: ''
  });

  useEffect(() => {
    if (user?.hasEmail) {
      fetchEmails();
    }
  }, [user]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/emails/inbox');
      setEmails(data.items || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/emails/send', form);
      setForm({ to: '', subject: '', text: '' });
      fetchEmails(); // Refresh inbox after sending
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  if (!user?.hasEmail) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-text-secondary">No email access!</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-surface-1 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Email Interface</h2>
        <div className="text-sm text-text-secondary mb-4">
          Your email: {user.email}
        </div>

        {/* Add email composition form */}
        <form onSubmit={handleSend} className="space-y-4 mb-8">
          <input
            type="email"
            value={form.to}
            onChange={(e) => setForm({...form, to: e.target.value})}
            placeholder="To"
            required
            className="w-full p-2 bg-surface-2 border border-white/5 rounded"
          />
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({...form, subject: e.target.value})}
            placeholder="Subject"
            required
            className="w-full p-2 bg-surface-2 border border-white/5 rounded"
          />
          <textarea
            value={form.text}
            onChange={(e) => setForm({...form, text: e.target.value})}
            placeholder="Message"
            required
            className="w-full p-2 bg-surface-2 border border-white/5 rounded h-32"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Send Email
          </button>
        </form>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Inbox</h3>
          {loading ? (
            <div>Loading emails...</div>
          ) : emails.length > 0 ? (
            emails.map(email => (
              <div key={email.id} className="p-4 bg-surface-2 rounded-lg">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">From: {email.message.headers.from}</div>
                  <div className="text-sm text-text-secondary">
                    {new Date(email.timestamp * 1000).toLocaleString()}
                  </div>
                </div>
                <div className="font-medium mb-2">Subject: {email.message.headers.subject}</div>
                <div className="text-text-secondary whitespace-pre-wrap">
                  {email.message.headers['body-plain']}
                </div>
              </div>
            ))
          ) : (
            <div className="text-text-secondary">No emails found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailInterface;