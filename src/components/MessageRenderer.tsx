import React from 'react';
import CodeBlock from './CodeBlock';
import { ExternalLink, Youtube, Copy, Download, Check } from 'lucide-react';

interface MessageRendererProps {
  content: string;
  messageId?: string;
  showActions?: boolean;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, messageId, showActions = false }) => {
  const [copied, setCopied] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

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
      .replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>') // Italic (not part of **)
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>') // Inline code
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        const icon = isYouTube ? 
          '<svg class="inline w-4 h-4 ml-1 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' :
          '<svg class="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>';
        
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline inline-flex items-center">${text}${icon}</a>`;
      }) // Links with icons
      // Convert asterisk bullet points to proper HTML lists
      .replace(/^\s*\*\s+(.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
      // Wrap consecutive list items in ul tags
      .replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, '<ul class="list-disc list-inside space-y-1 my-3">$&</ul>')
      // Convert numbered lists
      .replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li class="ml-4 mb-2">$2</li>')
      .replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
        // Check if this is a numbered list (contains digits at start)
        if (match.includes('1.') || match.includes('2.') || match.includes('3.')) {
          return `<ol class="list-decimal list-inside space-y-1 my-3">${match}</ol>`;
        }
        return `<ul class="list-disc list-inside space-y-1 my-3">${match}</ul>`;
      })
      .replace(/\n\n/g, '</p><p class="mb-4">') // Paragraph breaks
      .replace(/\n/g, '<br>'); // Line breaks
  };

  const copyToClipboard = async () => {
    try {
      // Clean the content for copying (remove HTML tags)
      const cleanContent = content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      // Dynamic import of jsPDF
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Clean content for PDF
      const cleanContent = content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('EduGem AI Response', margin, margin);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 10);
      
      // Add content
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const lines = doc.splitTextToSize(cleanContent, maxWidth);
      let yPosition = margin + 25;
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });
      
      // Save the PDF
      doc.save(`edugem-response-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
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
          const formattedContent = formatText(part.content);
          return (
            <div 
              key={index} 
              className="whitespace-pre-wrap prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${formattedContent}</p>` }}
            />
          );
        }
      })}
      
      {/* Action buttons - always show for AI messages */}
      <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={copyToClipboard}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            copied 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
          title="Copy response"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
        
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as PDF"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageRenderer;