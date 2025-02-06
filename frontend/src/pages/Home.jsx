import React, { useState } from "react";
import DocumentList from '../components/DocumentList';
import GlobalDocuments from '../components/GlobalDocuments';
import UrlShortener from '../components/UrlShortener';
import RecentUrls from '../components/RecentUrls';
import ShareXConfig from '../components/ShareXConfig';
import RecentImages from '../components/RecentImages';
import IosSetup from '../components/IosSetup';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { user } = useAuth();

  const handleUrlCreated = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      <div className="container mx-auto max-w-[2160px] px-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
          <div className="space-y-8">
            {user && (
              <>
                <ShareXConfig />
                <IosSetup />
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