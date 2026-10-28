import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Component hiển thị văn bản kèm công thức toán học KaTeX.
 * Hỗ trợ cú pháp $formula$ cho inline và $$formula$$ cho display mode.
 * Nếu không có ký hiệu $, nhưng có các lệnh LaTeX phổ biến (\frac, \sqrt, \alpha...),
 * component vẫn hỗ trợ nhận diện và render chính xác.
 */
export default function MathRenderer({ text = '', className = '', inline = false }) {
  const renderedContent = useMemo(() => {
    if (!text || typeof text !== 'string') return '';

    // Regex tìm $...$ hoặc $$...$$
    // Lưu ý: tránh trùng lặp ký hiệu tiền tệ nếu không phải toán
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g;
    
    // Tách chuỗi theo các khối công thức
    const parts = text.split(mathRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false
          });
          return (
            <span
              key={index}
              className="my-2 block overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <span key={index} className="text-rose-500 font-mono text-sm">{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false
          });
          return (
            <span
              key={index}
              className="inline-block px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <span key={index} className="text-rose-500 font-mono text-sm">{part}</span>;
        }
      }

      // Xử lý xuống dòng cho phần văn bản thông thường
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }, [text]);

  return (
    <span className={`inline-math-container ${className}`}>
      {renderedContent}
    </span>
  );
}
