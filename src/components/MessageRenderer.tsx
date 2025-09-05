import React from 'react';
import CodeBlock from './CodeBlock';
import { ExternalLink, Youtube } from 'lucide-react';

interface MessageRendererProps {
  content: string;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  // Process the content to handle code blocks and markdown
  const processContent = (text: string) => {
    // First, extract and preserve code blocks
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'text'
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts;
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>') // Inline code
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        const icon = isYouTube ? 
          '<svg class="inline w-4 h-4 ml-1 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' :
          '<svg class="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>';
        
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline inline-flex items-center">${text}${icon}</a>`;
      }) // Links with icons
      .replace(/\n/g, '<br>'); // Line breaks
  };

  const contentParts = processContent(content);
  
  return (
    <div className="space-y-3">
      {contentParts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              code={part.content}
              language={part.language || 'text'}
            />
          );
        } else {
          // Regular text content with markdown formatting
          return (
            <div 
              key={index} 
              className="whitespace-pre-wrap prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatText(part.content) }}
            />
          );
        }
      })}
    </div>
  );
};

export default MessageRenderer;