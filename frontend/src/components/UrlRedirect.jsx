import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api';

const UrlRedirect = () => {
  const { shortId } = useParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirect = async () => {
      try {
        const { data } = await axios.get(`/api/urls/${shortId}`);
        const urlToRedirect = data.url.startsWith('http') ? 
          data.url : 
          `https://${data.url}`;
        window.location.href = urlToRedirect;
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to redirect');
        console.error('Redirect failed:', error);
      }
    };
  
    redirect();
  }, [shortId]);

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113] flex items-center justify-center">
      <div className="text-white">
        {error ? error : 'Redirecting...'}
      </div>
    </div>
  );
};

export default UrlRedirect;