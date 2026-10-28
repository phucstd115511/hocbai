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
  Sparkles,
  Shield,
  Wrench,
  Globe,
  Grid
} from 'lucide-react';

export default function CongNgheGHKIQuiz({
  allQuestions = [],
  subjects = [],
  onSaveAttempt,
  initialSubjectId = 'sub_congnghe_ghki',
  onSwitchSubject
}) {
  const [activeSubjectId, setActiveSubjectId] = useState(initialSubjectId);

  // Đồng bộ khi prop initialSubjectId thay đổi từ Header
  useEffect(() => {
    if (initialSubjectId && initialSubjectId !== activeSubjectId) {
      setActiveSubjectId(initialSubjectId);
      setUserAnswers({});
      setIsSubmitted(false);
      setRevealedSingleQuestions({});
      setSeconds(0);
      setCurrentIndex(0);
      setIsTimerActive(true);
      setShowPalette(false);
    }
  }, [initialSubjectId]);

  const isGdqp = activeSubjectId === 'sub_gdqp11';
  const isDia = activeSubjectId === 'sub_dia11';

  // Lọc toàn bộ câu hỏi của môn đã chọn (Gộp lại trọn vẹn, không chia vụn vặt)
  const questionsToTest = useMemo(() => {
    return allQuestions.filter(q => {
      if (activeSubjectId === 'sub_congnghe_ghki') {
        return q.subjectId === 'sub_congnghe_ghki' || (q.tags || []).includes('Công Nghệ GHKI');
      }
      if (activeSubjectId === 'sub_gdqp11') {
        return q.subjectId === 'sub_gdqp11' || (q.tags || []).includes('GDQP 11');
      }
      if (activeSubjectId === 'sub_dia11') {
        return q.subjectId === 'sub_dia11' || (q.tags || []).includes('Địa Lí 11');
      }
      return q.subjectId === activeSubjectId;
    });
  }, [allQuestions, activeSubjectId]);

  // Vị trí câu hiện tại khi ở chế độ 'single'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Chế độ hiển thị: 'scroll' (dạng đề thi đầy đủ) | 'single' (từng câu)
  const [displayMode, setDisplayMode] = useState('scroll');
  const [showPalette, setShowPalette] = useState(false);

  // Câu trả lời của học sinh
  const [userAnswers, setUserAnswers] = useState({});

  // Trạng thái nộp bài (mặc định false: CHƯA NỘP, ĐÁP ÁN KHÔNG LỘ SẴN)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [revealedSingleQuestions, setRevealedSingleQuestions] = useState({});

  // Đồng hồ bấm giờ
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const timerRef = useRef(null);
  const hasSavedAttemptRef = useRef(false);

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

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chuyển đổi giữa 2 môn học
  const handleSwitchSubject = (newSubId) => {
    if (newSubId === activeSubjectId) return;
    if (answeredCount > 0 && !isSubmitted) {
      if (!confirm('Bạn đang làm dở bài tập này. Bạn có muốn đổi sang môn học khác không?')) {
        return;
      }
    }
    setActiveSubjectId(newSubId);
    setUserAnswers({});
    setIsSubmitted(false);
    setRevealedSingleQuestions({});
    setSeconds(0);
    setCurrentIndex(0);
    setIsTimerActive(true);
    hasSavedAttemptRef.current = false;
    onSwitchSubject?.(newSubId);
  };

  // Chọn phương án MCQ
  const handleSelectMCQ = (qId, optIdx) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  // Chọn Đúng / Sai
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

  // Trả lời ngắn / Điền số
  const handleSelectShortAnswer = (qId, val) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  // Đếm số câu đã trả lời
  const answeredCount = useMemo(() => {
    let count = 0;
    questionsToTest.forEach(q => {
      if (q.type === 'mcq') {
        if (userAnswers[q.id] !== undefined) count++;
      } else if (q.type === 'truefalse') {
        const tf = userAnswers[q.id] || {};
        if (Object.keys(tf).length === 4) count++;
      } else if (q.type === 'short_answer') {
        const val = userAnswers[q.id];
        if (val !== undefined && String(val).trim() !== '') count++;
      }
    });
    return count;
  }, [questionsToTest, userAnswers]);

  // Nộp bài
  const handleSubmit = () => {
    if (answeredCount < questionsToTest.length) {
      const confirmSubmit = confirm(`Bạn mới làm ${answeredCount}/${questionsToTest.length} câu. Bạn có chắc chắn muốn nộp bài để chấm điểm ngay không?`);
      if (!confirmSubmit) return;
    }
    setIsTimerActive(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Làm lại đề
  const handleReset = () => {
    if (confirm('Làm lại từ đầu? Tất cả các đáp án bạn vừa chọn sẽ được đặt lại.')) {
      setUserAnswers({});
      setIsSubmitted(false);
      setRevealedSingleQuestions({});
      setSeconds(0);
      setIsTimerActive(true);
      setCurrentIndex(0);
      hasSavedAttemptRef.current = false;
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
      } else if (q.type === 'truefalse') {
        const userTf = userAnswers[q.id] || {};
        const res = scoreTrueFalseQuestion(q.statements, userTf, 'standard_thpt');
        totalPoints += res.score;
        if (res.isFullyCorrect) correctCount++;
      } else if (q.type === 'short_answer') {
        const userVal = String(userAnswers[q.id] || '').trim().replace(/,/g, '.');
        const correctVal = String(q.correctAnswer || '').trim().replace(/,/g, '.');
        if (userVal !== '' && userVal === correctVal) {
          totalPoints += 1;
          correctCount++;
        }
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

  // Lưu kết quả làm bài vào lịch sử
  useEffect(() => {
    if (isSubmitted && scoreResult && onSaveAttempt && !hasSavedAttemptRef.current) {
      hasSavedAttemptRef.current = true;
      const wrongQuestionIds = questionsToTest
        .filter(q => {
          if (q.type === 'mcq') return userAnswers[q.id] !== q.correct;
          if (q.type === 'truefalse') {
            const res = scoreTrueFalseQuestion(q.statements, userAnswers[q.id] || {}, 'standard_thpt');
            return !res.isFullyCorrect;
          }
          if (q.type === 'short_answer') {
            const userVal = String(userAnswers[q.id] || '').trim().replace(/,/g, '.');
            const correctVal = String(q.correctAnswer || '').trim().replace(/,/g, '.');
            return userVal !== correctVal;
          }
          return false;
        })
        .map(q => q.id);

      let examId = 'exam_congnghe_ghki';
      let examName = 'Công Nghệ GHKI';
      if (isGdqp) {
        examId = 'exam_gdqp11_ghki';
        examName = 'GDQP&AN 11 GHKI';
      } else if (isDia) {
        examId = 'exam_dia11_ghki';
        examName = 'Địa Lí 11 GHKI';
      }

      onSaveAttempt({
        id: `att_${Date.now()}`,
        examId,
        examName,
        answers: userAnswers,
        score: scoreResult.totalPoints,
        totalMaxScore: scoreResult.maxPoints,
        percentage: scoreResult.percent,
        wrongQuestionIds,
        date: new Date().toISOString(),
        durationSeconds: seconds
      });
    }
  }, [isSubmitted, scoreResult, onSaveAttempt, isGdqp, isDia, questionsToTest, userAnswers, seconds]);

  // Chế độ in đề A4
  if (isPrinting) {
    let printId = 'print_congnghe_ghki';
    let printName = 'ĐỀ CƯƠNG ÔN TẬP KIỂM TRA GIỮA HKI MÔN CÔNG NGHỆ 11';
    let printDesc = 'Trường THPT - Tổ Lí - Công nghệ (Năm học 2026-2027)';
    if (isGdqp) {
      printId = 'print_gdqp11_ghki';
      printName = 'ĐỀ CƯƠNG ÔN TẬP KIỂM TRA GIỮA HKI MÔN GDQP&AN 11';
      printDesc = 'Trường THPT - Bộ môn Giáo dục Quốc phòng và An ninh 11 (Năm học 2026-2027)';
    } else if (isDia) {
      printId = 'print_dia11_ghki';
      printName = 'ĐỀ CƯƠNG ÔN TẬP KIỂM TRA GIỮA HKI MÔN ĐỊA LÍ 11';
      printDesc = 'Trường THPT - Tổ Sử - Địa Lí 11 (Năm học 2026-2027)';
    }

    const fakeExam = {
      id: printId,
      name: printName,
      description: printDesc,
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

  // Tách câu hỏi theo dạng để hiển thị thành từng phần rõ ràng
  const mcqQuestions = questionsToTest.filter(q => q.type === 'mcq');
  const tfQuestions = questionsToTest.filter(q => q.type === 'truefalse');
  const saQuestions = questionsToTest.filter(q => q.type === 'short_answer');

  const scrollToQuestion = (qId) => {
    const el = document.getElementById(`q_${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Thanh chọn Môn học (Gộp gọn gàng theo môn) */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleSwitchSubject('sub_congnghe_ghki')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeSubjectId === 'sub_congnghe_ghki'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 shrink-0" />
          <span>Môn Công Nghệ 11</span>
          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
            activeSubjectId === 'sub_congnghe_ghki' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            93 câu
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_gdqp11')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
            isGdqp
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>Môn GDQP&AN 11</span>
          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
            isGdqp ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            52 câu
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_dia11')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
            isDia
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Môn Địa Lí 11</span>
          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
            isDia ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            51 câu
          </span>
        </button>
      </div>

      {/* 2. Top Banner: Đề thi của môn học */}
      <div className={`p-6 rounded-3xl shadow-lg relative overflow-hidden transition-all ${
        isGdqp 
          ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white'
          : isDia
          ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-rose-700 text-white'
          : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white'
      }`}>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur mb-2.5">
              {isGdqp ? <Shield className="w-3.5 h-3.5" /> : isDia ? <Globe className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              {isGdqp 
                ? 'GDQP&AN 11 • Giữa Học Kì I (2026-2027)' 
                : isDia
                ? 'Địa Lí 11 • Giữa Học Kì I (2026-2027)'
                : 'Công Nghệ 11 (Cơ Khí) • Giữa Học Kì I (2026-2027)'}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {isGdqp 
                ? 'Bài Làm: Đề Cương Ôn Tập GDQP&AN 11' 
                : isDia
                ? 'Bài Làm: Đề Cương Ôn Tập Địa Lí 11'
                : 'Bài Làm: Đề Cương Ôn Tập Công Nghệ 11'}
            </h1>
            <p className="text-xs text-sky-100 mt-1 max-w-xl leading-relaxed">
              {isGdqp
                ? 'Đề thi trọn bộ 52 câu hỏi trắc nghiệm khách quan. Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : isDia
                ? 'Đề thi trọn bộ 51 câu hỏi (35 câu trắc nghiệm nhiều lựa chọn + 8 câu đúng/sai + 8 câu trả lời ngắn). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : 'Đề thi trọn bộ 93 câu hỏi (83 câu trắc nghiệm nhiều lựa chọn + 10 câu đúng/sai 4 ý). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPrinting(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur border border-white/20 transition"
              title="In đề thi giấy A4 để làm bài hoặc phát cho học sinh"
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

      {/* 3. Sticky Progress & Control Bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs sm:text-sm border border-sky-200 dark:border-sky-800">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>{formatTimer(seconds)}</span>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300">
            Tiến độ: <span className="font-bold text-sky-600 dark:text-sky-400">{answeredCount}</span> / {questionsToTest.length} câu
          </div>

          <button
            onClick={() => setShowPalette(!showPalette)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showPalette 
                ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Bảng câu hỏi ({answeredCount}/{questionsToTest.length})</span>
          </button>
        </div>

        {/* View mode & submit toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setDisplayMode('scroll')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                displayMode === 'scroll' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Toàn bộ đề
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

      {/* 4. Collapsible Question Quick Jump Palette */}
      {showPalette && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-sky-600" /> Nhấp vào số câu để nhảy nhanh:
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Đã làm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span> Chưa làm
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1">
            {questionsToTest.map((item, idx) => {
              const isDone = item.type === 'mcq'
                ? userAnswers[item.id] !== undefined
                : Object.keys(userAnswers[item.id] || {}).length === 4;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (displayMode === 'single') {
                      setCurrentIndex(idx);
                    } else {
                      scrollToQuestion(item.id);
                    }
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-extrabold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Result Card (Hiện ra khi nộp bài) */}
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
            Đạt <b>{scoreResult.percent}%</b> • Đúng <b>{scoreResult.correctCount}/{scoreResult.maxPoints}</b> câu • Thời gian: <b>{formatTimer(seconds)}</b>
          </p>
          <p className="text-xs text-slate-400 italic">
            * Toàn bộ đáp án đúng và lời giải chi tiết từng câu đã được hiển thị bên dưới để bạn đối chiếu.
          </p>
        </div>
      )}

      {/* 6. MAIN TEST VIEW */}
      {questionsToTest.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy câu hỏi nào</h3>
        </div>
      ) : displayMode === 'scroll' ? (
        /* SCROLL VIEW: HIỂN THỊ ĐỀ THI TRỌN VẸN THEO CẤU TRÚC PHẦN */
        <div className="space-y-6">
          {/* PHẦN I: TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN */}
          {mcqQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wide">
                    Phần I: Câu trắc nghiệm nhiều phương án lựa chọn
                  </h3>
                  <p className="text-xs text-sky-700 dark:text-sky-300 mt-0.5">
                    Thí sinh trả lời từ câu 1 đến câu {mcqQuestions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-600 text-white">
                  {mcqQuestions.length} câu
                </span>
              </div>

              {mcqQuestions.map((q, idx) => {
                const questionNumber = idx + 1;
                const isUserAnswered = userAnswers[q.id] !== undefined;
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
                          {questionNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Câu {questionNumber}
                        </span>
                        {q.tags && q.tags[2] && (
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            • {q.tags[2]}
                          </span>
                        )}
                      </div>

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

                    {/* Stem */}
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Options */}
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

                    {/* Explanation */}
                    {isRevealed && q.explanation && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-sky-600 dark:text-sky-400 block mb-0.5">Lời giải chi tiết:</span>
                        <MathRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PHẦN II: CÂU TRẮC NGHIỆM ĐÚNG / SAI (NẾU CÓ) */}
          {tfQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
                    Phần II: Câu trắc nghiệm đúng / sai (4 ý)
                  </h3>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                    Thí sinh trả lời từ câu {mcqQuestions.length + 1} đến câu {questionsToTest.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white">
                  {tfQuestions.length} câu
                </span>
              </div>

              {tfQuestions.map((q, idx) => {
                const questionNumber = mcqQuestions.length + idx + 1;
                const isUserAnswered = Object.keys(userAnswers[q.id] || {}).length === 4;
                const isRevealed = isSubmitted || revealedSingleQuestions[q.id];

                return (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition ${
                      isSubmitted
                        ? 'border-slate-200 dark:border-slate-800'
                        : isUserAnswered
                        ? 'border-indigo-300 dark:border-indigo-800 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {questionNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Câu {questionNumber} (Đúng / Sai 4 ý)
                        </span>
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-medium"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>

                    {/* Stem */}
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Statements */}
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400 italic mb-1">
                        * Đánh dấu ĐÚNG hoặc SAI cho từng ý a, b, c, d dưới đây:
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

                    {/* Explanation */}
                    {isRevealed && q.explanation && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Lời giải chi tiết:</span>
                        <MathRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PHẦN III: CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (NẾU CÓ) */}
          {saQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                    Phần III: Câu trắc nghiệm yêu cầu trả lời ngắn
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Thí sinh trả lời từ câu {mcqQuestions.length + tfQuestions.length + 1} đến câu {questionsToTest.length}. Thí sinh tính toán và nhập đáp số vào ô bên dưới.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white">
                  {saQuestions.length} câu
                </span>
              </div>

              {saQuestions.map((q, idx) => {
                const questionNumber = mcqQuestions.length + tfQuestions.length + idx + 1;
                const userVal = userAnswers[q.id] !== undefined ? String(userAnswers[q.id]) : '';
                const isUserAnswered = userVal.trim() !== '';
                const isRevealed = isSubmitted || revealedSingleQuestions[q.id];

                const normUser = userVal.trim().replace(/,/g, '.');
                const normCorrect = String(q.correctAnswer || '').trim().replace(/,/g, '.');
                const isCorrect = isRevealed ? normUser !== '' && normUser === normCorrect : null;

                return (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition ${
                      isSubmitted
                        ? 'border-slate-200 dark:border-slate-800'
                        : isUserAnswered
                        ? 'border-amber-300 dark:border-amber-800 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                          {questionNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Câu {questionNumber} (Trả lời ngắn)
                        </span>
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="text-[11px] text-slate-400 hover:text-amber-600 flex items-center gap-1 font-medium"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>

                    {/* Stem */}
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Input box */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                          Nhập kết quả:
                        </label>
                        <input
                          type="text"
                          disabled={isSubmitted}
                          value={userVal}
                          onChange={(e) => handleSelectShortAnswer(q.id, e.target.value)}
                          placeholder="Ví dụ: 351 hoặc 23,4"
                          className={`w-full sm:w-64 px-3.5 py-2 rounded-xl text-sm font-bold border transition outline-none ${
                            isRevealed
                              ? isCorrect
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-300'
                                : 'bg-rose-50 text-rose-900 border-rose-400 ring-2 ring-rose-300'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20'
                          }`}
                        />
                        {isRevealed && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {isCorrect ? '✓ Chính xác' : '✗ Chưa đúng'}
                            </span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              (Đáp án: <strong className="text-emerald-600">{q.correctAnswer}</strong>)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Explanation */}
                    {isRevealed && q.explanation && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Lời giải chi tiết:</span>
                        <MathRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Submit button */}
          {!isSubmitted && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Đã hoàn thành <span className="font-bold text-sky-600">{answeredCount}</span> / {questionsToTest.length} câu.
              </p>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition inline-flex items-center gap-2"
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
                      {q.type === 'mcq' 
                        ? 'Trắc nghiệm nhiều lựa chọn' 
                        : q.type === 'truefalse'
                        ? 'Đúng / Sai 4 ý'
                        : 'Trả lời ngắn / Điền số'}
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

                {/* Options / Inputs */}
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
                ) : q.type === 'truefalse' ? (
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
                ) : (
                  /* Short answer in single mode */
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Nhập kết quả:
                    </label>
                    {(() => {
                      const userVal = userAnswers[q.id] !== undefined ? String(userAnswers[q.id]) : '';
                      const normUser = userVal.trim().replace(/,/g, '.');
                      const normCorrect = String(q.correctAnswer || '').trim().replace(/,/g, '.');
                      const isCorrect = isRevealed ? normUser !== '' && normUser === normCorrect : null;

                      return (
                        <div className="space-y-3">
                          <input
                            type="text"
                            disabled={isSubmitted}
                            value={userVal}
                            onChange={(e) => handleSelectShortAnswer(q.id, e.target.value)}
                            placeholder="Ví dụ: 351 hoặc 23,4"
                            className={`w-full max-w-sm px-4 py-2.5 rounded-xl text-sm font-bold border transition outline-none ${
                              isRevealed
                                ? isCorrect
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-300'
                                  : 'bg-rose-50 text-rose-900 border-rose-400 ring-2 ring-rose-300'
                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20'
                            }`}
                          />
                          {isRevealed && (
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {isCorrect ? '✓ Chính xác' : '✗ Chưa đúng'}
                              </span>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                (Đáp án: <strong className="text-emerald-600">{q.correctAnswer}</strong>)
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
                    let isDone = false;
                    if (item.type === 'mcq') {
                      isDone = userAnswers[item.id] !== undefined;
                    } else if (item.type === 'truefalse') {
                      isDone = Object.keys(userAnswers[item.id] || {}).length === 4;
                    } else if (item.type === 'short_answer') {
                      const val = userAnswers[item.id];
                      isDone = val !== undefined && String(val).trim() !== '';
                    }

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
