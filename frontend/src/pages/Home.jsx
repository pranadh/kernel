import React from "react";
import DocumentList from '../components/DocumentList';
import GlobalDocuments from '../components/GlobalDocuments';
import UrlShortener from '../components/UrlShortener';
import RecentUrls from '../components/RecentUrls';

const Home = () => {
  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      {/* Remove px-4 and add max-w-[1920px] for wider content */}
      <div className="container mx-auto max-w-[1920px] px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Increase left column width */}
          <div className="lg:col-span-3 space-y-8">  
            <DocumentList />
            <GlobalDocuments showUrlSection={false} />
          </div>
          
          {/* Keep right column proportional */}
          <div className="lg:col-span-2 space-y-8">
            <UrlShortener />
            <RecentUrls />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;