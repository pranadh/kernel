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
      setEmails(data.items);
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
      fetchEmails();
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  if (!user?.hasEmail) {
    return <div>No email access</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSend} className="space-y-4">
        <input
          type="email"
          value={form.to}
          onChange={(e) => setForm({...form, to: e.target.value})}
          placeholder="To"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text" 
          value={form.subject}
          onChange={(e) => setForm({...form, subject: e.target.value})}
          placeholder="Subject"
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          value={form.text}
          onChange={(e) => setForm({...form, text: e.target.value})}
          placeholder="Message"
          required
          className="w-full p-2 border rounded h-32"
        />
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
          Send Email
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Inbox</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          emails.map(email => (
            <div key={email.id} className="p-4 border rounded">
              <div>From: {email.message.headers.from}</div>
              <div>Subject: {email.message.headers.subject}</div>
              <div>{email.message.headers['body-plain']}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailInterface;