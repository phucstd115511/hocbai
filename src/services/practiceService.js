import { generateId } from '../types/schema.js';

/**
 * Tính điểm cho câu hỏi Đúng / Sai 4 ý
 * @param {Array} statements Danh sách phát biểu gốc (chứa answer: boolean)
 * @param {Object} userAnswers Đáp án học sinh chọn { a: boolean, b: boolean, c: boolean, d: boolean }
 * @param {'standard_thpt'|'proportional'} scoringMode Chế độ tính điểm
 */
export function scoreTrueFalseQuestion(statements = [], userAnswers = {}, scoringMode = 'standard_thpt') {
  let correctCount = 0;
  const details = {};

  statements.forEach(stmt => {
    const userVal = userAnswers[stmt.label || stmt.id];
    const isCorrect = userVal === stmt.answer;
    details[stmt.label || stmt.id] = {
      userVal,
      correctVal: stmt.answer,
      isCorrect
    };
    if (isCorrect) correctCount++;
  });

  let score = 0;
  if (scoringMode === 'standard_thpt') {
    // Quy chế mới Bộ GD&ĐT: 1 ý = 0.1đ, 2 ý = 0.25đ, 3 ý = 0.5đ, 4 ý = 1.0đ
    if (correctCount === 1) score = 0.1;
    else if (correctCount === 2) score = 0.25;
    else if (correctCount === 3) score = 0.5;
    else if (correctCount === 4) score = 1.0;
  } else {
    // Chia đều: mỗi ý 0.25đ
    score = correctCount * 0.25;
  }

  return {
    correctCount,
    totalStatements: statements.length,
    score: Math.round(score * 100) / 100,
    maxScore: 1.0,
    isFullyCorrect: correctCount === statements.length,
    details
  };
}

/**
 * Chấm điểm toàn bộ bài thi
 */
export function gradeAttempt({ exam, questions, userAnswers, chapterMap = {}, scoringMode = 'standard_thpt', durationSeconds = 0 }) {
  let totalScore = 0;
  let totalMaxScore = 0;
  const wrongQuestionIds = [];
  const questionResults = {};
  const chapterBreakdown = {};

  questions.forEach(q => {
    const chapterName = chapterMap[q.chapterId] || 'Chủ đề chung';
    if (!chapterBreakdown[chapterName]) {
      chapterBreakdown[chapterName] = { correct: 0, total: 0, percent: 0 };
    }

    chapterBreakdown[chapterName].total += 1.0;
    totalMaxScore += 1.0;

    if (q.type === 'mcq') {
      const userChoice = userAnswers[q.id];
      const isCorrect = userChoice === q.correct;
      const score = isCorrect ? 1.0 : 0;
      totalScore += score;
      chapterBreakdown[chapterName].correct += score;

      questionResults[q.id] = {
        type: 'mcq',
        isCorrect,
        score,
        maxScore: 1.0,
        userChoice,
        correctChoice: q.correct
      };

      if (!isCorrect) {
        wrongQuestionIds.push(q.id);
      }
    } else if (q.type === 'short_answer') {
      const userVal = String(userAnswers[q.id] || '').trim().replace(/,/g, '.');
      const correctVal = String(q.correctAnswer || q.answer || '').trim().replace(/,/g, '.');
      const isCorrect = userVal !== '' && userVal === correctVal;
      const score = isCorrect ? 1.0 : 0;
      totalScore += score;
      chapterBreakdown[chapterName].correct += score;

      questionResults[q.id] = {
        type: 'short_answer',
        isCorrect,
        score,
        maxScore: 1.0,
        userVal: userAnswers[q.id],
        correctVal: q.correctAnswer || q.answer
      };

      if (!isCorrect) {
        wrongQuestionIds.push(q.id);
      }
    } else {
      // True/False
      const ansObj = userAnswers[q.id] || {};
      const res = scoreTrueFalseQuestion(q.statements, ansObj, scoringMode);
      totalScore += res.score;
      chapterBreakdown[chapterName].correct += res.score;

      questionResults[q.id] = {
        type: 'truefalse',
        isCorrect: res.isFullyCorrect,
        score: res.score,
        maxScore: 1.0,
        correctCount: res.correctCount,
        details: res.details
      };

      if (!res.isFullyCorrect) {
        wrongQuestionIds.push(q.id);
      }
    }
  });

  // Tính phần trăm theo chương
  Object.keys(chapterBreakdown).forEach(ch => {
    const data = chapterBreakdown[ch];
    data.percent = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
  });

  const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 1000) / 10 : 0;

  return {
    id: generateId('att'),
    examId: exam.id,
    examName: exam.name,
    score: Math.round(totalScore * 100) / 100,
    totalMaxScore: Math.round(totalMaxScore * 100) / 100,
    percentage,
    answers: userAnswers,
    wrongQuestionIds,
    questionResults,
    chapterBreakdown,
    date: new Date().toISOString(),
    durationSeconds
  };
}

/**
 * Gom tất cả các câu hỏi từng làm sai để tạo đề ôn tập
 */
export function getUniqueWrongQuestionIds(attempts = []) {
  const set = new Set();
  attempts.forEach(att => {
    (att.wrongQuestionIds || []).forEach(id => set.add(id));
  });
  return Array.from(set);
}
