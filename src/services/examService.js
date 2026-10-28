import { generateId } from '../types/schema.js';

/**
 * Xáo trộn một mảng và trả về mảng mới (Fisher-Yates)
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Xáo trộn đáp án của một câu hỏi MCQ mà không làm thay đổi tính đúng của đáp án
 */
export function shuffleMCQOptions(question) {
  if (question.type !== 'mcq' || !Array.isArray(question.options)) {
    return question;
  }

  const originalOptionsWithFlag = question.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === question.correct
  }));

  const shuffled = shuffle(originalOptionsWithFlag);
  const newOptions = shuffled.map(item => item.text);
  const newCorrectIndex = shuffled.findIndex(item => item.isCorrect);

  return {
    ...question,
    options: newOptions,
    correct: newCorrectIndex
  };
}

/**
 * Chuẩn bị danh sách câu hỏi cho một đề thi (hỗ trợ xáo trộn câu và đáp án)
 */
export function prepareExamQuestions(exam, allQuestionsMap, options = {}) {
  const { shuffleQuestions = false, shuffleAnswers = false } = options;

  let questions = (exam.questionIds || [])
    .map(id => allQuestionsMap[id])
    .filter(Boolean);

  if (shuffleQuestions) {
    questions = shuffle(questions);
  }

  if (shuffleAnswers) {
    questions = questions.map(q => {
      if (q.type === 'mcq') {
        return shuffleMCQOptions(q);
      }
      return q;
    });
  }

  return questions;
}

/**
 * Chọn ngẫu nhiên câu hỏi theo ma trận đề
 */
export function sampleRandomQuestions(allQuestions, criteria = {}) {
  const {
    mcqCount = 0,
    trueFalseCount = 0,
    subjectId = '',
    chapterIds = [],
    difficulty = ''
  } = criteria;

  let pool = allQuestions;

  if (subjectId) {
    pool = pool.filter(q => q.subjectId === subjectId);
  }
  if (chapterIds.length > 0) {
    pool = pool.filter(q => chapterIds.includes(q.chapterId));
  }
  if (difficulty) {
    pool = pool.filter(q => q.difficulty === difficulty);
  }

  const mcqPool = shuffle(pool.filter(q => q.type === 'mcq'));
  const tfPool = shuffle(pool.filter(q => q.type === 'truefalse'));

  const selectedMCQ = mcqPool.slice(0, Math.min(mcqCount, mcqPool.length));
  const selectedTF = tfPool.slice(0, Math.min(trueFalseCount, tfPool.length));

  return [...selectedMCQ, ...selectedTF];
}

/**
 * Tạo một đề thi mới
 */
export function createNewExam({ name, description = '', questionIds = [] }) {
  return {
    id: generateId('exam'),
    name: name.trim() || 'Đề thi mới',
    description: description.trim(),
    questionIds: [...questionIds],
    createdAt: new Date().toISOString()
  };
}
