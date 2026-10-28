import React, { useState, useEffect, useMemo, useRef } from 'react';
import MathRenderer from '../common/MathRenderer.jsx';
import { gradeAttempt, getUniqueWrongQuestionIds } from '../../services/practiceService.js';
import { prepareExamQuestions, createNewExam } from '../../services/examService.js';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  FileQuestion, 
  BarChart, 
  ArrowLeft, 
  ArrowRight,
  Send,
  HelpCircle,
  Award,
  Sparkles
} from 'lucide-react';

export default function PracticeRoom({
  exams = [],
  questions = [],
  subjects = [],
  attempts = [],
  scoringMode = 'standard_thpt',
  initialExam = null,
  onSaveAttempt,
  onSaveExam,
  onNavigateToStats
}) {
  const [activeExam, setActiveExam] = useState(initialExam);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastAttemptResult, setLastAttemptResult] = useState(null);
  
  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Map chapterId -> chapterName
  const chapterMap = useMemo(() => {
    const map = {};
    subjects.forEach(s => {
      (s.chapters || []).forEach(c => {
        map[c.id] = c.name;
      });
    });
    return map;
  }, [subjects]);

  const questionsMap = useMemo(() => {
    const map = {};
    questions.forEach(q => { map[q.id] = q; });
    return map;
  }, [questions]);

  // Khởi động bài thi
  const startExam = (exam) => {
    const prepared = prepareExamQuestions(exam, questionsMap, {
      shuffleQuestions: false,
      shuffleAnswers: false
    });

    if (prepared.length === 0) {
      alert('Đề thi này không có câu hỏi nào hợp lệ.');
      return;
    }

    setActiveExam(exam);
    setExamQuestions(prepared);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setLastAttemptResult(null);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    if (initialExam) {
      startExam(initialExam);
    }
  }, [initialExam]);

  // Bộ đếm thời gian
  useEffect(() => {
    if (isTimerRunning && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isSubmitted]);

  // Định dạng thời gian mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Chọn đáp án MCQ
  const handleSelectMCQ = (qId, optionIdx) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  // Chọn đáp án Đúng/Sai
  const handleSelectTF = (qId, stmtLabel, boolVal) => {
    if (isSubmitted) return;
    setUserAnswers(prev => {
      const current = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...current,
          [stmtLabel]: boolVal
        }
      };
    });
  };

  // Nộp bài
  const handleSubmitExam = () => {
    const totalQ = examQuestions.length;
    let answeredQ = 0;
    examQuestions.forEach(q => {
      if (q.type === 'mcq') {
        if (userAnswers[q.id] !== undefined) answeredQ++;
      } else {
        const tf = userAnswers[q.id] || {};
        if (Object.keys(tf).length === 4) answeredQ++;
      }
    });

    if (answeredQ < totalQ) {
      const confirmSubmit = confirm(`Bạn mới trả lời hoàn thành ${answeredQ}/${totalQ} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?`);
      if (!confirmSubmit) return;
    }

    setIsTimerRunning(false);
    setIsSubmitted(true);

    const result = gradeAttempt({
      exam: activeExam,
      questions: examQuestions,
      userAnswers,
      chapterMap,
      scoringMode,
      durationSeconds: secondsElapsed
    });

    setLastAttemptResult(result);
    onSaveAttempt(result);
  };

  // Tạo đề câu sai từ kết quả vừa làm
  const handleCreateWrongQuestionsExam = () => {
    if (!lastAttemptResult || !lastAttemptResult.wrongQuestionIds?.length) {
      alert('Bạn không làm sai câu nào trong bài thi này!');
      return;
    }

    const wrongIds = lastAttemptResult.wrongQuestionIds;
    const newExam = createNewExam({
      name: `Ôn Tập Câu Sai - ${activeExam.name.slice(0, 20)}`,
      description: `Đề ôn luyện gồm ${wrongIds.length} câu đã làm sai trong lần thi ngày ${new Date().toLocaleDateString('vi-VN')}`,
      questionIds: wrongIds
    });

    onSaveExam(newExam);
    alert(`Đã tạo thành công đề ôn tập mới với ${wrongIds.length} câu hỏi làm sai!`);
    startExam(newExam);
  };

  // Tạo đề ngẫu nhiên nhanh
  const handleQuickPracticeRandom = () => {
    if (questions.length === 0) {
      alert('Chưa có câu hỏi nào trong ngân hàng.');
      return;
    }
    const sample = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);
    const quickExam = createNewExam({
      name: `Luyện Tập Nhanh 10 Câu (${new Date().toLocaleDateString('vi-VN')})`,
      description: 'Đề luyện tập ngẫu nhiên được sinh tự động',
      questionIds: sample.map(q => q.id)
    });
    onSaveExam(quickExam);
    startExam(quickExam);
  };

  // Tạo đề ôn tập tất cả các câu từng làm sai trong lịch sử
  const handlePracticeAllHistoryWrongQuestions = () => {
    const wrongIds = getUniqueWrongQuestionIds(attempts);
    if (wrongIds.length === 0) {
      alert('Tuyệt vời! Bạn chưa có câu làm sai nào trong lịch sử luyện tập.');
      return;
    }

    const newExam = createNewExam({
      name: `Tổng Ôn Các Câu Từng Sai (${wrongIds.length} câu)`,
      description: 'Tổng hợp các câu hỏi từng trả lời sai trong mọi lần luyện tập',
      questionIds: wrongIds
    });

    onSaveExam(newExam);
    startExam(newExam);
  };

  const currentQ = examQuestions[currentIndex];

  // ==========================================
  // VIEW 1: EXAM SELECTION / DASHBOARD
  // ==========================================
  if (!activeExam) {
    const allWrongIds = getUniqueWrongQuestionIds(attempts);

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Phòng Luyện Tập Trực Tuyến
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Làm bài kiểm tra có bấm giờ, chấm điểm tự động và xem hướng dẫn giải chi tiết
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickPracticeRandom}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20"
            >
              <Sparkles className="w-4 h-4" /> Luyện tập ngẫu nhiên (10 câu)
            </button>
            {allWrongIds.length > 0 && (
              <button
                onClick={handlePracticeAllHistoryWrongQuestions}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                <RotateCcw className="w-4 h-4" /> Ôn lại {allWrongIds.length} câu từng làm sai
              </button>
            )}
          </div>
        </div>

        {/* List of Available Exams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map(exam => {
            const count = (exam.questionIds || []).length;
            const pastAttempts = attempts.filter(a => a.examId === exam.id);
            const latestAttempt = pastAttempts[pastAttempts.length - 1];

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {exam.description || 'Không có mô tả chi tiết'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                    <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold">
                      {count} câu hỏi
                    </span>
                    {latestAttempt && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Điểm gần nhất: {latestAttempt.score}/{latestAttempt.totalMaxScore} ({latestAttempt.percentage}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => startExam(exam)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Bắt Đầu Làm Bài
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: RESULTS SCREEN (AFTER SUBMISSION)
  // ==========================================
  if (isSubmitted && lastAttemptResult) {
    const wrongCount = lastAttemptResult.wrongQuestionIds.length;
    const isPerfect = wrongCount === 0;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Score Summary Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

          <div className="inline-flex p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 mb-3">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Kết Quả Bài Luyện Tập
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeExam.name} • Thời gian làm bài: {formatTime(lastAttemptResult.durationSeconds)}
          </p>

          {/* Big Score Display */}
          <div className="my-6">
            <div className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
              {lastAttemptResult.score} <span className="text-2xl font-semibold text-slate-400">/ {lastAttemptResult.totalMaxScore}</span>
            </div>
            <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
              Đạt {lastAttemptResult.percentage}% số điểm
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => startExam(activeExam)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition"
            >
              <RotateCcw className="w-4 h-4" /> Làm Lại Đề Này
            </button>

            {wrongCount > 0 && (
              <button
                onClick={handleCreateWrongQuestionsExam}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition"
              >
                <Sparkles className="w-4 h-4" /> Tạo Đề Ôn Lại {wrongCount} Câu Sai
              </button>
            )}

            <button
              onClick={() => setActiveExam(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Chọn Đề Khác
            </button>
          </div>
        </div>

        {/* Chapter Breakdown */}
        {Object.keys(lastAttemptResult.chapterBreakdown).length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-sky-500" /> Tỷ Lệ Điểm Theo Từng Chương Kiến Thức
            </h3>
            <div className="space-y-3">
              {Object.entries(lastAttemptResult.chapterBreakdown).map(([chName, stats]) => (
                <div key={chName}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span className="truncate max-w-[70%]">{chName}</span>
                    <span className="font-bold">{stats.correct}/{stats.total} đ ({stats.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.percent >= 80 ? 'bg-emerald-500' : stats.percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${stats.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Solutions Review */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Chi Tiết Hướng Dẫn Giải Từng Câu
          </h3>

          <div className="space-y-6">
            {examQuestions.map((q, idx) => {
              const res = lastAttemptResult.questionResults[q.id];
              const isCorrect = res?.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      Câu {idx + 1} ({res?.score}/{res?.maxScore} điểm)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {q.type === 'mcq' ? 'Trắc nghiệm' : 'Đúng/Sai 4 ý'}
                    </span>
                  </div>

                  {/* Stem */}
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
                    <MathRenderer text={q.stem} />
                  </div>

                  {/* Answers review */}
                  {q.type === 'mcq' ? (
                    <div className="space-y-1.5 mb-3">
                      {q.options.map((opt, optIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][optIdx];
                        const isUserChoice = res.userChoice === optIdx;
                        const isCorrectOption = q.correct === optIdx;

                        let style = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                        if (isCorrectOption) {
                          style = 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300';
                        } else if (isUserChoice && !isCorrectOption) {
                          style = 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 line-through';
                        }

                        return (
                          <div key={optIdx} className={`p-2 rounded-xl text-xs flex items-start gap-2 ${style}`}>
                            <span className="font-bold">{letter}.</span>
                            <span className="flex-1"><MathRenderer text={opt} /></span>
                            {isCorrectOption && <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">Đáp án đúng</span>}
                            {isUserChoice && !isCorrectOption && <span className="text-[10px] uppercase font-bold text-rose-600">Bạn chọn</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* True/False Statements review */
                    <div className="space-y-1.5 mb-3">
                      {q.statements.map(stmt => {
                        const detail = res.details?.[stmt.label] || {};
                        const stmtCorrect = detail.isCorrect;
                        const userValStr = detail.userVal === true ? 'Đúng' : detail.userVal === false ? 'Sai' : 'Chưa chọn';
                        const correctValStr = detail.correctVal ? 'Đúng' : 'Sai';

                        return (
                          <div
                            key={stmt.label}
                            className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                              stmtCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200'
                                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200'
                            }`}
                          >
                            <div className="flex-1">
                              <span className="font-bold mr-1">{stmt.label})</span>
                              <MathRenderer text={stmt.text} />
                            </div>
                            <div className="text-[11px] shrink-0 font-medium">
                              <span>Bạn: <b>{userValStr}</b></span> • <span className="text-emerald-700 dark:text-emerald-300 font-bold">Đáp án: {correctValStr}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-sky-600 dark:text-sky-400 block mb-0.5">Lời giải thích:</span>
                      <MathRenderer text={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ACTIVE TEST TAKING SCREEN
  // ==========================================
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header bar: Timer, Title, Submit */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
            {activeExam.name}
          </h2>
          <div className="text-[11px] text-slate-500">
            Câu {currentIndex + 1} / {examQuestions.length}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs sm:text-sm border border-sky-200 dark:border-sky-800">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <button
            onClick={handleSubmitExam}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Send className="w-3.5 h-3.5" />
            Nộp Bài
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                Câu {currentIndex + 1}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {currentQ.type === 'mcq' ? 'Trắc nghiệm 1 lựa chọn' : 'Đúng / Sai 4 ý'}
              </span>
            </div>
            <span className="text-xs text-slate-400 capitalize">
              {currentQ.difficulty}
            </span>
          </div>

          {/* Stem */}
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
            <MathRenderer text={currentQ.stem} />
          </div>

          {/* Input Answer Section */}
          {currentQ.type === 'mcq' ? (
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const letter = ['A', 'B', 'C', 'D'][optIdx];
                const isSelected = userAnswers[currentQ.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectMCQ(currentQ.id, optIdx)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-xs sm:text-sm text-left transition ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-100 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {letter}
                    </span>
                    <span className="mt-0.5 flex-1">
                      <MathRenderer text={opt} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* True/False Statements with interactive buttons */
            <div className="space-y-3">
              <p className="text-xs text-slate-500 italic">
                * Thí sinh chọn ĐÚNG hoặc SAI cho mỗi nhận định sau:
              </p>
              {currentQ.statements.map(stmt => {
                const userVal = userAnswers[currentQ.id]?.[stmt.label];

                return (
                  <div
                    key={stmt.label}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <span className="font-bold text-slate-500 shrink-0">{stmt.label})</span>
                      <span><MathRenderer text={stmt.text} /></span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => handleSelectTF(currentQ.id, stmt.label, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          userVal === true
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectTF(currentQ.id, stmt.label, false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          userVal === false
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Sai
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation Buttons: Prev / Next */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" /> Câu trước
            </button>

            <button
              onClick={() => setCurrentIndex(i => Math.min(examQuestions.length - 1, i + 1))}
              disabled={currentIndex === examQuestions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              Câu tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bubble Question Palette */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          Bảng điều hướng câu hỏi:
        </div>
        <div className="flex flex-wrap gap-2">
          {examQuestions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            let isAnswered = false;
            if (q.type === 'mcq') {
              isAnswered = userAnswers[q.id] !== undefined;
            } else {
              const tf = userAnswers[q.id] || {};
              isAnswered = Object.keys(tf).length === 4;
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? 'ring-2 ring-sky-500 bg-sky-600 text-white shadow-sm'
                    : isAnswered
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
