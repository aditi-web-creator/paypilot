import React from 'react';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content into blocks (paragraphs, headers, lists)
  const lines = content.split('\n');

  const renderFormattedInline = (text: string) => {
    // Replace **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Heading 3: ### Heading
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="text-sm font-bold text-slate-900 pt-1.5 pb-0.5">
              {renderFormattedInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }

        // Bullet points: • or - or *
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const cleanText = trimmed.replace(/^[•\-\*]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 text-slate-800">
              <span className="text-emerald-700 font-bold leading-tight select-none">•</span>
              <div className="flex-1">{renderFormattedInline(cleanText)}</div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={lineIdx} className="text-slate-800 break-words">
            {renderFormattedInline(line)}
          </p>
        );
      })}
    </div>
  );
};
