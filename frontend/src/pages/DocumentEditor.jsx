import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';

const DocumentEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { documentId } = useParams();
  const navigate = useNavigate();

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/documents/${documentId}`);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const validateDocument = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateDocument()) {
      return;
    }
  
    try {
      setLoading(true);
      if (documentId) {
        await axios.put(`/api/documents/${documentId}`, { title, content });
        navigate(`/d/${documentId}`);
      } else {
        const response = await axios.post('/api/documents', { title, content });
        const newDocId = response.data.documentId || response.data._id;
        if (newDocId) {
          navigate(`/d/${newDocId}`);
        } else {
          console.error('New document ID is missing from response');
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              className={`w-full p-4 bg-surface-2 rounded-lg border 
                       ${errors.title ? 'border-red-500' : 'border-white/5'}
                       text-white text-xl font-medium focus:outline-none 
                       focus:border-primary/50`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className={`w-full h-[60vh] p-4 bg-surface-2 rounded-lg border 
                       ${errors.content ? 'border-red-500' : 'border-white/5'}
                       text-white resize-none focus:outline-none 
                       focus:border-primary/50`}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !title.trim() || !content.trim()}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white 
                      rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;