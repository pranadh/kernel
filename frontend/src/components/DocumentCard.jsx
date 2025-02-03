import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiEye, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const DocumentCard = ({ document }) => {
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/d/${document.documentId}`);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  return (
    <div className="bg-surface-2 rounded-lg p-4 border border-white/5 hover:border-violet-500/20
                    transition-all duration-300 w-full">
      <div className="flex justify-between items-start mb-2 w-full">
        <Link to={`/d/${document.documentId}`} className="flex-1 min-w-0 max-w-full"> 
          <h3 
            title={document.title}
            className="text-lg font-medium text-white hover:text-violet-400 truncate block"
          >
            {document.title || 'Untitled Document'}
          </h3>
        </Link>
        <button
          onClick={copyShareLink}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full flex-shrink-0 ml-2"
        >
          <FiShare2 className="w-4 h-4" />
        </button>
      </div>
  
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 break-words">
        {document.content || 'No content'}
      </p>
  
      <div className="flex items-center justify-between text-sm text-gray-400 w-full">
        <span className="truncate flex-1 min-w-0">
          {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <div className="flex items-center gap-1">
            <FiEye className="w-4 h-4" />
            <span>{document.viewCount || 0}</span>
          </div>
          <Link 
            to={`/d/${document.documentId}/edit`}
            className="p-1 hover:text-white hover:bg-white/5 rounded-full"
          >
            <FiEdit2 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;