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

  // Trả lời câu hỏi ngắn
  const handleSelectShortAnswer = (qId, val) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  // Nộp bài
  const handleSubmitExam = () => {
    const totalQ = examQuestions.length;
    let answeredQ = 0;
    examQuestions.forEach(q => {
      if (q.type === 'mcq') {
        if (userAnswers[q.id] !== undefined) answeredQ++;
      } else if (q.type === 'short_answer') {
        const val = userAnswers[q.id];
        if (val !== undefined && String(val).trim() !== '') answeredQ++;
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
        <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 shadow-[0_8px_20px_rgba(163,177,198,0.4),0_2px_6px_rgba(163,177,198,0.2)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF8800] animate-pulse" />
              <span className="text-[11px] font-display font-extrabold text-[#FF8800] uppercase tracking-wider">
                Khảo Thí Trực Tuyến
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight flex items-center gap-2">
              Phòng Luyện Tập Trực Tuyến
            </h2>
            <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] mt-1">
              Làm bài kiểm tra có bấm giờ, chấm điểm tự động và xem hướng dẫn giải chi tiết
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickPracticeRandom}
              className="flex items-center gap-1.5 px-4 py-2.5 neu-btn-primary text-xs font-display font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" /> Luyện tập ngẫu nhiên (10 câu)
            </button>
            {allWrongIds.length > 0 && (
              <button
                onClick={handlePracticeAllHistoryWrongQuestions}
                className="flex items-center gap-1.5 px-4 py-2.5 neu-btn text-rose-500 rounded-2xl text-xs font-display font-bold cursor-pointer active:scale-95 transition"
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
                className="neu-card rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white mb-1">
                    {exam.name}
                  </h3>
                  <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] mb-3 line-clamp-2">
                    {exam.description || 'Không có mô tả chi tiết'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                    <span className="neu-inset-sm px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#FF8800]">
                      {count} câu hỏi
                    </span>
                    {latestAttempt && (
                      <span className="neu-inset-sm px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Điểm gần nhất: {latestAttempt.score}/{latestAttempt.totalMaxScore} ({latestAttempt.percentage}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => startExam(exam)}
                    className="flex items-center gap-2 px-5 py-2.5 neu-btn-primary text-xs font-display font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer active:scale-95 transition"
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
        <div className="neu-card p-7 sm:p-9 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 text-center relative overflow-hidden">
          <div className="inline-flex p-3 rounded-2xl neu-inset text-[#FF8800] mb-3">
            <Award className="w-10 h-10 drop-shadow-[0_2px_8px_rgba(255,136,0,0.4)]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2D3748] dark:text-white mb-1">
            Kết Quả Bài Luyện Tập
          </h2>
          <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
            {activeExam.name} • Thời gian làm bài: {formatTime(lastAttemptResult.durationSeconds)}
          </p>

          {/* Big Score Display */}
          <div className="my-6">
            <div className="text-5xl sm:text-6xl font-display font-black text-[#FF8800] drop-shadow-[0_2px_10px_rgba(255,136,0,0.35)]">
              {lastAttemptResult.score} <span className="text-2xl font-bold text-[#718096]">/ {lastAttemptResult.totalMaxScore}</span>
            </div>
            <div className="text-xs sm:text-sm font-display font-extrabold text-[#2D3748] dark:text-white mt-1 uppercase tracking-wider">
              Đạt {lastAttemptResult.percentage}% số điểm
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => startExam(activeExam)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neu-btn text-xs font-display font-bold text-[#FF8800] cursor-pointer active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" /> Làm Lại Đề Này
            </button>

            {wrongCount > 0 && (
              <button
                onClick={handleCreateWrongQuestionsExam}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neu-btn text-rose-500 text-xs font-display font-bold cursor-pointer active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" /> Tạo Đề Ôn Lại {wrongCount} Câu Sai
              </button>
            )}

            <button
              onClick={() => setActiveExam(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neu-btn text-[#718096] dark:text-[#94A3B8] text-xs font-display font-bold cursor-pointer active:scale-95 transition"
            >
              Chọn Đề Khác
            </button>
          </div>
        </div>

        {/* Chapter Breakdown */}
        {Object.keys(lastAttemptResult.chapterBreakdown).length > 0 && (
          <div className="neu-card p-6 sm:p-7 rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-4">
            <h3 className="text-xs font-display font-extrabold text-[#2D3748] dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <BarChart className="w-4 h-4 text-[#FF8800]" /> Tỷ Lệ Điểm Theo Từng Chương Kiến Thức
            </h3>
            <div className="space-y-3">
              {Object.entries(lastAttemptResult.chapterBreakdown).map(([chName, stats]) => (
                <div key={chName} className="neu-inset p-3.5 rounded-2xl">
                  <div className="flex justify-between text-xs font-medium text-[#4A5568] dark:text-[#CBD5E1] mb-2">
                    <span className="truncate max-w-[70%] font-bold">{chName}</span>
                    <span className="font-extrabold text-[#FF8800]">{stats.correct}/{stats.total} đ ({stats.percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 neu-inset-sm rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.percent >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : stats.percent >= 50 ? 'bg-gradient-to-r from-[#FF8800] to-amber-400' : 'bg-gradient-to-r from-rose-500 to-red-400'
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
        <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-5">
          <h3 className="text-xs font-display font-extrabold text-[#2D3748] dark:text-white border-b border-black/5 dark:border-white/5 pb-3 uppercase tracking-wider">
            Chi Tiết Hướng Dẫn Giải Từng Câu
          </h3>

          <div className="space-y-5">
            {examQuestions.map((q, idx) => {
              const res = lastAttemptResult.questionResults[q.id];
              const isCorrect = res?.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl neu-card border transition ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-display font-extrabold text-xs flex items-center gap-1.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      Câu {idx + 1} ({res?.score}/{res?.maxScore} điểm)
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg neu-inset-sm text-[#FF8800]">
                      {q.type === 'mcq' ? 'Trắc nghiệm' : 'Đúng/Sai 4 ý'}
                    </span>
                  </div>

                  {/* Stem */}
                  <div className="text-xs sm:text-sm font-semibold text-[#2D3748] dark:text-white mb-3">
                    <MathRenderer text={q.stem} />
                  </div>

                  {/* Answers review */}
                  {q.type === 'mcq' ? (
                    <div className="space-y-2 mb-3">
                      {(q.options || []).map((opt, optIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][optIdx];
                        const isUserChoice = res.userChoice === optIdx;
                        const isCorrectOption = q.correct === optIdx;

                        let style = 'neu-inset text-[#4A5568] dark:text-[#CBD5E1]';
                        if (isCorrectOption) {
                          style = 'neu-inset text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-bold';
                        } else if (isUserChoice && !isCorrectOption) {
                          style = 'neu-inset text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30 line-through';
                        }

                        return (
                          <div key={optIdx} className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${style}`}>
                            <span className="font-display font-black">{letter}.</span>
                            <span className="flex-1"><MathRenderer text={opt} /></span>
                            {isCorrectOption && <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Đáp án đúng</span>}
                            {isUserChoice && !isCorrectOption && <span className="text-[10px] uppercase font-bold text-rose-500">Bạn chọn</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : q.type === 'short_answer' ? (
                    /* Short Answer review */
                    <div className="p-3.5 rounded-2xl neu-inset space-y-1.5 mb-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#718096] dark:text-[#94A3B8]">Câu trả lời của bạn:</span>
                        <span className={`font-bold ${res.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {res.userVal ? String(res.userVal) : '(Bỏ trống)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#718096] dark:text-[#94A3B8]">Đáp án chính xác:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {q.correctAnswer || q.answer}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* True/False Statements review */
                    <div className="space-y-2 mb-3">
                      {(q.statements || []).map(stmt => {
                        const detail = res.details?.[stmt.label] || {};
                        const stmtCorrect = detail.isCorrect;
                        const userValStr = detail.userVal === true ? 'Đúng' : detail.userVal === false ? 'Sai' : 'Chưa chọn';
                        const correctValStr = detail.correctVal ? 'Đúng' : 'Sai';

                        return (
                          <div
                            key={stmt.label}
                            className={`p-3 rounded-2xl text-xs flex items-center justify-between gap-2 border ${
                              stmtCorrect
                                ? 'neu-inset border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : 'neu-inset border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            <div className="flex-1">
                              <span className="font-display font-extrabold mr-1.5">{stmt.label})</span>
                              <MathRenderer text={stmt.text} />
                            </div>
                            <div className="text-[11px] shrink-0 font-medium">
                              <span>Bạn: <b>{userValStr}</b></span> • <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đáp án: {correctValStr}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-3 rounded-2xl neu-inset text-xs text-[#4A5568] dark:text-[#CBD5E1]">
                      <span className="font-display font-bold text-[#FF8800] block mb-1">Lời giải thích:</span>
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
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header bar: Timer, Title, Submit */}
      <div className="sticky top-20 z-30 neu-card p-4 rounded-2xl bg-[#EBECF0]/95 dark:bg-[#1A1E24]/95 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs sm:text-sm font-display font-extrabold text-[#2D3748] dark:text-white line-clamp-1">
            {activeExam.name}
          </h2>
          <div className="text-[11px] font-bold text-[#FF8800]">
            Câu {currentIndex + 1} / {examQuestions.length}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-inset-sm text-[#FF8800] font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <button
            onClick={handleSubmitExam}
            className="flex items-center gap-1.5 px-4 py-2 neu-btn-primary rounded-xl text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer active:scale-95 transition"
          >
            <Send className="w-3.5 h-3.5" />
            Nộp Bài
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-display font-extrabold px-2.5 py-1 rounded-xl neu-inset-sm text-[#FF8800]">
                Câu {currentIndex + 1}
              </span>
              <span className="text-xs font-medium text-[#718096] dark:text-[#94A3B8]">
                {currentQ.type === 'mcq'
                  ? 'Trắc nghiệm 1 lựa chọn'
                  : currentQ.type === 'short_answer'
                  ? 'Trả lời ngắn / Điền số'
                  : 'Đúng / Sai 4 ý'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
              {currentQ.difficulty}
            </span>
          </div>

          {/* Stem */}
          <div className="text-sm sm:text-base font-semibold text-[#2D3748] dark:text-white leading-relaxed">
            <MathRenderer text={currentQ.stem} />
          </div>

          {/* Input Answer Section */}
          {currentQ.type === 'mcq' ? (
            <div className="space-y-2.5">
              {(currentQ.options || []).map((opt, optIdx) => {
                const letter = ['A', 'B', 'C', 'D'][optIdx];
                const isSelected = userAnswers[currentQ.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectMCQ(currentQ.id, optIdx)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-xs sm:text-sm text-left transition cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'neu-inset text-[#FF8800] bg-[#FF8800]/15 border-[#FF8800]/40 shadow-sm'
                        : 'neu-btn text-[#4A5568] dark:text-[#CBD5E1] border-transparent hover:text-[#FF8800]'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-display font-black text-xs shrink-0 transition ${
                      isSelected
                        ? 'neu-inset text-[#FF8800] bg-[#FF8800]/20'
                        : 'neu-btn text-[#718096] dark:text-[#94A3B8]'
                    }`}>
                      {letter}
                    </span>
                    <span className="mt-0.5 flex-1 font-medium">
                      <MathRenderer text={opt} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : currentQ.type === 'short_answer' ? (
            /* Short Answer input box */
            <div className="space-y-3 p-4 rounded-2xl neu-inset">
              <label className="text-xs font-display font-bold text-[#2D3748] dark:text-white block">
                Nhập câu trả lời hoặc số liệu của bạn:
              </label>
              <input
                type="text"
                disabled={isSubmitted}
                value={userAnswers[currentQ.id] !== undefined ? String(userAnswers[currentQ.id]) : ''}
                onChange={(e) => handleSelectShortAnswer(currentQ.id, e.target.value)}
                placeholder="Ví dụ: 351 hoặc 23,4"
                className="w-full sm:w-80 px-4 py-2.5 rounded-2xl neu-inset bg-transparent text-[#2D3748] dark:text-white font-medium text-xs focus:ring-1 focus:ring-[#FF8800]/50 outline-none"
              />
              <p className="text-[11px] text-[#718096]">
                Lưu ý: Đối với số thập phân, bạn có thể dùng dấu phẩy (,) hoặc dấu chấm (.).
              </p>
            </div>
          ) : (
            /* True/False Statements with interactive buttons */
            <div className="space-y-3">
              <p className="text-xs text-[#718096] italic">
                * Thí sinh chọn ĐÚNG hoặc SAI cho mỗi nhận định sau:
              </p>
              {(currentQ.statements || []).map(stmt => {
                const userVal = userAnswers[currentQ.id]?.[stmt.label];

                return (
                  <div
                    key={stmt.label}
                    className="p-3.5 rounded-2xl neu-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <span className="font-display font-bold text-[#FF8800] shrink-0">{stmt.label})</span>
                      <span className="font-medium text-[#2D3748] dark:text-white"><MathRenderer text={stmt.text} /></span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => handleSelectTF(currentQ.id, stmt.label, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          userVal === true
                            ? 'neu-inset text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                            : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-emerald-500'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectTF(currentQ.id, stmt.label, false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          userVal === false
                            ? 'neu-inset text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30'
                            : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-rose-500'
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
          <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl neu-btn text-xs font-display font-bold text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] disabled:opacity-40 cursor-pointer active:scale-95 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Câu trước
            </button>

            <button
              onClick={() => setCurrentIndex(i => Math.min(examQuestions.length - 1, i + 1))}
              disabled={currentIndex === examQuestions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl neu-btn text-xs font-display font-bold text-[#FF8800] disabled:opacity-40 cursor-pointer active:scale-95 transition"
            >
              Câu tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bubble Question Palette */}
      <div className="neu-card p-5 rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-3">
        <div className="text-xs font-display font-extrabold text-[#2D3748] dark:text-white uppercase tracking-wider">
          Bảng điều hướng câu hỏi:
        </div>
        <div className="flex flex-wrap gap-2">
          {examQuestions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            let isAnswered = false;
            if (q.type === 'mcq') {
              isAnswered = userAnswers[q.id] !== undefined;
            } else if (q.type === 'short_answer') {
              const val = userAnswers[q.id];
              isAnswered = val !== undefined && String(val).trim() !== '';
            } else {
              const tf = userAnswers[q.id] || {};
              isAnswered = Object.keys(tf).length === 4;
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-display font-bold transition flex items-center justify-center cursor-pointer active:scale-95 ${
                  isCurrent
                    ? 'neu-extruded text-[#FF8800] ring-2 ring-[#FF8800]'
                    : isAnswered
                    ? 'neu-inset text-[#FF8800] bg-[#FF8800]/10'
                    : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
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
