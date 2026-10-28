import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { generateId } from '../types/schema.js';

// Cấu hình worker cho pdfjs nếu chạy trong trình duyệt
try {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn('PDF Worker config notice:', e);
}

/**
 * Trích xuất nội dung văn bản từ các tệp tin .txt, .docx, .pdf
 */
export async function extractTextFromFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'txt') {
    return await file.text();
  }

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    return fullText;
  }

  throw new Error(`Định dạng tệp .${extension} chưa được hỗ trợ trực tiếp. Vui lòng dán văn bản trực tiếp.`);
}

/**
 * Phân tích văn bản đề cương thô thành cấu trúc phân cấp: Chương -> Mục -> Ý / Nội dung
 */
export function parseSyllabusText(text, defaultSubjectName = 'Môn học mới') {
  if (!text || typeof text !== 'string') {
    return {
      id: generateId('sub'),
      name: defaultSubjectName,
      chapters: []
    };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Mẫu nhận diện Chương / Phần
  const chapterRegex = /^(chương\s+[0-9ivxlcdm]+|phần\s+[0-9ivxlcdm]+|chủ đề\s+[a-z0-9]+|bài\s+[0-9]+)[:\s\.\-]/i;
  // Mẫu nhận diện Mục / Bài
  const sectionRegex = /^(mục\s+[0-9ivxlcdm\.]+|bài\s+[0-9]+|[0-9ivxlcdm]+\.|\d+\.\d+)[:\s\.\-]/i;
  // Mẫu nhận diện Ý / Tiêu chí
  const pointRegex = /^([a-z]\)|\*|\-|\+|•|\d+\.\d+\.\d+)[\s\.\-]/i;

  const chapters = [];
  let currentChapter = null;
  let currentSection = null;

  function ensureChapter(name = 'Chương 1: Kiến thức cơ bản') {
    if (!currentChapter) {
      currentChapter = {
        id: generateId('chap'),
        name,
        sections: []
      };
      chapters.push(currentChapter);
    }
  }

  function ensureSection(name = 'Mục 1: Nội dung trọng tâm') {
    ensureChapter();
    if (!currentSection) {
      currentSection = {
        id: generateId('sec'),
        name,
        content: '',
        points: []
      };
      currentChapter.sections.push(currentSection);
    }
  }

  for (const line of lines) {
    if (chapterRegex.test(line)) {
      // Bắt đầu một chương mới
      currentChapter = {
        id: generateId('chap'),
        name: line,
        sections: []
      };
      chapters.push(currentChapter);
      currentSection = null;
    } else if (sectionRegex.test(line)) {
      // Bắt đầu một mục mới
      ensureChapter();
      currentSection = {
        id: generateId('sec'),
        name: line,
        content: '',
        points: []
      };
      currentChapter.sections.push(currentSection);
    } else if (pointRegex.test(line)) {
      // Một ý trong mục
      ensureSection();
      const cleanedPoint = line.replace(pointRegex, '').trim();
      if (cleanedPoint) {
        currentSection.points.push(cleanedPoint);
        // Đồng thời thêm vào content tổng
        currentSection.content += (currentSection.content ? '\n' : '') + cleanedPoint;
      }
    } else {
      // Dòng mô tả hoặc nội dung nối tiếp
      ensureSection();
      currentSection.content += (currentSection.content ? '\n' : '') + line;
      // Nếu câu có độ dài vừa đủ, cũng có thể coi là một ý kiến thức
      if (line.length > 15 && line.length < 300) {
        currentSection.points.push(line);
      }
    }
  }

  return {
    id: generateId('sub'),
    name: defaultSubjectName,
    chapters
  };
}
