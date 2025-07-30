import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const getLanguageDisplayName = (lang: string) => {
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'React JSX',
      'ts': 'TypeScript',
      'tsx': 'React TSX',
      'py': 'Python',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'sh': 'Shell',
      'bash': 'Bash',
      'sql': 'SQL',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'md': 'Markdown',
      'text': 'Text'
    };
    return languageMap[lang.toLowerCase()] || lang.toUpperCase();
  };
  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-t-lg border border-gray-700">
        <span className="text-gray-300 text-sm font-medium">
          {getLanguageDisplayName(language)}
        </span>
        <button
          onClick={copyToClipboard}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
            copied 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="text-xs font-medium">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto border-l border-r border-b border-gray-700 max-h-96">
        <code className="text-sm font-mono leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;