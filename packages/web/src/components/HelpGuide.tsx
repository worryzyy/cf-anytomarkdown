import { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
import guideContent from '../guide.md?raw';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

interface HelpGuideProps {
  onClose: () => void;
}

function HelpGuide({ onClose }: HelpGuideProps) {
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    setRenderedContent(md.render(guideContent));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">使用指南</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <div
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default HelpGuide; 