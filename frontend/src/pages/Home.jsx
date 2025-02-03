import React from "react";
import DocumentList from '../components/DocumentList';
import GlobalDocuments from '../components/GlobalDocuments';

const Home = () => {
  return (
    <div className="min-h-screen pt-[70px] bg-[#101113]">
      <div className="container mx-auto px-4">
        <DocumentList />
        <GlobalDocuments />
      </div>
    </div>
  );
};

export default Home;