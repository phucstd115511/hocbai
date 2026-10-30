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
      setLockedShortAnswers({});
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

  // Chuyển đổi giữa các môn học
  const handleSwitchSubject = (newSubId) => {
    if (newSubId === activeSubjectId) return;
    if (answeredCount > 0 && !isSubmitted) {
      if (!confirm('Bạn đang làm dở bài tập này. Bạn có muốn đổi sang môn học khác không?')) {
        return;
      }
    }
    setActiveSubjectId(newSubId);
    setUserAnswers({});
    setLockedShortAnswers({});
    setIsSubmitted(false);
    setRevealedSingleQuestions({});
    setSeconds(0);
    setCurrentIndex(0);
    setIsTimerActive(true);
    hasSavedAttemptRef.current = false;
    onSwitchSubject?.(newSubId);
  };

  // Chọn phương án MCQ (Khóa đáp án sau khi đã chọn)
  const handleSelectMCQ = (qId, optIdx) => {
    if (isSubmitted) return;
    if (userAnswers[qId] !== undefined) return; // Đã chọn rồi thì khóa không cho chọn lại
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  // Chọn Đúng / Sai (Khóa từng ý a, b, c, d sau khi đã chọn)
  const handleSelectTF = (qId, stmtLabel, value) => {
    if (isSubmitted) return;
    const current = userAnswers[qId] || {};
    if (current[stmtLabel] !== undefined) return; // Ý này đã chọn rồi thì khóa không cho đổi
    setUserAnswers(prev => {
      const cur = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...cur,
          [stmtLabel]: value
        }
      };
    });
  };

  // Trả lời ngắn / Điền số
  const handleSelectShortAnswer = (qId, val) => {
    if (isSubmitted) return;
    if (lockedShortAnswers[qId]) return; // Đã xác nhận khóa đáp án thì không cho sửa
    setUserAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  // Khóa câu trả lời ngắn khi người dùng bấm "Xác nhận"
  const [lockedShortAnswers, setLockedShortAnswers] = useState({});
  const handleLockShortAnswer = (qId) => {
    if (isSubmitted) return;
    const val = userAnswers[qId];
    if (val !== undefined && String(val).trim() !== '') {
      setLockedShortAnswers(prev => ({ ...prev, [qId]: true }));
    }
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

  // Nộp bài -> Tự động tính điểm, lưu lịch sử, và Reset trạng thái làm bài để làm lại từ đầu
  const handleSubmit = () => {
    if (answeredCount < questionsToTest.length) {
      const confirmSubmit = confirm(`Bạn mới làm ${answeredCount}/${questionsToTest.length} câu. Bạn có chắc chắn muốn nộp bài để xem điểm và đặt lại để luyện tập lại không?`);
      if (!confirmSubmit) return;
    }

    // Tính điểm ngay trước khi reset
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
        const correctVal = String(q.correctAnswer || q.answer || '').trim().replace(/,/g, '.');
        if (userVal !== '' && userVal === correctVal) {
          totalPoints += 1;
          correctCount++;
        }
      }
    });

    const percent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const finalScore = Math.round(totalPoints * 100) / 100;

    // Lưu kết quả vào lịch sử
    if (onSaveAttempt) {
      const wrongQuestionIds = questionsToTest
        .filter(q => {
          if (q.type === 'mcq') return userAnswers[q.id] !== q.correct;
          if (q.type === 'truefalse') {
            const res = scoreTrueFalseQuestion(q.statements, userAnswers[q.id] || {}, 'standard_thpt');
            return !res.isFullyCorrect;
          }
          if (q.type === 'short_answer') {
            const userVal = String(userAnswers[q.id] || '').trim().replace(/,/g, '.');
            const correctVal = String(q.correctAnswer || q.answer || '').trim().replace(/,/g, '.');
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
        score: finalScore,
        totalMaxScore: maxPoints,
        percentage: percent,
        wrongQuestionIds,
        date: new Date().toISOString(),
        durationSeconds: seconds
      });
    }

    // Hiển thị thông báo kết quả chi tiết
    alert(`🎉 ĐÃ NỘP BÀI THÀNH CÔNG!\n\n• Điểm số: ${finalScore}/${maxPoints} điểm\n• Số câu đúng: ${correctCount}/${maxPoints} câu (${percent}%)\n• Thời gian: ${formatTimer(seconds)}\n\nToàn bộ đề thi sẽ được RESET sạch sẽ để bạn bắt đầu lượt làm mới!`);

    // Reset toàn bộ trạng thái đáp án về ban đầu
    setUserAnswers({});
    setLockedShortAnswers({});
    setIsSubmitted(false);
    setRevealedSingleQuestions({});
    setSeconds(0);
    setCurrentIndex(0);
    setIsTimerActive(true);
    hasSavedAttemptRef.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Làm lại đề thủ công
  const handleReset = () => {
    if (confirm('Làm lại từ đầu? Tất cả các đáp án bạn vừa chọn sẽ được đặt lại.')) {
      setUserAnswers({});
      setLockedShortAnswers({});
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
    <div className="space-y-6 max-w-4xl mx-auto font-satoshi text-black dark:text-white">
      {/* 1. Thanh chọn Môn học (Gộp gọn gàng theo môn chuẩn Neo-Brutalist) */}
      <div className="bg-white dark:bg-[#171e19] p-2.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => handleSwitchSubject('sub_congnghe_ghki')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-cabinet font-extrabold border-2 transition-all cursor-pointer ${
            activeSubjectId === 'sub_congnghe_ghki'
              ? 'bg-[#ffe17c] text-black border-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white dark:bg-[#272727] text-black dark:text-white border-black/40 hover:border-black hover:bg-[#ffe17c]/30'
          }`}
        >
          <Wrench className="w-4 h-4 shrink-0" />
          <span>Môn Công Nghệ 11</span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-black ${
            activeSubjectId === 'sub_congnghe_ghki' ? 'bg-black text-[#ffe17c]' : 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white'
          }`}>
            93 câu
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_gdqp11')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-cabinet font-extrabold border-2 transition-all cursor-pointer ${
            isGdqp
              ? 'bg-[#b7c6c2] text-black border-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white dark:bg-[#272727] text-black dark:text-white border-black/40 hover:border-black hover:bg-[#b7c6c2]/30'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>Môn GDQP&AN 11</span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-black ${
            isGdqp ? 'bg-black text-[#b7c6c2]' : 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white'
          }`}>
            52 câu
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_dia11')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-cabinet font-extrabold border-2 transition-all cursor-pointer ${
            isDia
              ? 'bg-[#ffe17c] text-black border-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white dark:bg-[#272727] text-black dark:text-white border-black/40 hover:border-black hover:bg-[#ffe17c]/30'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Môn Địa Lí 11</span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-black ${
            isDia ? 'bg-black text-[#ffe17c]' : 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white'
          }`}>
            51 câu
          </span>
        </button>
      </div>

      {/* 2. Top Banner: Đề thi của môn học Neo-Brutalist */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_#000] relative overflow-hidden transition-all ${
        isGdqp 
          ? 'bg-[#b7c6c2] text-black'
          : isDia
          ? 'bg-[#ffe17c] text-black neo-dot-pattern'
          : 'bg-[#ffe17c] text-black neo-dot-pattern'
      }`}>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-cabinet font-extrabold uppercase border border-black">
              {isGdqp ? <Shield className="w-3.5 h-3.5 text-[#b7c6c2]" /> : isDia ? <Globe className="w-3.5 h-3.5 text-[#ffe17c]" /> : <BookOpen className="w-3.5 h-3.5 text-[#ffe17c]" />}
              {isGdqp 
                ? 'GDQP&AN 11 • Giữa Học Kì I (2026-2027)' 
                : isDia
                ? 'Địa Lí 11 • Giữa Học Kì I (2026-2027)'
                : 'Công Nghệ 11 (Cơ Khí) • Giữa Học Kì I (2026-2027)'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-cabinet font-extrabold tracking-tight uppercase text-black">
              {isGdqp 
                ? 'Bài Làm: Đề Cương Ôn Tập GDQP&AN 11' 
                : isDia
                ? 'Bài Làm: Đề Cương Ôn Tập Địa Lí 11'
                : 'Bài Làm: Đề Cương Ôn Tập Công Nghệ 11'}
            </h1>
            <p className="text-xs sm:text-sm text-black/85 max-w-xl font-medium leading-relaxed">
              {isGdqp
                ? 'Đề thi trọn bộ 52 câu hỏi trắc nghiệm khách quan. Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : isDia
                ? 'Đề thi trọn bộ 51 câu hỏi (35 câu trắc nghiệm nhiều lựa chọn + 8 câu đúng/sai + 8 câu trả lời ngắn). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : 'Đề thi trọn bộ 93 câu hỏi (83 câu trắc nghiệm nhiều lựa chọn + 10 câu đúng/sai 4 ý). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPrinting(true)}
              className="neo-btn bg-white text-black px-4 py-2.5 rounded-xl text-xs font-cabinet font-extrabold uppercase tracking-wide flex items-center gap-1.5 cursor-pointer"
              title="In đề thi giấy A4 để làm bài hoặc phát cho học sinh"
            >
              <Printer className="w-4 h-4" /> In Đề A4
            </button>
            <button
              onClick={handleReset}
              className="neo-btn bg-[#171e19] text-white px-4 py-2.5 rounded-xl text-xs font-cabinet font-extrabold uppercase tracking-wide flex items-center gap-1.5 cursor-pointer"
              title="Đặt lại bài làm"
            >
              <RotateCcw className="w-4 h-4 text-[#ffe17c]" /> Làm Lại
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sticky Progress & Control Bar Neo-Brutalist */}
      <div className="sticky top-16 z-30 bg-white dark:bg-[#171e19] p-3.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffe17c] text-black font-mono font-bold text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <Clock className="w-4 h-4 text-black" />
            <span>{formatTimer(seconds)}</span>
          </div>

          <div className="text-xs font-bold text-black dark:text-white">
            Tiến độ: <span className="text-black bg-[#b7c6c2] px-2 py-0.5 rounded-md border border-black font-extrabold">{answeredCount}</span> / {questionsToTest.length} câu
          </div>

          <button
            onClick={() => setShowPalette(!showPalette)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-black transition cursor-pointer ${
              showPalette 
                ? 'bg-black text-[#ffe17c] shadow-[2px_2px_0px_0px_#000]' 
                : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Bảng câu hỏi ({answeredCount}/{questionsToTest.length})</span>
          </button>
        </div>

        {/* View mode & submit toggle */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border-2 border-black text-xs">
            <button
              onClick={() => setDisplayMode('scroll')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                displayMode === 'scroll' ? 'bg-black text-[#ffe17c]' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Toàn bộ đề
            </button>
            <button
              onClick={() => setDisplayMode('single')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                displayMode === 'single' ? 'bg-black text-[#ffe17c]' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" /> Từng câu
            </button>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              className="neo-btn bg-black text-[#ffe17c] px-4 py-2 rounded-xl text-xs font-cabinet font-extrabold uppercase tracking-wide flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Nộp Bài & Chấm Điểm
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="neo-btn bg-[#ffe17c] text-black px-4 py-2 rounded-xl text-xs font-cabinet font-extrabold uppercase tracking-wide flex items-center gap-2 cursor-pointer"
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
        <div className="bg-[#ffe17c] p-6 sm:p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_#000] text-center space-y-3 neo-dot-pattern">
          <div className="inline-flex p-3 rounded-2xl bg-black text-[#ffe17c] border-2 border-black shadow-[3px_3px_0px_0px_#000] mb-1">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-cabinet font-extrabold uppercase text-black">
            Kết Quả Bài Làm Của Bạn
          </h2>
          <div className="text-5xl font-cabinet font-extrabold text-black">
            {scoreResult.totalPoints} <span className="text-2xl font-bold text-black/70">/ {scoreResult.maxPoints} điểm</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
              Tỉ lệ đúng: {scoreResult.percent}%
            </span>
            <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold border border-black uppercase">
              Số câu chuẩn: {scoreResult.correctCount}/{scoreResult.maxPoints}
            </span>
            <span className="bg-black text-[#ffe17c] px-3 py-1 rounded-full text-xs font-mono font-bold">
              ⏱ {formatTimer(seconds)}
            </span>
          </div>
          <p className="text-xs text-black/80 font-bold italic pt-2">
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
              <div className="p-5 bg-white dark:bg-[#171e19] rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-cabinet font-extrabold text-black dark:text-[#ffe17c] uppercase tracking-wide">
                    Phần I: Câu trắc nghiệm nhiều phương án lựa chọn
                  </h3>
                  <p className="text-xs text-black/75 dark:text-slate-300 mt-0.5 font-medium">
                    Thí sinh trả lời từ câu 1 đến câu {mcqQuestions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.
                  </p>
                </div>
                <span className="text-xs font-cabinet font-extrabold px-3 py-1.5 rounded-lg bg-black text-[#ffe17c] border border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
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
                    className={`bg-white dark:bg-[#171e19] p-5 sm:p-6 rounded-2xl border-2 border-black transition ${
                      isSubmitted
                        ? 'shadow-[4px_4px_0px_0px_#000]'
                        : isUserAnswered
                        ? 'shadow-[4px_4px_0px_0px_#000] ring-2 ring-[#ffe17c]'
                        : 'shadow-[4px_4px_0px_0px_#000]'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2 border-b-2 border-black/10 dark:border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-black text-[#ffe17c] border border-black flex items-center justify-center font-cabinet font-extrabold text-xs shadow-[2px_2px_0px_0px_#000]">
                          {questionNumber}
                        </span>
                        <span className="text-xs font-cabinet font-extrabold uppercase text-black dark:text-white">
                          Câu {questionNumber}
                        </span>
                        {q.tags && q.tags[2] && (
                          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                            • {q.tags[2]}
                          </span>
                        )}
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="text-[11px] text-black dark:text-[#b7c6c2] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>

                    {/* Stem */}
                    <div className="text-sm sm:text-base font-bold text-black dark:text-white leading-relaxed mb-4">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][optIdx];
                        const isChosen = userAnswers[q.id] === optIdx;
                        const isCorrect = optIdx === q.correct;
                        const hasAnswered = isChosen || isRevealed;

                        let itemStyle = 'bg-white dark:bg-[#272727] border-black/60 text-black dark:text-white hover:border-black hover:bg-[#ffe17c]/20';
                        let badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white border-black';

                        if (isChosen) {
                          if (isCorrect) {
                            itemStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-black dark:text-white ring-2 ring-emerald-500';
                            badgeStyle = 'bg-emerald-600 text-white border-black';
                          } else {
                            itemStyle = 'bg-rose-100 dark:bg-rose-950/80 border-black text-rose-900 dark:text-rose-200 shadow-[3px_3px_0px_0px_#000] ring-2 ring-rose-500';
                            badgeStyle = 'bg-rose-600 text-white border-black';
                          }
                        } else if (isRevealed && isCorrect) {
                          itemStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-black dark:text-white';
                          badgeStyle = 'bg-emerald-600 text-white border-black';
                        } else if (userAnswers[q.id] !== undefined && isCorrect) {
                          // Nếu người dùng đã chọn sai, hiển thị phương án đúng màu xanh luôn
                          itemStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                          badgeStyle = 'bg-emerald-600 text-white border-black';
                        }

                        const isLocked = userAnswers[q.id] !== undefined;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleSelectMCQ(q.id, optIdx)}
                            className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-xs sm:text-sm text-left transition ${
                              isLocked ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                            } ${itemStyle}`}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-cabinet font-extrabold text-xs shrink-0 mt-0.5 border ${badgeStyle}`}>
                              {letter}
                            </span>
                            <span className="flex-1 mt-0.5">
                              <MathRenderer text={opt} />
                            </span>
                            {isChosen && isCorrect && (
                              <span className="text-[11px] font-cabinet font-extrabold text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5 flex items-center gap-1 uppercase">
                                <CheckCircle2 className="w-4 h-4" /> Chính xác (+1đ)
                              </span>
                            )}
                            {isChosen && !isCorrect && (
                              <span className="text-[11px] font-cabinet font-extrabold text-rose-700 dark:text-rose-400 shrink-0 mt-0.5 flex items-center gap-1 uppercase">
                                <XCircle className="w-4 h-4" /> Sai rồi
                              </span>
                            )}
                            {!isChosen && userAnswers[q.id] !== undefined && isCorrect && (
                              <span className="text-[11px] font-cabinet font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5 flex items-center gap-1 uppercase">
                                <CheckCircle2 className="w-4 h-4" /> Đáp án đúng
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation (Hiển thị ngay khi người dùng chọn đáp án hoặc nộp bài) */}
                    {(isRevealed || userAnswers[q.id] !== undefined) && q.explanation && (
                      <div className="mt-4 p-4 bg-[#b7c6c2]/30 dark:bg-slate-800 rounded-xl text-xs text-black dark:text-slate-200 border-2 border-black">
                        <span className="font-cabinet font-extrabold text-black dark:text-[#ffe17c] block mb-1 uppercase tracking-wide">Lời giải chi tiết:</span>
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
            <div className="space-y-4 pt-4 border-t-2 border-black">
              <div className="p-5 bg-white dark:bg-[#171e19] rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-cabinet font-extrabold text-black dark:text-[#ffe17c] uppercase tracking-wide">
                    Phần II: Câu trắc nghiệm đúng / sai (4 ý)
                  </h3>
                  <p className="text-xs text-black/75 dark:text-slate-300 mt-0.5 font-medium">
                    Thí sinh trả lời từ câu {mcqQuestions.length + 1} đến câu {questionsToTest.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
                  </p>
                </div>
                <span className="text-xs font-cabinet font-extrabold px-3 py-1.5 rounded-lg bg-black text-[#ffe17c] border border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
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
                        const isAnsweredThisStmt = userVal !== undefined;
                        const isCorrect = isAnsweredThisStmt ? userVal === stmt.answer : null;
                        const showFeedback = isRevealed || isAnsweredThisStmt;

                        return (
                          <div
                            key={stmt.label}
                            className={`p-3.5 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm transition ${
                              showFeedback
                                ? isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-black dark:text-white'
                                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-black dark:text-white'
                                : 'bg-white dark:bg-[#272727] border-black/40 text-black dark:text-white'
                            }`}
                          >
                            <div className="flex items-start gap-2 flex-1">
                              <span className="font-cabinet font-extrabold text-black dark:text-white shrink-0">{stmt.label})</span>
                              <span><MathRenderer text={stmt.text} /></span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
                              <button
                                type="button"
                                disabled={isAnsweredThisStmt}
                                onClick={() => handleSelectTF(q.id, stmt.label, true)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-cabinet font-extrabold transition border-2 flex items-center gap-1 ${
                                  isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                                } ${
                                  userVal === true
                                    ? isCorrect
                                      ? 'bg-emerald-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                      : 'bg-rose-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                    : 'bg-slate-100 dark:bg-slate-700 text-black dark:text-white border-black/40 hover:border-black'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                              </button>

                              <button
                                type="button"
                                disabled={isAnsweredThisStmt}
                                onClick={() => handleSelectTF(q.id, stmt.label, false)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-cabinet font-extrabold transition border-2 flex items-center gap-1 ${
                                  isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                                } ${
                                  userVal === false
                                    ? isCorrect
                                      ? 'bg-emerald-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                      : 'bg-rose-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                    : 'bg-slate-100 dark:bg-slate-700 text-black dark:text-white border-black/40 hover:border-black'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Sai
                              </button>

                              {showFeedback && (
                                <span className={`font-cabinet font-extrabold text-xs px-2.5 py-1 rounded-md border border-black ${
                                  stmt.answer ? 'text-emerald-900 bg-emerald-200' : 'text-rose-900 bg-rose-200'
                                }`}>
                                  {isCorrect ? '✓ Đúng' : `✗ Sai (Đáp án: ${stmt.answer ? 'ĐÚNG' : 'SAI'})`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {(isRevealed || Object.keys(userAnswers[q.id] || {}).length > 0) && q.explanation && (
                      <div className="mt-4 p-4 bg-[#b7c6c2]/30 dark:bg-slate-800 rounded-xl text-xs text-black dark:text-slate-200 border-2 border-black">
                        <span className="font-cabinet font-extrabold text-black dark:text-[#ffe17c] block mb-1 uppercase tracking-wide">Lời giải chi tiết:</span>
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
                const isLocked = lockedShortAnswers[q.id] || isSubmitted;

                const normUser = userVal.trim().replace(/,/g, '.');
                const normCorrect = String(q.correctAnswer || q.answer || '').trim().replace(/,/g, '.');
                const isCorrect = isLocked ? normUser !== '' && normUser === normCorrect : null;
                const showFeedback = isRevealed || isLocked;

                return (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className={`bg-white dark:bg-[#171e19] p-5 sm:p-6 rounded-2xl border-2 border-black transition ${
                      isSubmitted
                        ? 'shadow-[4px_4px_0px_0px_#000]'
                        : isLocked
                        ? 'shadow-[4px_4px_0px_0px_#000] ring-2 ring-[#ffe17c]'
                        : 'shadow-[4px_4px_0px_0px_#000]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b-2 border-black/10 dark:border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-black text-[#ffe17c] border border-black flex items-center justify-center font-cabinet font-extrabold text-xs shadow-[2px_2px_0px_0px_#000]">
                          {questionNumber}
                        </span>
                        <span className="text-xs font-cabinet font-extrabold uppercase text-black dark:text-white">
                          Câu {questionNumber} (Trả lời ngắn)
                        </span>
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="text-[11px] text-black dark:text-[#b7c6c2] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>

                    {/* Stem */}
                    <div className="text-sm sm:text-base font-bold text-black dark:text-white leading-relaxed mb-4">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Input box */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-xs font-cabinet font-extrabold text-black dark:text-white uppercase shrink-0">
                          Nhập kết quả:
                        </label>
                        <input
                          type="text"
                          disabled={isLocked}
                          value={userVal}
                          onChange={(e) => handleSelectShortAnswer(q.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLockShortAnswer(q.id);
                          }}
                          placeholder="Ví dụ: 351 hoặc 23,4"
                          className={`w-full sm:w-64 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition outline-none ${
                            isLocked
                              ? isCorrect
                                ? 'bg-emerald-50 text-black border-black shadow-[2px_2px_0px_0px_#000] ring-2 ring-emerald-400'
                                : 'bg-rose-50 text-black border-black shadow-[2px_2px_0px_0px_#000] ring-2 ring-rose-400'
                              : 'bg-white dark:bg-[#272727] text-black dark:text-white border-black focus:border-[#ffe17c] focus:shadow-[2px_2px_0px_0px_#000]'
                          }`}
                        />
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleLockShortAnswer(q.id)}
                            disabled={!userVal.trim()}
                            className="neo-btn bg-black text-[#ffe17c] px-4 py-2.5 rounded-xl text-xs font-cabinet font-extrabold uppercase disabled:opacity-40 cursor-pointer"
                          >
                            Xác nhận & Khóa
                          </button>
                        )}
                        {showFeedback && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-cabinet font-extrabold px-3 py-1.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] ${
                              isCorrect ? 'bg-emerald-300 text-black' : 'bg-rose-300 text-black'
                            }`}>
                              {isCorrect ? '✓ Chính xác (+1đ)' : `✗ Chưa đúng (Đáp án: ${q.correctAnswer || q.answer})`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Explanation */}
                    {(showFeedback || isRevealed) && q.explanation && (
                      <div className="mt-4 p-4 bg-[#b7c6c2]/30 dark:bg-slate-800 rounded-xl text-xs text-black dark:text-slate-200 border-2 border-black">
                        <span className="font-cabinet font-extrabold text-black dark:text-[#ffe17c] block mb-1 uppercase tracking-wide">Lời giải chi tiết:</span>
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

                      let itemStyle = 'bg-white dark:bg-[#272727] border-black/60 text-black dark:text-white hover:border-black hover:bg-[#ffe17c]/20';
                      let badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white border-black';

                      if (isChosen) {
                        if (isCorrect) {
                          itemStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-black dark:text-white ring-2 ring-emerald-500';
                          badgeStyle = 'bg-emerald-600 text-white border-black';
                        } else {
                          itemStyle = 'bg-rose-100 dark:bg-rose-950/80 border-black text-rose-900 dark:text-rose-200 shadow-[3px_3px_0px_0px_#000] ring-2 ring-rose-500';
                          badgeStyle = 'bg-rose-600 text-white border-black';
                        }
                      } else if (isRevealed && isCorrect) {
                        itemStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-black shadow-[3px_3px_0px_0px_#000] font-bold text-black dark:text-white';
                        badgeStyle = 'bg-emerald-600 text-white border-black';
                      } else if (userAnswers[q.id] !== undefined && isCorrect) {
                        itemStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                        badgeStyle = 'bg-emerald-600 text-white border-black';
                      }

                      const isLocked = userAnswers[q.id] !== undefined;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleSelectMCQ(q.id, optIdx)}
                          className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-xs sm:text-sm text-left transition ${
                            isLocked ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                          } ${itemStyle}`}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-cabinet font-extrabold text-xs shrink-0 mt-0.5 border ${badgeStyle}`}>
                            {letter}
                          </span>
                          <span className="flex-1 mt-0.5"><MathRenderer text={opt} /></span>
                          {isChosen && isCorrect && (
                            <span className="text-[11px] font-cabinet font-extrabold text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5 flex items-center gap-1 uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Chính xác (+1đ)
                            </span>
                          )}
                          {isChosen && !isCorrect && (
                            <span className="text-[11px] font-cabinet font-extrabold text-rose-700 dark:text-rose-400 shrink-0 mt-0.5 flex items-center gap-1 uppercase">
                              <XCircle className="w-4 h-4" /> Sai rồi
                            </span>
                          )}
                          {!isChosen && userAnswers[q.id] !== undefined && isCorrect && (
                            <span className="text-[11px] font-cabinet font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5 flex items-center gap-1 uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Đáp án đúng
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : q.type === 'truefalse' ? (
                  <div className="space-y-2.5">
                    {q.statements.map(stmt => {
                      const userVal = userAnswers[q.id]?.[stmt.label];
                      const isAnsweredThisStmt = userVal !== undefined;
                      const isCorrect = isAnsweredThisStmt ? userVal === stmt.answer : null;
                      const showFeedback = isRevealed || isAnsweredThisStmt;

                      return (
                        <div
                          key={stmt.label}
                          className={`p-3.5 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm transition ${
                            showFeedback
                              ? isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-black dark:text-white'
                                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-black dark:text-white'
                              : 'bg-white dark:bg-[#272727] border-black/40 text-black dark:text-white'
                          }`}
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <span className="font-cabinet font-extrabold text-black dark:text-white shrink-0">{stmt.label})</span>
                            <span><MathRenderer text={stmt.text} /></span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
                            <button
                              type="button"
                              disabled={isAnsweredThisStmt}
                              onClick={() => handleSelectTF(q.id, stmt.label, true)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-cabinet font-extrabold transition border-2 flex items-center gap-1 ${
                                isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                              } ${
                                userVal === true
                                  ? isCorrect
                                    ? 'bg-emerald-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                    : 'bg-rose-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                  : 'bg-slate-100 dark:bg-slate-700 text-black dark:text-white border-black/40 hover:border-black'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                            </button>
                            <button
                              type="button"
                              disabled={isAnsweredThisStmt}
                              onClick={() => handleSelectTF(q.id, stmt.label, false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-cabinet font-extrabold transition border-2 flex items-center gap-1 ${
                                isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                              } ${
                                userVal === false
                                  ? isCorrect
                                    ? 'bg-emerald-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                    : 'bg-rose-600 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                  : 'bg-slate-100 dark:bg-slate-700 text-black dark:text-white border-black/40 hover:border-black'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Sai
                            </button>
                            {showFeedback && (
                              <span className={`font-cabinet font-extrabold text-xs px-2.5 py-1 rounded-md border border-black ${
                                stmt.answer ? 'text-emerald-900 bg-emerald-200' : 'text-rose-900 bg-rose-200'
                              }`}>
                                {isCorrect ? '✓ Đúng' : `✗ Sai (Đáp án: ${stmt.answer ? 'ĐÚNG' : 'SAI'})`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Short answer in single mode */
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-black">
                    <label className="text-xs font-cabinet font-extrabold text-black dark:text-white block uppercase">
                      Nhập kết quả:
                    </label>
                    {(() => {
                      const userVal = userAnswers[q.id] !== undefined ? String(userAnswers[q.id]) : '';
                      const isLocked = lockedShortAnswers[q.id] || isSubmitted;
                      const normUser = userVal.trim().replace(/,/g, '.');
                      const normCorrect = String(q.correctAnswer || q.answer || '').trim().replace(/,/g, '.');
                      const isCorrect = isLocked ? normUser !== '' && normUser === normCorrect : null;
                      const showFeedback = isRevealed || isLocked;

                      return (
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <input
                              type="text"
                              disabled={isLocked}
                              value={userVal}
                              onChange={(e) => handleSelectShortAnswer(q.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLockShortAnswer(q.id);
                              }}
                              placeholder="Ví dụ: 351 hoặc 23,4"
                              className={`w-full max-w-sm px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition outline-none ${
                                isLocked
                                  ? isCorrect
                                    ? 'bg-emerald-50 text-black border-black shadow-[2px_2px_0px_0px_#000] ring-2 ring-emerald-400'
                                    : 'bg-rose-50 text-black border-black shadow-[2px_2px_0px_0px_#000] ring-2 ring-rose-400'
                                  : 'bg-white dark:bg-slate-900 border-black focus:border-[#ffe17c] focus:shadow-[2px_2px_0px_0px_#000]'
                              }`}
                            />
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => handleLockShortAnswer(q.id)}
                                disabled={!userVal.trim()}
                                className="neo-btn bg-black text-[#ffe17c] px-4 py-2.5 rounded-xl text-xs font-cabinet font-extrabold uppercase disabled:opacity-40 cursor-pointer"
                              >
                                Xác nhận & Khóa
                              </button>
                            )}
                          </div>
                          {showFeedback && (
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-cabinet font-extrabold px-3 py-1.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] ${
                                isCorrect ? 'bg-emerald-300 text-black' : 'bg-rose-300 text-black'
                              }`}>
                                {isCorrect ? '✓ Chính xác (+1đ)' : `✗ Chưa đúng (Đáp án: ${q.correctAnswer || q.answer})`}
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
