import React, { useState, useMemo, useEffect, useRef } from 'react';
import MathRenderer from '../common/MathRenderer.jsx';
import PrintView from '../print/PrintView.jsx';
import Modal from '../common/Modal.jsx';
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
  Grid,
  Languages,
  Monitor,
  ChevronDown,
  AlertTriangle,
  Trophy
} from 'lucide-react';

export default function CongNgheGHKIQuiz({
  allQuestions = [],
  subjects = [],
  onSaveAttempt,
  initialSubjectId = 'sub_congnghe_ghki',
  onSwitchSubject
}) {
  const [activeSubjectId, setActiveSubjectId] = useState(initialSubjectId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'single' : 'scroll'));
  const [showPalette, setShowPalette] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [lockedShortAnswers, setLockedShortAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [revealedSingleQuestions, setRevealedSingleQuestions] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isStickyStuck, setIsStickyStuck] = useState(false);

  // Popup xác nhận nộp bài & Popup báo điểm kết quả
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isScoreReportOpen, setIsScoreReportOpen] = useState(false);

  // Hiệu ứng chuyển động thu lại & popup câu hỏi tiếp theo
  const [cardTransitionState, setCardTransitionState] = useState('idle'); // 'idle' | 'collapsing'
  const [autoAdvance, setAutoAdvance] = useState(true);

  const stickyRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const timerRef = useRef(null);
  const hasSavedAttemptRef = useRef(false);

  const isGdqp = activeSubjectId === 'sub_gdqp11';
  const isDia = activeSubjectId === 'sub_dia11';
  const isSu = activeSubjectId === 'sub_su11';
  const isEnglish = activeSubjectId === 'sub_tienganh11';
  const isTinHoc = activeSubjectId === 'sub_tinhoc11';

  const currentSubjectName = isTinHoc
    ? 'Tin Học 11'
    : isEnglish
    ? 'Tiếng Anh 11 (Global Success)'
    : isGdqp
    ? 'GDQP&AN 11'
    : isDia
    ? 'Địa Lí 11'
    : isSu
    ? 'Lịch Sử 11'
    : 'Công Nghệ 11';

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
      if (activeSubjectId === 'sub_su11') {
        return q.subjectId === 'sub_su11' || (q.tags || []).includes('Lịch Sử 11');
      }
      if (activeSubjectId === 'sub_tienganh11') {
        return q.subjectId === 'sub_tienganh11' || (q.tags || []).includes('Tiếng Anh 11') || (q.id || '').startsWith('q_eng_');
      }
      if (activeSubjectId === 'sub_tinhoc11') {
        return q.subjectId === 'sub_tinhoc11' || (q.tags || []).includes('Tin Học 11') || (q.id || '').startsWith('q_tin11_');
      }
      return q.subjectId === activeSubjectId;
    });
  }, [allQuestions, activeSubjectId]);

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  const scheduleNextQuestion = (delay = 700) => {
    if (!autoAdvance) return;
    if (displayMode !== 'single') return;
    clearAutoAdvanceTimer();

    autoAdvanceTimerRef.current = setTimeout(() => {
      // 1. Thu lại mượt mà với GPU composite (card-collapse)
      setCardTransitionState('collapsing');

      // 2. Chuyển sang câu tiếp theo và popup lên (card-popup)
      setTimeout(() => {
        setCurrentIndex(prev => {
          if (prev < questionsToTest.length - 1) {
            return prev + 1;
          }
          return prev;
        });
        setCardTransitionState('idle');
      }, 220);
    }, delay);
  };

  const goToQuestion = (idx) => {
    if (idx === currentIndex) return;
    clearAutoAdvanceTimer();
    setCardTransitionState('collapsing');
    setTimeout(() => {
      setCurrentIndex(idx);
      setCardTransitionState('idle');
    }, 220);
  };

  // Theo dõi trạng thái cuộn để kích hoạt animation mở rộng khi dính (sticky)
  useEffect(() => {
    const handleScroll = () => {
      if (!stickyRef.current) return;
      const rect = stickyRef.current.getBoundingClientRect();
      setIsStickyStuck(rect.top <= 85);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => clearAutoAdvanceTimer();
  }, [currentIndex, activeSubjectId]);

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
    clearAutoAdvanceTimer();
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

  // Chọn phương án MCQ (Khóa đáp án sau khi đã chọn, hiện kết quả ngay, sau đó thu lại và nhảy popup câu tiếp theo)
  const handleSelectMCQ = (qId, optIdx) => {
    if (isSubmitted) return;
    if (userAnswers[qId] !== undefined) return; // Đã chọn rồi thì khóa không cho chọn lại
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));

    const q = questionsToTest.find(item => item.id === qId);
    const isCorrect = q && optIdx === q.correct;
    // Chạm hiện đáp án ngay, đúng thì 750ms thu lại và popup câu mới, sai thì 1050ms để kịp nhìn đáp án chuẩn
    scheduleNextQuestion(isCorrect ? 750 : 1050);
  };

  // Chọn Đúng / Sai (Khóa từng ý a, b, c, d sau khi đã chọn)
  const handleSelectTF = (qId, stmtLabel, value) => {
    if (isSubmitted) return;
    const current = userAnswers[qId] || {};
    if (current[stmtLabel] !== undefined) return; // Ý này đã chọn rồi thì khóa không cho đổi
    const updated = {
      ...current,
      [stmtLabel]: value
    };
    setUserAnswers(prev => ({
      ...prev,
      [qId]: updated
    }));

    const q = questionsToTest.find(item => item.id === qId);
    if (q && q.statements && Object.keys(updated).length === q.statements.length) {
      scheduleNextQuestion(900);
    }
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
  const handleLockShortAnswer = (qId) => {
    if (isSubmitted) return;
    const val = userAnswers[qId];
    if (val !== undefined && String(val).trim() !== '') {
      setLockedShortAnswers(prev => ({ ...prev, [qId]: true }));
      scheduleNextQuestion(900);
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

  // 1. Bấm nút Nộp bài -> Mở Modal Popup xác nhận nộp bài (thay cho alert/confirm mặc định)
  const handleSubmit = () => {
    setIsSubmitConfirmOpen(true);
  };

  // 2. Xác nhận Nộp bài trong Modal -> Chấm điểm, khóa đề, lưu lịch sử và mở Modal Báo điểm
  const handleConfirmSubmit = () => {
    setIsSubmitConfirmOpen(false);
    clearAutoAdvanceTimer();
    setIsTimerActive(false);
    setIsSubmitted(true);
    setIsScoreReportOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Làm lại đề thủ công (từ thanh công cụ hoặc nút trên trang)
  const handleReset = () => {
    if (confirm('Làm lại từ đầu? Tất cả các đáp án bạn vừa chọn sẽ được đặt lại.')) {
      setUserAnswers({});
      setLockedShortAnswers({});
      setIsSubmitted(false);
      setIsScoreReportOpen(false);
      setRevealedSingleQuestions({});
      setSeconds(0);
      setIsTimerActive(true);
      setCurrentIndex(0);
      hasSavedAttemptRef.current = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Làm lại trực tiếp từ Modal Báo Điểm (không cần confirm lần 2)
  const handleRestartFromModal = () => {
    setUserAnswers({});
    setLockedShortAnswers({});
    setIsSubmitted(false);
    setIsScoreReportOpen(false);
    setRevealedSingleQuestions({});
    setSeconds(0);
    setIsTimerActive(true);
    setCurrentIndex(0);
    hasSavedAttemptRef.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const finalScore = Math.round(totalPoints * 100) / 100;
    const scale10Score = maxPoints > 0 ? ((totalPoints / maxPoints) * 10).toFixed(1) : '0.0';
    const unansweredCount = Math.max(0, maxPoints - answeredCount);
    const wrongCount = Math.max(0, maxPoints - correctCount - unansweredCount);

    return {
      totalPoints: finalScore,
      maxPoints,
      percent,
      correctCount,
      wrongCount,
      unansweredCount,
      scale10Score
    };
  }, [isSubmitted, questionsToTest, userAnswers, answeredCount]);

  // Đánh giá xếp loại kết quả
  const evaluation = useMemo(() => {
    if (!scoreResult) return null;
    const p = scoreResult.percent;
    if (p >= 90) {
      return {
        badge: 'Xuất Sắc! 🎉',
        desc: 'Kiến thức cực kỳ vững vàng, sẵn sàng đạt điểm tuyệt đối!',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
      };
    }
    if (p >= 80) {
      return {
        badge: 'Rất Tốt! ⭐',
        desc: 'Nắm chắc kiến thức trọng tâm, chỉ cần chú ý thêm vài chi tiết nhỏ!',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
      };
    }
    if (p >= 65) {
      return {
        badge: 'Khá Tốt! 👍',
        desc: 'Hoàn thành tốt phần cơ bản, hãy rà soát kỹ các câu hỏi vận dụng.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
      };
    }
    if (p >= 50) {
      return {
        badge: 'Đạt Yêu Cầu 📖',
        desc: 'Đã nắm được nền tảng, nên xem lại lời giải chi tiết và luyện tập thêm.',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
      };
    }
    return {
      badge: 'Cần Cố Gắng Thêm 📚',
      desc: 'Hãy xem kỹ các đáp án và phần giải thích chi tiết bên dưới nhé!',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    };
  }, [scoreResult]);

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
      } else if (isSu) {
        examId = 'exam_su11_ghki';
        examName = 'Lịch Sử 11 GHKI';
      } else if (isEnglish) {
        examId = 'exam_tienganh11_ghki';
        examName = 'Tiếng Anh 11 GHKI (Global Success)';
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
  }, [isSubmitted, scoreResult, onSaveAttempt, isGdqp, isDia, isSu, isEnglish, questionsToTest, userAnswers, seconds]);

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
    } else if (isSu) {
      printId = 'print_su11_ghki';
      printName = 'ĐỀ CƯƠNG ÔN TẬP KIỂM TRA GIỮA HKI MÔN LỊCH SỬ 11';
      printDesc = 'Trường THPT - Nhóm Lịch Sử (Năm học 2026-2027)';
    } else if (isEnglish) {
      printId = 'print_tienganh11_ghki';
      printName = 'ĐỀ CƯƠNG ÔN TẬP GIỮA KỲ I - LỚP 11 - GLOBAL SUCCESS';
      printDesc = 'Trường THPT - Tổ Tiếng Anh (Năm học 2026-2027)';
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-[#4A5568] dark:text-[#E2E8F0]">
      {/* 1. Thanh chọn Môn học (Neumorphic Segmented Control) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 neu-inset p-1.5 sm:p-2 rounded-2xl sm:rounded-[28px]">
        <button
          onClick={() => handleSwitchSubject('sub_congnghe_ghki')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-3 rounded-full text-[11px] sm:text-sm font-display font-bold transition-all duration-200 cursor-pointer text-center ${
            activeSubjectId === 'sub_congnghe_ghki'
              ? 'neu-water-surface text-[#FF8800] font-extrabold'
              : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white neu-water-hover'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 truncate">
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FF8800]" />
            <span className="truncate"><span className="hidden md:inline">Môn </span>Công Nghệ 11</span>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
            activeSubjectId === 'sub_congnghe_ghki' ? 'bg-[#FF8800] text-white' : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
          }`}>
            93<span className="hidden sm:inline"> câu</span>
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_gdqp11')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-3 rounded-full text-[11px] sm:text-sm font-display font-bold transition-all duration-200 cursor-pointer text-center ${
            isGdqp
              ? 'neu-water-surface text-[#FF8800] font-extrabold'
              : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white neu-water-hover'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 truncate">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FF8800]" />
            <span className="truncate"><span className="hidden md:inline">Môn </span>GDQP&AN 11</span>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
            isGdqp ? 'bg-[#FF8800] text-white' : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
          }`}>
            52<span className="hidden sm:inline"> câu</span>
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_dia11')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-3 rounded-full text-[11px] sm:text-sm font-display font-bold transition-all duration-200 cursor-pointer text-center ${
            isDia
              ? 'neu-water-surface text-[#FF8800] font-extrabold'
              : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white neu-water-hover'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 truncate">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FF8800]" />
            <span className="truncate"><span className="hidden md:inline">Môn </span>Địa Lí 11</span>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
            isDia ? 'bg-[#FF8800] text-white' : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
          }`}>
            51<span className="hidden sm:inline"> câu</span>
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_su11')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-3 rounded-full text-[11px] sm:text-sm font-display font-bold transition-all duration-200 cursor-pointer text-center ${
            isSu
              ? 'neu-water-surface text-[#FF8800] font-extrabold'
              : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white neu-water-hover'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 truncate">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FF8800]" />
            <span className="truncate"><span className="hidden md:inline">Môn </span>Lịch Sử 11</span>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
            isSu ? 'bg-[#FF8800] text-white' : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
          }`}>
            48<span className="hidden sm:inline"> câu</span>
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_tienganh11')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-3 rounded-full text-[11px] sm:text-sm font-display font-bold transition-all duration-200 cursor-pointer text-center ${
            isEnglish
              ? 'neu-water-surface text-[#FF8800] font-extrabold'
              : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white neu-water-hover'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 truncate">
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FF8800]" />
            <span className="truncate"><span className="hidden md:inline">Môn </span>Tiếng Anh 11</span>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
            isEnglish ? 'bg-[#FF8800] text-white' : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
          }`}>
            90<span className="hidden sm:inline"> câu</span>
          </span>
        </button>

        <button
          onClick={() => handleSwitchSubject('sub_tinhoc11')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-3 rounded-full text-[11px] sm:text-sm font-display font-bold transition-all duration-200 cursor-pointer text-center ${
            isTinHoc
              ? 'neu-water-surface text-[#FF8800] font-extrabold'
              : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white neu-water-hover'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 truncate">
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FF8800]" />
            <span className="truncate"><span className="hidden md:inline">Môn </span>Tin Học 11</span>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
            isTinHoc ? 'bg-[#FF8800] text-white' : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
          }`}>
            69<span className="hidden sm:inline"> câu</span>
          </span>
        </button>
      </div>

      {/* 2. Top Banner: Đề thi môn học Neumorphic */}
      <div className="p-6 sm:p-8 rounded-[32px] neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24] relative overflow-hidden transition-all duration-300">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full neu-inset-sm text-xs font-display font-bold text-[#FF8800]">
              {isTinHoc ? <Monitor className="w-3.5 h-3.5" /> : isEnglish ? <Languages className="w-3.5 h-3.5" /> : isGdqp ? <Shield className="w-3.5 h-3.5" /> : isDia ? <Globe className="w-3.5 h-3.5" /> : isSu ? <BookOpen className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
              {isTinHoc
                ? 'Tin Học 11 (Tin Học Ứng Dụng) • Giữa Học Kì I (2025-2026)'
                : isEnglish
                ? 'Tiếng Anh 11 (Global Success) • Giữa Học Kì I (2026-2027)'
                : isGdqp 
                ? 'GDQP&AN 11 • Giữa Học Kì I (2026-2027)' 
                : isDia
                ? 'Địa Lí 11 • Giữa Học Kì I (2026-2027)'
                : isSu
                ? 'Lịch Sử 11 • Giữa Học Kì I (2026-2027)'
                : 'Công Nghệ 11 (Cơ Khí) • Giữa Học Kì I (2026-2027)'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#2D3748] dark:text-white">
              {isTinHoc
                ? 'Bài Làm: Đề Cương Ôn Tập Tin Học 11'
                : isEnglish
                ? 'Bài Làm: Đề Cương Ôn Tập Tiếng Anh 11'
                : isGdqp 
                ? 'Bài Làm: Đề Cương Ôn Tập GDQP&AN 11' 
                : isDia
                ? 'Bài Làm: Đề Cương Ôn Tập Địa Lí 11'
                : isSu
                ? 'Bài Làm: Đề Cương Ôn Tập Lịch Sử 11'
                : 'Bài Làm: Đề Cương Ôn Tập Công Nghệ 11'}
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] dark:text-[#94A3B8] max-w-xl font-normal leading-relaxed">
              {isTinHoc
                ? 'Đề thi trọn bộ 69 câu hỏi (41 câu trắc nghiệm nhiều lựa chọn + 20 câu đúng/sai 4 ý + 8 câu tính toán nhị phân, logic và màn hình). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : isEnglish
                ? 'Đề thi trọn bộ 90 câu hỏi (Unit 1, 2, 3: Từ vựng, Ngữ pháp, Giao tiếp, Đọc hiểu & Viết câu Global Success). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : isGdqp
                ? 'Đề thi trọn bộ 52 câu hỏi trắc nghiệm khách quan. Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : isDia
                ? 'Đề thi trọn bộ 51 câu hỏi (35 câu trắc nghiệm nhiều lựa chọn + 8 câu đúng/sai + 8 câu trả lời ngắn). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : isSu
                ? 'Đề thi trọn bộ 48 câu hỏi (40 câu trắc nghiệm nhiều lựa chọn + 8 câu đúng/sai 4 ý - Chủ đề 1 & Chủ đề 2). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'
                : 'Đề thi trọn bộ 93 câu hỏi (83 câu trắc nghiệm nhiều lựa chọn + 10 câu đúng/sai 4 ý). Toàn bộ đáp án được ẩn sẵn để bạn tự làm bài, bấm Nộp bài để xem điểm số cùng lời giải chi tiết.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPrinting(true)}
              className="neu-btn px-4 py-2.5 rounded-2xl text-xs font-display font-bold flex items-center gap-1.5 cursor-pointer text-[#4A5568] dark:text-[#E2E8F0]"
              title="In đề thi giấy A4 để làm bài hoặc phát cho học sinh"
            >
              <Printer className="w-4 h-4 text-[#FF8800]" /> In Đề A4
            </button>
            <button
              onClick={handleReset}
              className="neu-btn px-4 py-2.5 rounded-2xl text-xs font-display font-bold flex items-center gap-1.5 cursor-pointer text-[#FF8800]"
              title="Đặt lại bài làm"
            >
              <RotateCcw className="w-4 h-4" /> Làm Lại
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sticky Progress & Control Bar Neumorphic with Locked Expansion Animation */}
      <div 
        ref={stickyRef}
        className={`sticky top-20 z-30 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl neu-extruded transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full overflow-hidden ${
          isStickyStuck 
            ? 'bg-[#EBECF0]/95 dark:bg-[#1A1E24]/95 shadow-[0_12px_28px_rgb(163,177,198,0.45)] dark:shadow-[0_12px_28px_rgb(0,0,0,0.7)] ring-1 ring-[#FF8800]/25' 
            : 'bg-[#EBECF0]/90 dark:bg-[#1A1E24]/90 shadow-[0_8px_16px_rgb(163,177,198,0.35)] dark:shadow-[0_8px_16px_rgb(0,0,0,0.5)]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-2.5 w-full max-w-full">
          {/* Row 1 on mobile: Clock, Progress & Question Palette button spread out evenly */}
          <div className="flex items-center gap-1.5 sm:gap-3 w-full md:w-auto">
            {/* Clock */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl neu-inset-sm text-[#FF8800] font-mono font-bold text-xs sm:text-sm shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{formatTimer(seconds)}</span>
            </div>

            {/* Progress */}
            <div className="neu-inset-sm px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#4A5568] dark:text-[#E2E8F0] shrink-0">
              <span className="hidden sm:inline">Tiến độ: </span>
              <span className="text-[#FF8800] font-extrabold">{answeredCount}</span>/{questionsToTest.length} <span className="hidden sm:inline">câu</span>
            </div>

            {/* Question Palette Button: expands to fill all remaining right space smoothly */}
            <button
              onClick={() => setShowPalette(!showPalette)}
              className={`flex-1 min-w-0 md:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                showPalette 
                  ? 'neu-inset-sm text-[#FF8800]' 
                  : 'neu-btn text-[#4A5568] dark:text-[#E2E8F0] hover:text-[#FF8800]'
              } ${isStickyStuck ? 'ring-1 ring-[#FF8800]/30 shadow-sm' : ''}`}
            >
              <Grid className="w-3.5 h-3.5 text-[#FF8800] shrink-0" />
              <span className="truncate">Bảng câu hỏi</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#718096] transition-transform duration-300 shrink-0 ${showPalette ? 'rotate-180 text-[#FF8800]' : ''}`} />
            </button>
          </div>

          {/* Row 2 on mobile: View mode & Submit toggle spread out evenly */}
          <div className="flex items-center gap-1.5 sm:gap-3 w-full md:w-auto">
            <div className="flex neu-inset p-1 rounded-xl text-xs gap-1 shrink-0">
              <button
                onClick={() => setDisplayMode('scroll')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg font-bold transition duration-200 cursor-pointer ${
                  displayMode === 'scroll' 
                    ? 'neu-extruded text-[#FF8800]' 
                    : 'text-[#718096] dark:text-[#94A3B8]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Toàn bộ đề</span><span className="sm:hidden">Tất cả</span>
              </button>
              <button
                onClick={() => setDisplayMode('single')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg font-bold transition duration-200 cursor-pointer ${
                  displayMode === 'single' 
                    ? 'neu-extruded text-[#FF8800]' 
                    : 'text-[#718096] dark:text-[#94A3B8]'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" /> <span>Từng câu</span>
              </button>
            </div>

            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                className="flex-1 min-w-0 md:flex-initial neu-btn-primary px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs uppercase tracking-tight sm:tracking-wide flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all duration-300 shrink"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  <span className="sm:hidden">Nộp Bài</span>
                  <span className="hidden sm:inline">Nộp Bài & Chấm Điểm</span>
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 flex-1 min-w-0 md:flex-initial">
                <button
                  onClick={() => setIsScoreReportOpen(true)}
                  className="flex-1 md:flex-initial neu-btn-primary px-2 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-display font-bold flex items-center justify-center gap-1 cursor-pointer transition shrink shadow-[0_2px_8px_rgba(255,136,0,0.35)]"
                  title="Xem lại bảng điểm chi tiết"
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    <span className="sm:hidden">Bảng Điểm</span>
                    <span className="hidden sm:inline">Bảng Điểm</span>
                  </span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 md:flex-initial neu-btn px-2 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-display font-bold text-[#FF8800] hover:text-[#e07700] flex items-center justify-center gap-1 cursor-pointer transition shrink"
                  title="Làm lại đề này"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Làm Lại</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Collapsible Question Quick Jump Palette */}
      {showPalette && (
        <div className="neu-inset p-5 rounded-[28px] animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-[#2D3748] dark:text-white flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-[#FF8800]" /> Nhấp vào số câu để nhảy nhanh:
            </span>
            <div className="flex items-center gap-3 text-[11px] text-[#718096] dark:text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8800] inline-block"></span> Đã làm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-slate-600 inline-block"></span> Chưa làm
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
            {questionsToTest.map((item, idx) => {
              const isDone = item.type === 'mcq'
                ? userAnswers[item.id] !== undefined
                : item.type === 'truefalse'
                ? Object.keys(userAnswers[item.id] || {}).length === 4
                : userAnswers[item.id] !== undefined && String(userAnswers[item.id]).trim() !== '';

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
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isDone
                      ? 'neu-inset-sm text-[#FF8800] font-extrabold'
                      : 'neu-extruded text-[#718096] dark:text-[#94A3B8] hover:neu-extruded-sm hover:text-[#2D3748] dark:hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}



      {/* 6. MAIN TEST VIEW */}
      {questionsToTest.length === 0 ? (
        <div className="neu-card p-12 text-center rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24]">
          <HelpCircle className="w-12 h-12 text-[#A0AEC0] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#718096] dark:text-[#94A3B8]">Không tìm thấy câu hỏi nào</h3>
        </div>
      ) : displayMode === 'scroll' ? (
        /* SCROLL VIEW: HIỂN THỊ ĐỀ THI TRỌN VẸN THEO CẤU TRÚC PHẦN */
        <div className="space-y-6">
          {/* PHẦN I: TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN */}
          {mcqQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white uppercase tracking-wide">
                    Phần I: Câu trắc nghiệm nhiều phương án lựa chọn
                  </h3>
                  <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-0.5 font-normal">
                    Thí sinh trả lời từ câu 1 đến câu {mcqQuestions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.
                  </p>
                </div>
                <span className="text-xs font-display font-extrabold px-3 py-1.5 rounded-full neu-inset-sm text-[#FF8800] shrink-0">
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
                    className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] transition-all duration-300"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl neu-inset-sm flex items-center justify-center font-display font-extrabold text-xs text-[#FF8800]">
                          {questionNumber}
                        </span>
                        <span className="text-xs font-display font-bold uppercase text-[#2D3748] dark:text-white">
                          Câu {questionNumber}
                        </span>
                        {q.tags && q.tags[2] && (
                          <span className="text-[11px] font-medium text-[#718096] dark:text-[#94A3B8] hidden sm:inline">
                            • {q.tags[2]}
                          </span>
                        )}
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="neu-btn px-3 py-1.5 rounded-xl text-[11px] text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#FF8800]" />}
                          {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>

                    {/* Stem */}
                    <div className="text-sm sm:text-base font-medium text-[#2D3748] dark:text-white leading-relaxed mb-5">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {q.options.map((opt, optIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][optIdx];
                        const isChosen = userAnswers[q.id] === optIdx;
                        const isCorrect = optIdx === q.correct;

                        let itemStyle = 'neu-extruded text-[#4A5568] dark:text-[#E2E8F0] neu-water-hover active:neu-inset';
                        let badgeStyle = 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]';

                        if (isChosen) {
                          if (isCorrect) {
                            itemStyle = 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#EBECF0] dark:ring-offset-[#1A1E24] font-bold';
                            badgeStyle = 'bg-emerald-500 text-white';
                          } else {
                            itemStyle = 'neu-inset text-rose-800 dark:text-rose-300 ring-2 ring-rose-500 ring-offset-2 ring-offset-[#EBECF0] dark:ring-offset-[#1A1E24]';
                            badgeStyle = 'bg-rose-500 text-white';
                          }
                        } else if (isRevealed && isCorrect) {
                          itemStyle = 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#EBECF0] dark:ring-offset-[#1A1E24] font-bold';
                          badgeStyle = 'bg-emerald-500 text-white';
                        } else if (userAnswers[q.id] !== undefined && isCorrect) {
                          itemStyle = 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-[#EBECF0] dark:ring-offset-[#1A1E24] font-bold';
                          badgeStyle = 'bg-emerald-500 text-white';
                        }

                        const isLocked = userAnswers[q.id] !== undefined;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleSelectMCQ(q.id, optIdx)}
                            className={`w-full flex items-start gap-3.5 p-4 rounded-2xl text-xs sm:text-sm text-left transition-[transform,background-color,border-color,box-shadow] duration-200 ${
                              isLocked ? 'cursor-not-allowed opacity-95' : 'cursor-pointer active:scale-[0.99]'
                            } ${isChosen ? 'neu-option-pop ' : ''}${itemStyle}`}
                          >
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-extrabold text-xs shrink-0 mt-0.5 ${badgeStyle}`}>
                              {letter}
                            </span>
                            <span className="flex-1 mt-1 leading-relaxed">
                              <MathRenderer text={opt} />
                            </span>
                            {isChosen && isCorrect && (
                              <span className="text-[11px] font-display font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0 mt-1 flex items-center gap-1 uppercase">
                                <CheckCircle2 className="w-4 h-4" /> Đúng (+1đ)
                              </span>
                            )}
                            {isChosen && !isCorrect && (
                              <span className="text-[11px] font-display font-extrabold text-rose-600 dark:text-rose-400 shrink-0 mt-1 flex items-center gap-1 uppercase">
                                <XCircle className="w-4 h-4" /> Sai rồi
                              </span>
                            )}
                            {!isChosen && userAnswers[q.id] !== undefined && isCorrect && (
                              <span className="text-[11px] font-display font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0 mt-1 flex items-center gap-1 uppercase">
                                <CheckCircle2 className="w-4 h-4" /> Đáp án đúng
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {(isRevealed || userAnswers[q.id] !== undefined) && q.explanation && (
                      <div className="mt-4 p-4 sm:p-5 neu-inset rounded-2xl text-xs text-[#4A5568] dark:text-[#E2E8F0]">
                        <span className="font-display font-extrabold text-[#FF8800] block mb-1 uppercase tracking-wide">
                          Lời giải chi tiết:
                        </span>
                        <div className="leading-relaxed">
                          <MathRenderer text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PHẦN II: CÂU TRẮC NGHIỆM ĐÚNG / SAI (NẾU CÓ) */}
          {tfQuestions.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="p-5 rounded-2xl neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white uppercase tracking-wide">
                    Phần II: Câu trắc nghiệm đúng / sai (4 ý)
                  </h3>
                  <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-0.5 font-normal">
                    Thí sinh trả lời từ câu {mcqQuestions.length + 1} đến câu {questionsToTest.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
                  </p>
                </div>
                <span className="text-xs font-display font-extrabold px-3 py-1.5 rounded-full neu-inset-sm text-[#FF8800] shrink-0">
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
                    className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl neu-inset-sm flex items-center justify-center font-display font-extrabold text-xs text-[#FF8800]">
                          {questionNumber}
                        </span>
                        <span className="text-xs font-display font-bold uppercase text-[#2D3748] dark:text-white">
                          Câu {questionNumber} (Đúng / Sai 4 ý)
                        </span>
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="neu-btn px-3 py-1.5 rounded-xl text-[11px] text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#FF8800]" />}
                          {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>

                    {/* Stem */}
                    <div className="text-sm sm:text-base font-medium text-[#2D3748] dark:text-white leading-relaxed mb-4">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Statements */}
                    <div className="space-y-3">
                      <p className="text-[11px] text-[#718096] dark:text-[#94A3B8] italic mb-1">
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
                            className={`p-4 rounded-2xl neu-inset-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm transition ${
                              showFeedback
                                ? isCorrect
                                  ? 'ring-2 ring-emerald-500/60'
                                  : 'ring-2 ring-rose-500/60'
                                : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5 flex-1">
                              <span className="font-display font-extrabold text-[#2D3748] dark:text-white shrink-0 mt-0.5">{stmt.label})</span>
                              <span className="leading-relaxed"><MathRenderer text={stmt.text} /></span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
                              <button
                                type="button"
                                disabled={isAnsweredThisStmt}
                                onClick={() => handleSelectTF(q.id, stmt.label, true)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 ${
                                  isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                                } ${
                                  userVal === true
                                    ? isCorrect
                                      ? 'neu-inset text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                                      : 'neu-inset text-rose-700 dark:text-rose-300 ring-2 ring-rose-500'
                                    : 'neu-btn text-[#4A5568] dark:text-[#E2E8F0]'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                              </button>

                              <button
                                type="button"
                                disabled={isAnsweredThisStmt}
                                onClick={() => handleSelectTF(q.id, stmt.label, false)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 ${
                                  isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                                } ${
                                  userVal === false
                                    ? isCorrect
                                      ? 'neu-inset text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                                      : 'neu-inset text-rose-700 dark:text-rose-300 ring-2 ring-rose-500'
                                    : 'neu-btn text-[#4A5568] dark:text-[#E2E8F0]'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Sai
                              </button>

                              {showFeedback && (
                                <span className={`font-display font-bold text-xs px-3 py-1 rounded-full neu-inset-sm ${
                                  stmt.answer ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
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
                      <div className="mt-4 p-4 sm:p-5 neu-inset rounded-2xl text-xs text-[#4A5568] dark:text-[#E2E8F0]">
                        <span className="font-display font-extrabold text-[#FF8800] block mb-1 uppercase tracking-wide">Lời giải chi tiết:</span>
                        <div className="leading-relaxed">
                          <MathRenderer text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PHẦN III: CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (NẾU CÓ) */}
          {saQuestions.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="p-5 rounded-2xl neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white uppercase tracking-wide">
                    Phần III: Câu trắc nghiệm yêu cầu trả lời ngắn
                  </h3>
                  <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-0.5 font-normal">
                    Thí sinh trả lời từ câu {mcqQuestions.length + tfQuestions.length + 1} đến câu {questionsToTest.length}. Thí sinh tính toán và nhập đáp số vào ô bên dưới.
                  </p>
                </div>
                <span className="text-xs font-display font-extrabold px-3 py-1.5 rounded-full neu-inset-sm text-[#FF8800] shrink-0">
                  {saQuestions.length} câu
                </span>
              </div>

              {saQuestions.map((q, idx) => {
                const questionNumber = mcqQuestions.length + tfQuestions.length + idx + 1;
                const isRevealed = isSubmitted || revealedSingleQuestions[q.id];
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
                    className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl neu-inset-sm flex items-center justify-center font-display font-extrabold text-xs text-[#FF8800]">
                          {questionNumber}
                        </span>
                        <span className="text-xs font-display font-bold uppercase text-[#2D3748] dark:text-white">
                          Câu {questionNumber} (Trả lời ngắn)
                        </span>
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="neu-btn px-3 py-1.5 rounded-xl text-[11px] text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#FF8800]" />}
                          {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>

                    {/* Stem */}
                    <div className="text-sm sm:text-base font-medium text-[#2D3748] dark:text-white leading-relaxed mb-4">
                      <MathRenderer text={q.stem} />
                    </div>

                    {/* Input box */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-xs font-display font-bold text-[#2D3748] dark:text-white uppercase shrink-0">
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
                          className={`w-full sm:w-64 px-4 py-2.5 rounded-2xl text-sm font-bold transition outline-none ${
                            isLocked
                              ? isCorrect
                                ? 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500 font-bold'
                                : 'neu-inset text-rose-800 dark:text-rose-300 ring-2 ring-rose-500'
                              : 'neu-input'
                          }`}
                        />
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleLockShortAnswer(q.id)}
                            disabled={!userVal.trim()}
                            className="neu-btn-primary px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase disabled:opacity-40 cursor-pointer"
                          >
                            Xác nhận & Khóa
                          </button>
                        )}
                        {showFeedback && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-display font-bold px-3 py-1.5 rounded-full neu-inset-sm ${
                              isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                            }`}>
                              {isCorrect ? '✓ Chính xác (+1đ)' : `✗ Chưa đúng (Đáp án: ${q.correctAnswer || q.answer})`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Explanation */}
                    {(showFeedback || isRevealed) && q.explanation && (
                      <div className="mt-4 p-4 sm:p-5 neu-inset rounded-2xl text-xs text-[#4A5568] dark:text-[#E2E8F0]">
                        <span className="font-display font-extrabold text-[#FF8800] block mb-1 uppercase tracking-wide">Lời giải chi tiết:</span>
                        <div className="leading-relaxed">
                          <MathRenderer text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Submit button */}
          {!isSubmitted && (
            <div className="p-8 neu-card rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] text-center space-y-3">
              <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
                Đã hoàn thành <span className="font-extrabold text-[#FF8800]">{answeredCount}</span> / {questionsToTest.length} câu.
              </p>
              <button
                onClick={handleSubmit}
                className="neu-btn-primary px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-[6px_6px_14px_rgba(255,136,0,0.35),-6px_-6px_14px_rgba(255,255,255,0.7)]"
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
              <div 
                key={q.id}
                className={`neu-card p-6 sm:p-8 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-5 transition-all duration-300 ${
                  cardTransitionState === 'collapsing'
                    ? 'neu-card-collapse pointer-events-none'
                    : 'neu-card-popup'
                }`}
              >
                {/* Question Info */}
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full neu-inset-sm text-[#FF8800] font-display font-bold text-xs">
                      Câu {currentIndex + 1} / {questionsToTest.length}
                    </span>
                    <span className="text-xs font-medium text-[#718096] dark:text-[#94A3B8]">
                      {q.type === 'mcq' 
                        ? 'Trắc nghiệm nhiều lựa chọn' 
                        : q.type === 'truefalse'
                        ? 'Đúng / Sai 4 ý'
                        : 'Trả lời ngắn / Điền số'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAutoAdvance(prev => !prev);
                        clearAutoAdvanceTimer();
                      }}
                      title={autoAdvance ? 'Đang bật tự động nhảy câu tiếp theo sau khi chọn' : 'Đang tắt tự động nhảy câu'}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        autoAdvance 
                          ? 'neu-inset-sm text-[#FF8800]' 
                          : 'neu-btn text-[#718096] dark:text-[#94A3B8]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FF8800]" />
                      <span className="text-[11px] hidden xs:inline">{autoAdvance ? 'Tự nhảy câu: BẬT' : 'Tự nhảy câu: TẮT'}</span>
                    </button>

                    {!isSubmitted && (
                      <button
                        onClick={() => {
                          clearAutoAdvanceTimer();
                          setRevealedSingleQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }));
                        }}
                        className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] flex items-center gap-1 cursor-pointer"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#FF8800]" />}
                        {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stem */}
                <div className="text-sm sm:text-base font-medium text-[#2D3748] dark:text-white leading-relaxed">
                  <MathRenderer text={q.stem} />
                </div>

                {/* Options / Inputs */}
                {q.type === 'mcq' ? (
                  <div className="space-y-3">
                    {q.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isChosen = userAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correct;

                      let itemStyle = 'neu-extruded text-[#4A5568] dark:text-[#E2E8F0] neu-water-hover active:neu-inset';
                      let badgeStyle = 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]';

                      if (isChosen) {
                        if (isCorrect) {
                          itemStyle = 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500 font-bold';
                          badgeStyle = 'bg-emerald-500 text-white';
                        } else {
                          itemStyle = 'neu-inset text-rose-800 dark:text-rose-300 ring-2 ring-rose-500';
                          badgeStyle = 'bg-rose-500 text-white';
                        }
                      } else if (isRevealed && isCorrect) {
                        itemStyle = 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500 font-bold';
                        badgeStyle = 'bg-emerald-500 text-white';
                      } else if (userAnswers[q.id] !== undefined && isCorrect) {
                        itemStyle = 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/70 font-bold';
                        badgeStyle = 'bg-emerald-500 text-white';
                      }

                      const isLocked = userAnswers[q.id] !== undefined;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleSelectMCQ(q.id, optIdx)}
                          className={`w-full flex items-start gap-3.5 p-4 rounded-2xl text-xs sm:text-sm text-left transition-[transform,background-color,border-color,box-shadow] duration-200 ${
                            isLocked ? 'cursor-not-allowed opacity-95' : 'cursor-pointer active:scale-[0.99]'
                          } ${isChosen ? 'neu-option-pop ' : ''}${itemStyle}`}
                        >
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-extrabold text-xs shrink-0 mt-0.5 ${badgeStyle}`}>
                            {letter}
                          </span>
                          <span className="flex-1 mt-1 leading-relaxed"><MathRenderer text={opt} /></span>
                          {isChosen && isCorrect && (
                            <span className="text-[11px] font-display font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0 mt-1 flex items-center gap-1 uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Đúng (+1đ)
                            </span>
                          )}
                          {isChosen && !isCorrect && (
                            <span className="text-[11px] font-display font-extrabold text-rose-600 dark:text-rose-400 shrink-0 mt-1 flex items-center gap-1 uppercase">
                              <XCircle className="w-4 h-4" /> Sai rồi
                            </span>
                          )}
                          {!isChosen && userAnswers[q.id] !== undefined && isCorrect && (
                            <span className="text-[11px] font-display font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0 mt-1 flex items-center gap-1 uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Đáp án đúng
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : q.type === 'truefalse' ? (
                  <div className="space-y-3">
                    {q.statements.map(stmt => {
                      const userVal = userAnswers[q.id]?.[stmt.label];
                      const isAnsweredThisStmt = userVal !== undefined;
                      const isCorrect = isAnsweredThisStmt ? userVal === stmt.answer : null;
                      const showFeedback = isRevealed || isAnsweredThisStmt;

                      return (
                        <div
                          key={stmt.label}
                          className={`p-4 rounded-2xl neu-inset-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm transition ${
                            showFeedback
                              ? isCorrect
                                ? 'ring-2 ring-emerald-500/60'
                                : 'ring-2 ring-rose-500/60'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            <span className="font-display font-extrabold text-[#2D3748] dark:text-white shrink-0 mt-0.5">{stmt.label})</span>
                            <span className="leading-relaxed"><MathRenderer text={stmt.text} /></span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
                            <button
                              type="button"
                              disabled={isAnsweredThisStmt}
                              onClick={() => handleSelectTF(q.id, stmt.label, true)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 ${
                                isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                              } ${
                                userVal === true
                                  ? isCorrect
                                    ? 'neu-inset text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                                    : 'neu-inset text-rose-700 dark:text-rose-300 ring-2 ring-rose-500'
                                  : 'neu-btn text-[#4A5568] dark:text-[#E2E8F0]'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                            </button>
                            <button
                              type="button"
                              disabled={isAnsweredThisStmt}
                              onClick={() => handleSelectTF(q.id, stmt.label, false)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 ${
                                isAnsweredThisStmt ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                              } ${
                                userVal === false
                                  ? isCorrect
                                    ? 'neu-inset text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                                    : 'neu-inset text-rose-700 dark:text-rose-300 ring-2 ring-rose-500'
                                  : 'neu-btn text-[#4A5568] dark:text-[#E2E8F0]'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Sai
                            </button>
                            {showFeedback && (
                              <span className={`font-display font-bold text-xs px-3 py-1 rounded-full neu-inset-sm ${
                                stmt.answer ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
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
                  <div className="space-y-3 p-5 neu-inset rounded-2xl">
                    <label className="text-xs font-display font-bold text-[#2D3748] dark:text-white block uppercase">
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
                              className={`w-full max-w-sm px-4 py-2.5 rounded-2xl text-sm font-bold transition outline-none ${
                                isLocked
                                  ? isCorrect
                                    ? 'neu-inset text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500 font-bold'
                                    : 'neu-inset text-rose-800 dark:text-rose-300 ring-2 ring-rose-500'
                                  : 'neu-input'
                              }`}
                            />
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => handleLockShortAnswer(q.id)}
                                disabled={!userVal.trim()}
                                className="neu-btn-primary px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase disabled:opacity-40 cursor-pointer"
                              >
                                Xác nhận & Khóa
                              </button>
                            )}
                          </div>
                          {showFeedback && (
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-display font-bold px-3 py-1.5 rounded-full neu-inset-sm ${
                                isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
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
                  <div className="p-4 neu-inset rounded-2xl text-xs text-[#4A5568] dark:text-[#E2E8F0]">
                    <span className="font-display font-extrabold text-[#FF8800] block mb-1 uppercase tracking-wide">
                      Lời giải chi tiết:
                    </span>
                    <div className="leading-relaxed">
                      <MathRenderer text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>

              {/* Bubble Question Palette in Single Mode */}
              <div className="neu-inset p-5 rounded-[28px]">
                <div className="text-xs font-bold text-[#2D3748] dark:text-white mb-3">
                  Bảng danh sách câu hỏi:
                </div>
                <div className="flex flex-wrap gap-2">
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
                        onClick={() => goToQuestion(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isCur
                            ? 'neu-inset text-[#FF8800] ring-2 ring-[#FF8800] font-extrabold'
                            : isDone
                            ? 'neu-inset-sm text-[#FF8800]'
                            : 'neu-extruded text-[#718096] dark:text-[#94A3B8] hover:neu-extruded-sm hover:text-[#2D3748] dark:hover:text-white'
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

      {/* ======================================================== */}
      {/* POPUP 1: XÁC NHẬN NỘP BÀI THI                            */}
      {/* ======================================================== */}
      <Modal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        title="Xác nhận nộp bài thi"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 sm:space-y-4 text-[#4A5568] dark:text-[#E2E8F0]">
          {/* Header icon & Subject name */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl neu-inset flex items-center justify-center text-[#FF8800] mb-1.5">
              <Send className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_8px_rgba(255,136,0,0.4)]" />
            </div>
            <h4 className="text-sm sm:text-base font-display font-extrabold text-[#2D3748] dark:text-white">
              {currentSubjectName}
            </h4>
            <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
              Thời gian đã làm: <span className="font-mono font-bold text-[#FF8800]">{formatTimer(seconds)}</span>
            </p>
          </div>

          {/* Progress stats card */}
          <div className="neu-inset p-3 sm:p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#718096] dark:text-[#94A3B8]">Tiến độ câu hỏi:</span>
              <span className="text-[#FF8800] font-extrabold">
                {answeredCount}/{questionsToTest.length} câu ({questionsToTest.length > 0 ? Math.round((answeredCount / questionsToTest.length) * 100) : 0}%)
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#D1D9E6] dark:bg-[#12151A] overflow-hidden p-0.5 neu-inset-sm">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#FF8800] to-[#FFA726] transition-all duration-300"
                style={{ width: `${questionsToTest.length > 0 ? (answeredCount / questionsToTest.length) * 100 : 0}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5 text-center text-xs">
              <div className="p-1.5 sm:p-2 rounded-xl bg-white/40 dark:bg-black/20">
                <div className="text-[10px] sm:text-[11px] text-[#718096] dark:text-[#94A3B8]">Đã hoàn thành</div>
                <div className="text-xs sm:text-sm font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                  {answeredCount} câu
                </div>
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-white/40 dark:bg-black/20">
                <div className="text-[10px] sm:text-[11px] text-[#718096] dark:text-[#94A3B8]">Chưa trả lời</div>
                <div className={`text-xs sm:text-sm font-display font-extrabold ${questionsToTest.length - answeredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {questionsToTest.length - answeredCount} câu
                </div>
              </div>
            </div>
          </div>

          {/* Warning / Reminder note */}
          {answeredCount < questionsToTest.length ? (
            <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                Bạn vẫn còn <strong>{questionsToTest.length - answeredCount} câu</strong> chưa làm. Những câu này sẽ được tính 0 điểm. Bạn có chắc chắn muốn nộp bài?
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>
                Bạn đã trả lời đủ <strong>100% ({questionsToTest.length}/{questionsToTest.length})</strong> câu hỏi. Hãy bấm nộp bài để xem điểm số và lời giải chi tiết.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={() => setIsSubmitConfirmOpen(false)}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl neu-btn text-xs font-display font-bold text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white transition cursor-pointer"
            >
              Làm Tiếp
            </button>
            <button
              onClick={handleConfirmSubmit}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl neu-btn-primary text-xs font-display font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-[4px_4px_12px_rgba(255,136,0,0.4)] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Nộp Bài Ngay
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* POPUP 2: ELEMENT BÁO ĐIỂM CHI TIẾT                       */}
      {/* ======================================================== */}
      {scoreResult && (
        <Modal
          isOpen={isScoreReportOpen}
          onClose={() => setIsScoreReportOpen(false)}
          title="Bảng Điểm & Kết Quả Chi Tiết"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 sm:space-y-4 text-center text-[#4A5568] dark:text-[#E2E8F0]">
            {/* Top evaluation badge */}
            <div className="space-y-1 pt-0.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full neu-inset flex items-center justify-center text-[#FF8800] relative mb-1">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_2px_10px_rgba(255,136,0,0.5)]" />
              </div>

              {evaluation && (
                <div className="space-y-0.5">
                  <div className={`text-base sm:text-lg font-display font-black tracking-tight ${evaluation.color}`}>
                    {evaluation.badge}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#718096] dark:text-[#94A3B8] max-w-xs mx-auto">
                    {evaluation.desc}
                  </p>
                </div>
              )}
            </div>

            {/* Main Score Display Box */}
            <div className="neu-inset p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-1">
              <div className="text-3xl sm:text-4xl font-display font-black text-[#FF8800] drop-shadow-[0_2px_8px_rgba(255,136,0,0.35)]">
                {scoreResult.totalPoints}
                <span className="text-lg sm:text-xl font-bold text-[#718096] dark:text-[#94A3B8]"> / {scoreResult.maxPoints}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-[#718096] dark:text-[#94A3B8] pt-0.5">
                <span className="px-2 py-0.5 rounded-full neu-extruded text-[#FF8800] font-extrabold">
                  Thang 10: {scoreResult.scale10Score}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full neu-extruded text-[#FF8800] font-extrabold">
                  Đạt {scoreResult.percent}%
                </span>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="flex items-center justify-center text-emerald-500 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#718096] dark:text-[#94A3B8]">Đúng</div>
                <div className="text-xs sm:text-sm font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                  {scoreResult.correctCount}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="flex items-center justify-center text-rose-500 mb-0.5">
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#718096] dark:text-[#94A3B8]">Sai</div>
                <div className="text-xs sm:text-sm font-display font-extrabold text-rose-600 dark:text-rose-400">
                  {scoreResult.wrongCount}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="flex items-center justify-center text-amber-500 mb-0.5">
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#718096] dark:text-[#94A3B8]">Chưa làm</div>
                <div className="text-xs sm:text-sm font-display font-extrabold text-amber-600 dark:text-amber-400">
                  {scoreResult.unansweredCount}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="flex items-center justify-center text-[#FF8800] mb-0.5">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#718096] dark:text-[#94A3B8]">Thời gian</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-[#FF8800]">
                  {formatTimer(seconds)}
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-[10px] sm:text-[11px] text-[#718096] dark:text-[#94A3B8] italic pt-0.5">
              * Toàn bộ câu hỏi, đáp án đúng và lời giải chi tiết đã được mở khóa ngay trên trang để bạn đối chiếu.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                onClick={() => setIsScoreReportOpen(false)}
                className="w-full sm:flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl neu-btn-primary text-xs font-display font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-[4px_4px_12px_rgba(255,136,0,0.4)]"
              >
                <Eye className="w-4 h-4" /> Xem Lại Bài Làm
              </button>
              <button
                onClick={handleRestartFromModal}
                className="w-full sm:flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl neu-btn text-xs font-display font-bold text-[#FF8800] hover:text-[#e07700] flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" /> Làm Lại Đề Này
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
