import React, { useState, useMemo, useEffect, useRef } from 'react';
import MathRenderer from '../common/MathRenderer.jsx';
import PrintView from '../print/PrintView.jsx';
import { scoreTrueFalseQuestion } from '../../services/practiceService.js';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Send, 
  Award, 
  Printer, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  ListOrdered,
  LayoutList,
  Sparkles
} from 'lucide-react';

export default function CongNgheGHKIQuiz({
  allQuestions = [],
  subjects = [],
  onSaveAttempt
}) {
  // Lọc riêng danh sách câu hỏi của Công Nghệ GHKI
  const congNgheQuestions = useMemo(() => {
    const list = allQuestions.filter(q => 
      q.subjectId === 'sub_congnghe_ghki' || 
      (q.tags || []).includes('Công Nghệ GHKI')
    );
    return list.length > 0 ? list : allQuestions;
  }, [allQuestions]);

  // Bộ lọc bài học
  const [selectedLesson, setSelectedLesson] = useState('all'); // 'all' | 'chap_b1' | ...
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'mcq' | 'truefalse'
  const [displayMode, setDisplayMode] = useState('scroll'); // 'scroll' (danh sách cuộn làm bài) | 'single' (từng câu một)

  // Danh sách câu hỏi theo bộ lọc hiện tại
  const questionsToTest = useMemo(() => {
    return congNgheQuestions.filter(q => {
      if (selectedLesson !== 'all' && q.chapterId !== selectedLesson) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      return true;
    });
  }, [congNgheQuestions, selectedLesson, selectedType]);

  // Vị trí câu hiện tại khi ở chế độ 'single'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Câu trả lời của học sinh: { [qId]: optionIndex (cho mcq) | { a: bool, b: bool... } (cho tf) }
  const [userAnswers, setUserAnswers] = useState({});

  // Trạng thái đã nộp bài hay chưa (mặc định false: CHƯA NỘP, KHÔNG CÓ ĐÁP ÁN NÀO HIỆN SẴN)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [revealedSingleQuestions, setRevealedSingleQuestions] = useState({}); // dùng khi người dùng tự muốn xem giải thích 1 câu cụ thể

  // Đồng hồ bấm giờ
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const timerRef = useRef(null);

  // In đề thi
  const [isPrinting, setIsPrinting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, isSubmitted]);

  // Reset currentIndex nếu câu hỏi lọc thay đổi
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedLesson, selectedType]);

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Người dùng chọn phương án MCQ
  const handleSelectMCQ = (qId, optIdx) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  // Người dùng chọn Đúng / Sai cho từng ý
  const handleSelectTF = (qId, stmtLabel, value) => {
    if (isSubmitted) return;
    setUserAnswers(prev => {
      const current = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...current,
          [stmtLabel]: value
        }
      };
    });
  };

  // Tính số câu đã hoàn thành
  const answeredCount = useMemo(() => {
    let count = 0;
    questionsToTest.forEach(q => {
      if (q.type === 'mcq') {
        if (userAnswers[q.id] !== undefined) count++;
      } else {
        const tf = userAnswers[q.id] || {};
        if (Object.keys(tf).length === 4) count++;
      }
    });
    return count;
  }, [questionsToTest, userAnswers]);

  // Xử lý nộp bài
  const handleSubmit = () => {
    if (answeredCount < questionsToTest.length) {
      const confirmSubmit = confirm(`Bạn mới làm ${answeredCount}/${questionsToTest.length} câu. Bạn có chắc chắn muốn nộp bài để chấm điểm ngay không?`);
      if (!confirmSubmit) return;
    }
    setIsTimerActive(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Làm lại từ đầu
  const handleReset = () => {
    if (confirm('Làm lại từ đầu? Tất cả các đáp án bạn vừa chọn sẽ được đặt lại.')) {
      setUserAnswers({});
      setIsSubmitted(false);
      setRevealedSingleQuestions({});
      setSeconds(0);
      setIsTimerActive(true);
      setCurrentIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Chấm điểm sau khi nộp
  const scoreResult = useMemo(() => {
    if (!isSubmitted) return null;

    let totalPoints = 0;
    let maxPoints = questionsToTest.length;
    let correctCount = 0;

    questionsToTest.forEach(q => {
      if (q.type === 'mcq') {
        const choice = userAnswers[q.id];
        if (choice === q.correct) {
          totalPoints += 1;
          correctCount++;
        }
      } else {
        const userTf = userAnswers[q.id] || {};
        const res = scoreTrueFalseQuestion(q.statements, userTf, 'standard_thpt');
        totalPoints += res.score;
        if (res.isFullyCorrect) correctCount++;
      }
    });

    const percent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    return {
      totalPoints: Math.round(totalPoints * 100) / 100,
      maxPoints,
      percent,
      correctCount
    };
  }, [isSubmitted, questionsToTest, userAnswers]);

  // Nếu chuyển sang chế độ in
  if (isPrinting) {
    const fakeExam = {
      id: 'print_congnghe_ghki',
      name: 'ĐỀ CƯƠNG ÔN TẬP GIỮA HỌC KÌ I - MÔN CÔNG NGHỆ 11',
      description: 'Trường THPT Nguyễn Trãi - Tổ Lí - Công nghệ (Năm học 2026-2027)',
      questionIds: questionsToTest.map(q => q.id)
    };
    return (
      <PrintView
        exam={fakeExam}
        questions={questionsToTest}
        subjects={subjects}
        onClose={() => setIsPrinting(false)}
      />
    );
  }

  const lessons = [
    { id: 'all', label: 'Tất cả bài học' },
    { id: 'chap_b1', label: 'Bài 1: Khái quát cơ khí' },
    { id: 'chap_b2', label: 'Bài 2: Ngành nghề cơ khí' },
    { id: 'chap_b3', label: 'Bài 3: Tổng quan vật liệu' },
    { id: 'chap_b4', label: 'Bài 4: Vật liệu kim loại' },
    { id: 'chap_b5', label: 'Bài 5: Vật liệu phi kim' },
    { id: 'chap_b6', label: 'Bài 6: Vật liệu mới' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner: Bài làm Công Nghệ GHKI */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Công Nghệ 11 • Giữa Học Kì I (2026-2027)
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Bài Làm: Công Nghệ GHKI
            </h1>
            <p className="text-xs text-sky-100 mt-1 max-w-xl">
              Đề ôn tập trắc nghiệm khách quan & đúng sai 4 ý. Tự làm bài, chọn đáp án và nộp bài để xem điểm số cùng lời giải chi tiết.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPrinting(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur border border-white/20 transition"
              title="In đề thi giấy trắng để làm bài"
            >
              <Printer className="w-4 h-4" /> In Đề A4
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur border border-white/20 transition"
              title="Đặt lại bài làm"
            >
              <RotateCcw className="w-4 h-4" /> Làm Lại
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Progress & Timer Bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs sm:text-sm border border-sky-200 dark:border-sky-800">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>{formatTimer(seconds)}</span>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300">
            Tiến độ: <span className="font-bold text-sky-600 dark:text-sky-400">{answeredCount}</span> / {questionsToTest.length} câu
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setDisplayMode('scroll')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                displayMode === 'scroll' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Dạng đề thi
            </button>
            <button
              onClick={() => setDisplayMode('single')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                displayMode === 'single' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" /> Từng câu
            </button>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <Send className="w-3.5 h-3.5" /> Nộp Bài & Chấm Điểm
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Làm Lại Đề Này
            </button>
          )}
        </div>
      </div>

      {/* Lesson Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Chọn bài:
          </span>
          {lessons.map(ls => {
            const isSelected = selectedLesson === ls.id;
            return (
              <button
                key={ls.id}
                onClick={() => setSelectedLesson(ls.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {ls.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Loại câu hỏi:</span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              selectedType === 'all' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Tất cả ({congNgheQuestions.length})
          </button>
          <button
            onClick={() => setSelectedType('mcq')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              selectedType === 'mcq' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Trắc nghiệm 1 lựa chọn
          </button>
          <button
            onClick={() => setSelectedType('truefalse')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              selectedType === 'truefalse' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Đúng / Sai 4 ý
          </button>
        </div>
      </div>

      {/* Result Card (shown after submission) */}
      {isSubmitted && scoreResult && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mb-1">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Kết Quả Bài Làm Của Bạn
          </h2>
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
            {scoreResult.totalPoints} <span className="text-xl text-slate-400">/ {scoreResult.maxPoints} điểm</span>
          </div>
          <p className="text-xs text-slate-500">
            Đạt <b>{scoreResult.percent}%</b> • Thời gian hoàn thành: <b>{formatTimer(seconds)}</b>
          </p>
          <p className="text-xs text-slate-400 italic">
            * Đáp án đúng và lời giải chi tiết của từng câu đã được mở bên dưới để bạn đối chiếu.
          </p>
        </div>
      )}

      {/* MAIN TEST CONTAINER */}
      {questionsToTest.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Không có câu hỏi nào trong bộ lọc này</h3>
        </div>
      ) : displayMode === 'scroll' ? (
        /* SCROLL VIEW: TẤT CẢ CÂU HỎI CUỘN XUỐNG DẠNG ĐỀ THI */
        <div className="space-y-4">
          {questionsToTest.map((q, idx) => {
            const isUserAnswered = q.type === 'mcq'
              ? userAnswers[q.id] !== undefined
              : Object.keys(userAnswers[q.id] || {}).length === 4;

            const isRevealed = isSubmitted || revealedSingleQuestions[q.id];

            return (
              <div
                key={q.id}
                id={`q_${q.id}`}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition ${
                  isSubmitted
                    ? 'border-slate-200 dark:border-slate-800'
                    : isUserAnswered
                    ? 'border-sky-300 dark:border-sky-800 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {q.type === 'mcq' ? 'Trắc nghiệm 1 lựa chọn' : 'Đúng / Sai 4 ý'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle show answer single button for self-study */}
                    {!isSubmitted && (
                      <button
                        onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="text-[11px] text-slate-400 hover:text-sky-600 flex items-center gap-1 font-medium"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stem */}
                <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                  <MathRenderer text={q.stem} />
                </div>

                {/* Options (MCQ) */}
                {q.type === 'mcq' ? (
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isChosen = userAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correct;

                      let itemStyle = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100';
                      let badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

                      if (!isRevealed) {
                        if (isChosen) {
                          itemStyle = 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-100 ring-1 ring-sky-500 shadow-xs';
                          badgeStyle = 'bg-sky-600 text-white';
                        }
                      } else {
                        // Đã nộp bài / Đã mở đáp án
                        if (isCorrect) {
                          itemStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-medium';
                          badgeStyle = 'bg-emerald-600 text-white';
                        } else if (isChosen && !isCorrect) {
                          itemStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 line-through';
                          badgeStyle = 'bg-rose-600 text-white';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectMCQ(q.id, optIdx)}
                          className={`w-full flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm text-left transition ${itemStyle}`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeStyle}`}>
                            {letter}
                          </span>
                          <span className="flex-1 mt-0.5">
                            <MathRenderer text={opt} />
                          </span>
                          {isRevealed && isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Đáp án đúng
                            </span>
                          )}
                          {isRevealed && isChosen && !isCorrect && (
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Bạn chọn
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* True/False Statements */
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 italic mb-1">
                      * Đánh dấu ĐÚNG hoặc SAI cho từng nhận định sau:
                    </p>
                    {q.statements.map(stmt => {
                      const userVal = userAnswers[q.id]?.[stmt.label];
                      const isCorrect = isRevealed ? userVal === stmt.answer : null;

                      return (
                        <div
                          key={stmt.label}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm transition ${
                            isRevealed
                              ? isCorrect
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <span className="font-bold text-slate-500 shrink-0">{stmt.label})</span>
                            <span><MathRenderer text={stmt.text} /></span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleSelectTF(q.id, stmt.label, true)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                userVal === true
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectTF(q.id, stmt.label, false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                userVal === false
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Sai
                            </button>

                            {isRevealed && (
                              <span className={`ml-2 font-bold text-xs px-2 py-0.5 rounded ${
                                stmt.answer ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                              }`}>
                                Đáp án: {stmt.answer ? 'ĐÚNG' : 'SAI'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation (only shown if isRevealed) */}
                {isRevealed && q.explanation && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-sky-600 dark:text-sky-400 block mb-0.5">Lời giải chi tiết:</span>
                    <MathRenderer text={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Submit button */}
          {!isSubmitted && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Đã trả lời <span className="font-bold text-sky-600">{answeredCount}</span> trên tổng số {questionsToTest.length} câu.
              </p>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Nộp Bài & Xem Điểm Số
              </button>
            </div>
          )}
        </div>
      ) : (
        /* SINGLE QUESTION MODE: TỪNG CÂU MỘT */
        (() => {
          const q = questionsToTest[currentIndex];
          if (!q) return null;
          const isRevealed = isSubmitted || revealedSingleQuestions[q.id];

          return (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                {/* Question Info */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold text-xs">
                      Câu {currentIndex + 1} / {questionsToTest.length}
                    </span>
                    <span className="text-xs text-slate-500">
                      {q.type === 'mcq' ? 'Trắc nghiệm 1 lựa chọn' : 'Đúng / Sai 4 ý'}
                    </span>
                  </div>

                  {!isSubmitted && (
                    <button
                      onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                      className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1 font-medium"
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                    </button>
                  )}
                </div>

                {/* Stem */}
                <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                  <MathRenderer text={q.stem} />
                </div>

                {/* Options */}
                {q.type === 'mcq' ? (
                  <div className="space-y-2.5">
                    {q.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isChosen = userAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correct;

                      let itemStyle = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100';
                      let badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

                      if (!isRevealed) {
                        if (isChosen) {
                          itemStyle = 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500 shadow-sm';
                          badgeStyle = 'bg-sky-600 text-white';
                        }
                      } else {
                        if (isCorrect) {
                          itemStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-medium';
                          badgeStyle = 'bg-emerald-600 text-white';
                        } else if (isChosen && !isCorrect) {
                          itemStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 line-through';
                          badgeStyle = 'bg-rose-600 text-white';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectMCQ(q.id, optIdx)}
                          className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-xs sm:text-sm text-left transition ${itemStyle}`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                            {letter}
                          </span>
                          <span className="flex-1 mt-0.5"><MathRenderer text={opt} /></span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {q.statements.map(stmt => {
                      const userVal = userAnswers[q.id]?.[stmt.label];
                      return (
                        <div
                          key={stmt.label}
                          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <span className="font-bold text-slate-500 shrink-0">{stmt.label})</span>
                            <span><MathRenderer text={stmt.text} /></span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleSelectTF(q.id, stmt.label, true)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                userVal === true ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectTF(q.id, stmt.label, false)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                userVal === false ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Sai
                            </button>
                            {isRevealed && (
                              <span className={`ml-2 font-bold text-xs px-2 py-0.5 rounded ${
                                stmt.answer ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                              }`}>
                                Đáp án: {stmt.answer ? 'ĐÚNG' : 'SAI'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {isRevealed && q.explanation && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-sky-600 dark:text-sky-400 block mb-0.5">Lời giải chi tiết:</span>
                    <MathRenderer text={q.explanation} />
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" /> Câu trước
                  </button>

                  <button
                    onClick={() => setCurrentIndex(i => Math.min(questionsToTest.length - 1, i + 1))}
                    disabled={currentIndex === questionsToTest.length - 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    Câu sau <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bubble Question Palette */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Bảng danh sách câu hỏi:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {questionsToTest.map((item, idx) => {
                    const isCur = idx === currentIndex;
                    const isDone = item.type === 'mcq'
                      ? userAnswers[item.id] !== undefined
                      : Object.keys(userAnswers[item.id] || {}).length === 4;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                          isCur
                            ? 'ring-2 ring-sky-500 bg-sky-600 text-white'
                            : isDone
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
        })()
      )}
    </div>
  );
}
