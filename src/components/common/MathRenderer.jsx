import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Hỗ trợ định dạng in đậm (**từ khóa** hoặc <b>...</b>) và gạch chân (<u>...</u>)
 * cho các câu hỏi ngôn ngữ (Closest, Opposite, Keyword...).
 */
function renderFormattedText(str) {
  if (!str) return '';
  const regex = /(\*\*[\s\S]*?\*\*|<u>[\s\S]*?<\/u>|<b>[\s\S]*?<\/b>)/g;
  const segments = str.split(regex);
  return segments.map((seg, i) => {
    if (!seg) return null;
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      const content = seg.slice(2, -2);
      return (
        <strong
          key={i}
          className="font-extrabold text-[#1A202C] dark:text-white underline decoration-2 decoration-[#FF8800] underline-offset-4 px-0.5"
        >
          {content}
        </strong>
      );
    }
    if (seg.startsWith('<b>') && seg.endsWith('</b>')) {
      return (
        <strong
          key={i}
          className="font-extrabold text-[#1A202C] dark:text-white underline decoration-2 decoration-[#FF8800] underline-offset-4 px-0.5"
        >
          {seg.slice(3, -4)}
        </strong>
      );
    }
    if (seg.startsWith('<u>') && seg.endsWith('</u>')) {
      return (
        <u key={i} className="font-bold underline decoration-2 decoration-[#FF8800] underline-offset-4 px-0.5">
          {seg.slice(3, -4)}
        </u>
      );
    }
    return seg;
  });
}

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

      // Xử lý xuống dòng và format in đậm/gạch chân cho phần văn bản thông thường
      return (
        <span key={index} className="whitespace-pre-wrap">
          {renderFormattedText(part)}
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
