import React, { useState } from 'react';
import { FiX, FiPaperclip, FiSend } from 'react-icons/fi';
import axios from '../api';

export const ComposeEmail = ({ onClose, onEmailSent }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', content);

      files.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.post('/api/emails/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        onEmailSent?.(response.data.email);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg w-full max-w-2xl m-4">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-medium text-white">New Message</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <input
            type="email"
            placeholder="To: username@exlt.tech"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-surface-2 border border-white/5 rounded px-3 py-2 
                     text-white placeholder:text-text-secondary/50"
            required
          />

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-surface-2 border border-white/5 rounded px-3 py-2 
                     text-white placeholder:text-text-secondary/50"
            required
          />

          <textarea
            placeholder="Write your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 bg-surface-2 border border-white/5 rounded px-3 py-2 
                     text-white placeholder:text-text-secondary/50 resize-none"
            required
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="attachments"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
              <label 
                htmlFor="attachments"
                className="flex items-center gap-2 px-3 py-2 bg-surface-2 
                         text-text-secondary hover:text-white rounded cursor-pointer"
              >
                <FiPaperclip className="w-4 h-4" />
                Attach Files
              </label>
              {files.length > 0 && (
                <span className="text-sm text-text-secondary">
                  {files.length} file(s) selected
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover 
                       text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
};