/**
 * Cấu trúc dữ liệu và các hằng số phân loại
 */

export const DIFFICULTY_LEVELS = [
  { id: 'nhan_biet', label: 'Nhận biết', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  { id: 'thong_hieu', label: 'Thông hiểu', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800' },
  { id: 'van_dung', label: 'Vận dụng', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  { id: 'van_dung_cao', label: 'Vận dụng cao', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800' }
];

export const QUESTION_TYPES = [
  { id: 'mcq', label: 'Trắc nghiệm 1 lựa chọn (A, B, C, D)', shortLabel: 'Trắc nghiệm' },
  { id: 'truefalse', label: 'Đúng / Sai 4 ý (a, b, c, d)', shortLabel: 'Đúng / Sai' },
  { id: 'short_answer', label: 'Trả lời ngắn / Điền số', shortLabel: 'Trả lời ngắn' }
];

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function createEmptySubject(name = 'Môn học mới') {
  return {
    id: generateId('sub'),
    name,
    chapters: []
  };
}

export function createEmptyChapter(name = 'Chương mới') {
  return {
    id: generateId('chap'),
    name,
    sections: []
  };
}

export function createEmptySection(name = 'Mục mới', content = '') {
  return {
    id: generateId('sec'),
    name,
    content,
    points: []
  };
}

export function createDefaultMCQ(overrides = {}) {
  return {
    id: generateId('q'),
    type: 'mcq',
    subjectId: '',
    chapterId: '',
    sectionId: '',
    stem: '',
    options: ['', '', '', ''],
    correct: 0, // index 0 = A, 1 = B, 2 = C, 3 = D
    explanation: '',
    difficulty: 'nhan_biet',
    tags: [],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

export function createDefaultTrueFalse(overrides = {}) {
  return {
    id: generateId('q'),
    type: 'truefalse',
    subjectId: '',
    chapterId: '',
    sectionId: '',
    stem: '',
    statements: [
      { id: 'a', label: 'a', text: '', answer: true },
      { id: 'b', label: 'b', text: '', answer: false },
      { id: 'c', label: 'c', text: '', answer: true },
      { id: 'd', label: 'd', text: '', answer: false }
    ],
    explanation: '',
    difficulty: 'thong_hieu',
    tags: [],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}
