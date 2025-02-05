import React, { useState } from 'react';
import axios from '../api';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const { data } = await axios.post('/api/images', formData);
      setUploadedUrl(data.url);
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-surface-1 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />
        {error && <p className="text-red-500">{error}</p>}
        {uploadedUrl && (
          <div className="bg-surface-2 p-2 rounded">
            <p className="text-sm">Uploaded URL:</p>
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer"
               className="text-primary hover:text-primary-hover break-all">
              {uploadedUrl}
            </a>
          </div>
        )}
        <button
          type="submit"
          disabled={!file || uploading}
          className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50
                   text-white rounded transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default ImageUploader;