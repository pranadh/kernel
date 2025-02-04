import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import axios from '../api';

const UrlRedirect = () => {
  const { shortId } = useParams();
  const [error, setError] = useState(null);
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    const redirect = async () => {
      try {
        const { data } = await axios.get(`/api/urls/${shortId}`);
        const urlToRedirect = data.url.startsWith('http') ? 
          data.url : 
          `https://${data.url}`;
        
        setTargetUrl(urlToRedirect);
        
        setTimeout(() => {
          window.location.href = urlToRedirect;
        }, 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to redirect');
        console.error('Redirect failed:', error);
        // Redirect to exlt.tech after 3 seconds on error
        setTimeout(() => {
          window.location.href = 'https://exlt.tech';
        }, 3000);
      }
    };
  
    redirect();
  }, [shortId]);

  // Extract domain from URL for display
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-[#101113] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6 text-center">
        {error ? (
          <>
            <div className="text-red-400 text-xl font-semibold mb-4">{error}</div>
            <div className="flex items-center justify-center gap-2 mb-4">
            <FiExternalLink className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white text-gray-400">
                Redirecting back to <span className="text-red-400">https://exlt.tech</span>...
              </h2>
            </div>
            <div className="w-full bg-surface-2/50 rounded-full h-1 mb-6">
              <div className="bg-red-400 h-1 rounded-full animate-progress"></div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiExternalLink className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">
                Redirecting to <span className="text-primary">https://{targetUrl && getDomain(targetUrl)}</span>...
              </h2>
            </div>
            
            <div className="w-full bg-surface-2/50 rounded-full h-1 mb-6">
              <div className="bg-primary h-1 rounded-full animate-progress"></div>
            </div>

            <p className="text-gray-400 text-sm">
              While you're here, check out{" "}
              <a 
                href="https://exlt.tech" 
                className="text-primary hover:text-primary-hover transition-colors"
              >
                https://exlt.tech.
              </a>
              <br/>
              The only stop you need for notes, urls and screenshots.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default UrlRedirect;