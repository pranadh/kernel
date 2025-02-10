import React, { useState } from 'react';
import { TbTextResize } from 'react-icons/tb';

const WordCounter = () => {
  const [text, setText] = useState('');

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, '').length;

  return (
    <div className="min-h-screen bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <TbTextResize className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Word Counter</h1>
          </div>

          <div className="bg-surface-1 rounded-lg p-6 border border-white/5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full h-64 bg-surface-2/50 text-text-primary p-4 rounded-md 
                       border border-white/5 placeholder:text-text-secondary/50
                       focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            />

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-surface-2/50 p-4 rounded-md border border-white/5">
                <div className="text-sm text-text-secondary">Words</div>
                <div className="text-2xl font-bold text-white">{wordCount}</div>
              </div>
              <div className="bg-surface-2/50 p-4 rounded-md border border-white/5">
                <div className="text-sm text-text-secondary">Characters</div>
                <div className="text-2xl font-bold text-white">{charCount}</div>
              </div>
              <div className="bg-surface-2/50 p-4 rounded-md border border-white/5">
                <div className="text-sm text-text-secondary">Characters (no spaces)</div>
                <div className="text-2xl font-bold text-white">{charNoSpaces}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCounter;