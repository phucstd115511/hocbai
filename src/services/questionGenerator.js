import { generateId, createDefaultMCQ, createDefaultTrueFalse } from '../types/schema.js';

/**
 * Xáo trộn mảng ngẫu nhiên (Fisher-Yates)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Tạo câu hỏi Trắc nghiệm 1 lựa chọn (MCQ) bằng Rule-based Heuristic
 */
export function generateLocalMCQ({ subjectId, chapterId, sectionId, chapterName, sectionName, pointText, difficulty = 'nhan_biet' }) {
  const topic = pointText.replace(/^[\d\.\-\*\s]+/, '').trim();
  const shortTopic = topic.length > 50 ? topic.substring(0, 47) + '...' : topic;

  // Trích xuất các cụm từ chính
  const words = topic.split(' ');
  const mainSubject = words.slice(0, Math.min(6, words.length)).join(' ');

  let stem = '';
  let correctOpt = '';
  let distractors = [];
  let explanation = '';

  // Xây dựng câu hỏi tùy theo mức độ
  if (difficulty === 'nhan_biet') {
    stem = `Khẳng định nào sau đây là chính xác nhất khi đề cập đến "${mainSubject}"?`;
    correctOpt = `${topic}.`;
    distractors = [
      `${mainSubject} chỉ được áp dụng trong môi trường thử nghiệm và không có giá trị thực tiễn.`,
      `${mainSubject} là quy tắc mang tính tuyệt đối và không phụ thuộc vào bất kỳ điều kiện nào.`,
      `${mainSubject} hoàn toàn đối lập và thay thế toàn bộ các nguyên lý kinh điển trước đó.`
    ];
    explanation = `Theo tài liệu đề cương: ${topic}.`;
  } else if (difficulty === 'thong_hieu') {
    stem = `Đặc điểm hoặc bản chất cốt lõi của nội dung: "${shortTopic}" là gì?`;
    correctOpt = `Thể hiện rõ: ${topic}.`;
    distractors = [
      `Chỉ mang tính chất hình thức, không ảnh hưởng đến quy trình xử lý dữ liệu.`,
      `Đòi hỏi loại bỏ hoàn toàn các cấu trúc truyền thống để vận hành độc lập.`,
      `Chỉ áp dụng được khi có sự can thiệp thủ công liên tục từ người quản trị.`
    ];
    explanation = `Nội dung cốt lõi của phần này nhằm làm rõ: ${topic}.`;
  } else {
    // Vận dụng / Vận dụng cao
    stem = `Trong thực tế giải quyết bài toán liên quan đến "${sectionName || 'chủ đề này'}", việc hiểu đúng "${mainSubject}" có ý nghĩa gì?`;
    correctOpt = `Đảm bảo tuân thủ nguyên lý: ${topic}.`;
    distractors = [
      `Tối giản hóa quy trình nhưng chấp nhận bỏ qua tính toàn vẹn và bảo mật.`,
      `Tự động hóa hoàn toàn mà không cần kiểm soát tính chính xác của kết quả.`,
      `Chỉ sử dụng khi các giải pháp tối ưu khác bị giới hạn về mặt phần cứng.`
    ];
    explanation = `Vận dụng đúng định hướng: ${topic} giúp đảm bảo tính chuẩn xác và tối ưu.`;
  }

  // Cân bằng độ dài và trộn vị trí đáp án đúng
  const rawOptions = [
    { text: correctOpt, isCorrect: true },
    { text: distractors[0], isCorrect: false },
    { text: distractors[1], isCorrect: false },
    { text: distractors[2], isCorrect: false }
  ];

  const shuffled = shuffleArray(rawOptions);
  const options = shuffled.map(o => o.text);
  const correctIndex = shuffled.findIndex(o => o.isCorrect);

  return createDefaultMCQ({
    subjectId,
    chapterId,
    sectionId,
    stem,
    options,
    correct: correctIndex,
    explanation,
    difficulty,
    tags: [sectionName ? sectionName.slice(0, 15) : 'đề cương', difficulty]
  });
}

/**
 * Tạo câu hỏi Đúng/Sai 4 ý bằng Rule-based Heuristic
 */
export function generateLocalTrueFalse({ subjectId, chapterId, sectionId, chapterName, sectionName, pointText, extraPoints = [], difficulty = 'thong_hieu' }) {
  const topic = pointText.replace(/^[\d\.\-\*\s]+/, '').trim();
  const shortTopic = topic.length > 60 ? topic.substring(0, 57) + '...' : topic;

  const stem = `Khi nghiên cứu về "${sectionName || shortTopic}", xét tính Đúng / Sai của các nhận định sau:`;

  // Tạo 2 ý Đúng và 2 ý Sai một cách hợp lý
  const stmt1 = {
    id: 'a',
    label: 'a',
    text: `${topic}.`,
    answer: true
  };

  const otherPoint = extraPoints.length > 0 ? extraPoints[0].replace(/^[\d\.\-\*\s]+/, '').trim() : 'nội dung kiến thức này';
  const stmt2 = {
    id: 'b',
    label: 'b',
    text: `Nội dung trên có mối liên hệ mật thiết với việc hiểu rõ: ${otherPoint}.`,
    answer: true
  };

  const words = topic.split(' ');
  const kw = words.slice(0, 4).join(' ');
  const stmt3 = {
    id: 'c',
    label: 'c',
    text: `${kw} luôn luôn đúng trong mọi trường hợp và không chịu bất kỳ giới hạn kỹ thuật nào.`,
    answer: false
  };

  const stmt4 = {
    id: 'd',
    label: 'd',
    text: `Việc áp dụng nguyên lý này sẽ làm vô hiệu hóa hoàn toàn mọi yêu cầu về an toàn và bảo mật dữ liệu.`,
    answer: false
  };

  const statements = [stmt1, stmt2, stmt3, stmt4];

  return createDefaultTrueFalse({
    subjectId,
    chapterId,
    sectionId,
    stem,
    statements,
    explanation: `Ý (a) và (b) đúng theo đề cương kiến thức. Ý (c) sai do tính tuyệt đối hóa vô lý ('luôn luôn đúng trong mọi trường hợp'). Ý (d) sai vì bất kỳ giải pháp nào cũng phải tuân thủ yêu cầu an toàn.`,
    difficulty,
    tags: [sectionName ? sectionName.slice(0, 15) : 'đề cương', 'đúng sai']
  });
}

/**
 * Tạo câu hỏi nâng cao bằng Google Gemini API (nếu có API Key)
 */
export async function generateQuestionWithGemini({ apiKey, type = 'mcq', subjectName, chapterName, sectionName, content, difficulty = 'nhan_biet' }) {
  if (!apiKey) {
    throw new Error('Chưa cung cấp Google Gemini API Key.');
  }

  const prompt = `Bạn là chuyên gia sư phạm ra đề thi trắc nghiệm theo chuẩn chương trình GDPT.
Nhiệm vụ: Dựa vào nội dung bài học sau đây, hãy biên soạn 1 câu hỏi ${type === 'mcq' ? 'TRẮC NGHIỆM 4 LỰA CHỌN (1 ĐÁP ÁN ĐÚNG)' : 'ĐÚNG/SAI 4 Ý (a, b, c, d)'} mức độ "${difficulty}".

Môn: ${subjectName || ''}
Chương: ${chapterName || ''}
Mục: ${sectionName || ''}
Nội dung kiến thức:
"""
${content}
"""

YÊU CẦU BẮT BUỘC:
1. Đáp án nhiễu phải hợp lý, khoa học, không để lộ đáp án bằng độ dài hoặc câu từ khác biệt.
2. Có lời giải thích ngắn gọn, súc tích.
3. Hỗ trợ ký hiệu toán học $...$ nếu có công thức.
4. Trả về ĐÚNG ĐỊNH DẠNG JSON sau (không kèm markdown thừa):

${type === 'mcq' ? `{
  "stem": "Nội dung câu hỏi?",
  "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
  "correct": 0,
  "explanation": "Giải thích vì sao A đúng...",
  "tags": ["từ khóa 1", "từ khóa 2"]
}` : `{
  "stem": "Câu dẫn của câu đúng sai...",
  "statements": [
    {"label": "a", "text": "Phát biểu a...", "answer": true},
    {"label": "b", "text": "Phát biểu b...", "answer": false},
    {"label": "c", "text": "Phát biểu c...", "answer": true},
    {"label": "d", "text": "Phát biểu d...", "answer": false}
  ],
  "explanation": "Giải thích chi tiết các ý...",
  "tags": ["từ khóa 1", "từ khóa 2"]
}`}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lỗi Gemini API (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Không nhận được phản hồi từ AI.');
  }

  const parsed = JSON.parse(textOutput);
  if (type === 'mcq') {
    return createDefaultMCQ({
      ...parsed,
      difficulty
    });
  } else {
    return createDefaultTrueFalse({
      ...parsed,
      difficulty
    });
  }
}
