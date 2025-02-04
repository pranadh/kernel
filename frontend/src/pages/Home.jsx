import React, { useState } from "react";
import DocumentList from '../components/DocumentList';
import GlobalDocuments from '../components/GlobalDocuments';
import UrlShortener from '../components/UrlShortener';
import RecentUrls from '../components/RecentUrls';

const Home = () => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleUrlCreated = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      <div className="container mx-auto max-w-[1920px] px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">  
            <DocumentList />
            <GlobalDocuments showUrlSection={false} />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <UrlShortener onUrlCreated={handleUrlCreated} />
            <RecentUrls refreshTrigger={refreshCounter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;