import React, { useState } from "react";
import DocumentList from '../components/DocumentList';
import GlobalDocuments from '../components/GlobalDocuments';
import UrlShortener from '../components/UrlShortener';
import RecentUrls from '../components/RecentUrls';
import ShareXConfig from '../components/ShareXConfig';
import RecentImages from '../components/RecentImages';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { user } = useAuth();

  const handleUrlCreated = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]"> {/* Increased top padding */}
      <div className="container mx-auto max-w-[2160px] px-1"> {/* Increased max width, reduced horizontal padding */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12"> {/* Increased gap between columns */}
          {/* Left Column - Documents */}
          <div className="space-y-8">
            <DocumentList />
            <GlobalDocuments showUrlSection={false} />
          </div>

          {/* Middle Column - URLs */}
          <div className="space-y-8">
            <UrlShortener onUrlCreated={handleUrlCreated} />
            <RecentUrls refreshTrigger={refreshCounter} />
          </div>

          {/* Right Column - Images */}
          <div className="space-y-8"> {/* Added top margin */}
            {user && (
              <>
                <ShareXConfig />
                <RecentImages />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;