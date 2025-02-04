import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api';

const UrlRedirect = () => {
  const { shortId } = useParams();

  useEffect(() => {
    const redirect = async () => {
      try {
        const response = await axios.get(`/api/urls/${shortId}`);
        window.location.href = response.data;
      } catch (error) {
        console.error('Redirect failed:', error);
      }
    };

    redirect();
  }, [shortId]);

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113] flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  );
};

export default UrlRedirect;