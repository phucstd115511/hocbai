import React, { useState, useMemo } from 'react';
import MathRenderer from '../common/MathRenderer.jsx';
import Modal from '../common/Modal.jsx';
import PrintView from '../print/PrintView.jsx';
import { 
  createNewExam, 
  sampleRandomQuestions, 
  prepareExamQuestions 
} from '../../services/examService.js';
import { 
  Plus, 
  Printer, 
  Play, 
  Shuffle, 
  Trash2, 
  FileText, 
  Search, 
  CheckSquare, 
  Square, 
  Dices, 
  Layers, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ExamManager({
  exams = [],
  questions = [],
  subjects = [],
  onSaveExam,
  onDeleteExam,
  onStartPractice
}) {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'create'
  const [printExam, setPrintExam] = useState(null);

  // Form tạo đề mới
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [selectionMethod, setSelectionMethod] = useState('manual'); // 'manual' | 'matrix'
  
  // Trạng thái chọn thủ công
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [manualFilterSubject, setManualFilterSubject] = useState('');
  const [manualFilterChapter, setManualFilterChapter] = useState('');
  const [manualFilterType, setManualFilterType] = useState('');
  const [manualSearch, setManualSearch] = useState('');

  // Trạng thái chọn ma trận ngẫu nhiên
  const [matrixSubjectId, setMatrixSubjectId] = useState('');
  const [matrixChapterIds, setMatrixChapterIds] = useState([]);
  const [matrixMCQCount, setMatrixMCQCount] = useState(8);
  const [matrixTFCount, setMatrixTFCount] = useState(2);
  const [matrixDifficulty, setMatrixDifficulty] = useState('');

  // Map tra cứu câu hỏi
  const questionsMap = useMemo(() => {
    const map = {};
    questions.forEach(q => { map[q.id] = q; });
    return map;
  }, [questions]);

  // Danh sách câu hỏi lọc trong phần chọn thủ công
  const manualFilteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (manualFilterSubject && q.subjectId !== manualFilterSubject) return false;
      if (manualFilterChapter && q.chapterId !== manualFilterChapter) return false;
      if (manualFilterType && q.type !== manualFilterType) return false;
      if (manualSearch.trim()) {
        const term = manualSearch.toLowerCase();
        if (!q.stem.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [questions, manualFilterSubject, manualFilterChapter, manualFilterType, manualSearch]);

  const toggleSelectQuestion = (qId) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      manualFilteredQuestions.forEach(q => next.add(q.id));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedQuestionIds(new Set());
  };

  // Tạo ngẫu nhiên theo ma trận
  const handleGenerateMatrix = () => {
    const sampled = sampleRandomQuestions(questions, {
      subjectId: matrixSubjectId,
      chapterIds: matrixChapterIds,
      mcqCount: Number(matrixMCQCount),
      trueFalseCount: Number(matrixTFCount),
      difficulty: matrixDifficulty
    });

    if (sampled.length === 0) {
      alert('Không tìm thấy câu hỏi nào thỏa mãn ma trận yêu cầu.');
      return;
    }

    const ids = new Set(sampled.map(q => q.id));
    setSelectedQuestionIds(ids);
    setSelectionMethod('manual'); // chuyển sang tab thủ công để người dùng xem trước và tick chọn
  };

  // Lưu đề thi
  const handleSaveNewExam = () => {
    if (!examName.trim()) {
      alert('Vui lòng nhập tên đề thi.');
      return;
    }
    if (selectedQuestionIds.size === 0) {
      alert('Vui lòng chọn ít nhất 1 câu hỏi cho đề thi.');
      return;
    }

    const newExam = createNewExam({
      name: examName,
      description: examDescription,
      questionIds: Array.from(selectedQuestionIds)
    });

    onSaveExam(newExam);
    setCurrentView('list');
    setExamName('');
    setExamDescription('');
    setSelectedQuestionIds(new Set());
  };

  // Xáo trộn đề thi và lưu thành mã đề mới
  const handleShuffleAndClone = (exam) => {
    const shuffledQuestions = prepareExamQuestions(exam, questionsMap, {
      shuffleQuestions: true,
      shuffleAnswers: true
    });

    const newCode = Math.floor(100 + Math.random() * 900);
    const clonedExam = createNewExam({
      name: `${exam.name} (Mã đề ${newCode})`,
      description: `Bản xáo trộn câu và phương án từ "${exam.name}"`,
      questionIds: shuffledQuestions.map(q => q.id)
    });

    onSaveExam(clonedExam);
  };

  // Nếu đang xem bản in
  if (printExam) {
    const examQuestions = (printExam.questionIds || [])
      .map(id => questionsMap[id])
      .filter(Boolean);
    return (
      <PrintView
        exam={printExam}
        questions={examQuestions}
        subjects={subjects}
        onClose={() => setPrintExam(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 shadow-[0_8px_20px_rgba(163,177,198,0.4),0_2px_6px_rgba(163,177,198,0.2)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF8800] animate-pulse" />
            <span className="text-[11px] font-display font-extrabold text-[#FF8800] uppercase tracking-wider">
              Khảo Thí & Đề Thi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight flex items-center gap-2">
            Tạo & Quản Lý Đề Thi
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF8800] text-white font-extrabold shadow-sm">
              {exams.length} đề thi
            </span>
          </h2>
          <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] mt-1">
            Chọn câu hỏi từ ngân hàng, bốc ma trận ngẫu nhiên, xáo trộn thứ tự và xuất in A4 chuẩn thi
          </p>
        </div>

        {currentView === 'list' ? (
          <button
            onClick={() => setCurrentView('create')}
            className="flex items-center gap-2 px-5 py-2.5 neu-btn-primary text-xs font-display font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            Tạo Đề Mới
          </button>
        ) : (
          <button
            onClick={() => setCurrentView('list')}
            className="px-4 py-2.5 neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] rounded-2xl text-xs font-display font-bold cursor-pointer active:scale-95 transition"
          >
            Quay Lại Danh Sách
          </button>
        )}
      </div>

      {currentView === 'list' ? (
        /* LIST OF EXAMS */
        exams.length === 0 ? (
          <div className="neu-card rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 p-12 text-center">
            <FileText className="w-12 h-12 text-[#A0AEC0] dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white">Chưa có đề thi nào</h3>
            <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1 mb-4">
              Hãy bấm "Tạo Đề Mới" để gom các câu hỏi từ ngân hàng thành một đề hoàn chỉnh.
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 neu-btn-primary text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer active:scale-95 transition"
            >
              <Plus className="w-4 h-4" /> Tạo đề thi đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(exam => {
              const count = (exam.questionIds || []).length;
              const mcqCount = (exam.questionIds || []).filter(id => questionsMap[id]?.type === 'mcq').length;
              const tfCount = count - mcqCount;
              const formattedDate = new Date(exam.createdAt).toLocaleDateString('vi-VN');

              return (
                <div
                  key={exam.id}
                  className="neu-card rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white line-clamp-1">
                        {exam.name}
                      </h3>
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
                            onDeleteExam(exam.id);
                          }
                        }}
                        className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#718096] hover:text-rose-500 cursor-pointer"
                        title="Xóa đề"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {exam.description && (
                      <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] mb-3 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                      <span className="neu-inset-sm px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#FF8800]">
                        {count} câu hỏi ({mcqCount} MCQ + {tfCount} Đ/S)
                      </span>
                      <span className="flex items-center gap-1 text-[#718096] text-[11px]">
                        <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                    <button
                      onClick={() => handleShuffleAndClone(exam)}
                      className="neu-btn px-3 py-1.5 rounded-xl text-xs font-display font-bold text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] flex items-center gap-1 cursor-pointer active:scale-95 transition"
                      title="Xáo trộn câu và đáp án để tạo mã đề mới"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Xáo đề</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrintExam(exam)}
                        className="neu-btn px-3 py-1.5 rounded-xl text-xs font-display font-bold text-[#4A5568] dark:text-[#CBD5E1] hover:text-[#FF8800] flex items-center gap-1 cursor-pointer active:scale-95 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        In Đề
                      </button>
                      <button
                        onClick={() => onStartPractice(exam)}
                        className="neu-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-display font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Luyện Tập
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* CREATE NEW EXAM WIZARD */
        <div className="neu-card rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 p-6 sm:p-7 space-y-6">
          <div className="border-b border-black/5 dark:border-white/5 pb-4">
            <h3 className="text-lg font-display font-extrabold text-[#2D3748] dark:text-white">Thiết Lập Đề Thi Mới</h3>
            <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-0.5">
              Điền thông tin và lựa chọn các câu hỏi muốn đưa vào đề thi.
            </p>
          </div>

          {/* Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
                Tên đề thi *
              </label>
              <input
                type="text"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                placeholder="Ví dụ: Đề Kiểm Tra 45 Phút - Chương 1 & 2"
                className="w-full text-xs font-medium rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
                Ghi chú / Mô tả
              </label>
              <input
                type="text"
                value={examDescription}
                onChange={e => setExamDescription(e.target.value)}
                placeholder="Ghi chú thời gian làm bài, cấu trúc điểm..."
                className="w-full text-xs font-medium rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
              />
            </div>
          </div>

          {/* Method Selector Tabs */}
          <div className="border-t border-black/5 dark:border-white/5 pt-4">
            <div className="flex flex-wrap items-center neu-inset p-1 rounded-2xl gap-1 mb-4">
              <button
                onClick={() => setSelectionMethod('manual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold transition cursor-pointer ${
                  selectionMethod === 'manual'
                    ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Chọn thủ công bằng Checkbox ({selectedQuestionIds.size} câu đã chọn)
              </button>
              <button
                onClick={() => setSelectionMethod('matrix')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold transition cursor-pointer ${
                  selectionMethod === 'matrix'
                    ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
                }`}
              >
                <Dices className="w-4 h-4" />
                Tạo ngẫu nhiên theo ma trận
              </button>
            </div>

            {selectionMethod === 'matrix' ? (
              /* MATRIX GENERATOR */
              <div className="neu-inset p-5 rounded-[28px] space-y-4">
                <h4 className="text-xs font-display font-extrabold text-[#2D3748] dark:text-white flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#FF8800]" /> Cấu hình Ma Trận Ngẫu Nhiên
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
                      Môn học
                    </label>
                    <select
                      value={matrixSubjectId}
                      onChange={e => setMatrixSubjectId(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl neu-card bg-[#EBECF0] dark:bg-[#1A1E24] px-3 py-2 text-[#2D3748] dark:text-white focus:outline-none"
                    >
                      <option value="" className="bg-[#EBECF0] dark:bg-[#1A1E24]">Tất cả môn học</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#EBECF0] dark:bg-[#1A1E24] text-[#2D3748] dark:text-white">{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
                      Số câu Trắc nghiệm (MCQ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={matrixMCQCount}
                      onChange={e => setMatrixMCQCount(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl neu-card bg-transparent px-3 py-2 text-[#2D3748] dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
                      Số câu Đúng / Sai (4 ý)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={matrixTFCount}
                      onChange={e => setMatrixTFCount(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl neu-card bg-transparent px-3 py-2 text-[#2D3748] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleGenerateMatrix}
                    className="flex items-center gap-2 px-5 py-2.5 neu-btn-primary rounded-2xl text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer active:scale-95 transition"
                  >
                    <Dices className="w-4 h-4" />
                    Bốc Ngẫu Nhiên & Chuyển Sang Xem Trước
                  </button>
                </div>
              </div>
            ) : (
              /* MANUAL PICKER */
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 neu-inset p-3 rounded-2xl">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                      <input
                        type="text"
                        value={manualSearch}
                        onChange={e => setManualSearch(e.target.value)}
                        placeholder="Lọc nội dung câu hỏi..."
                        className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl neu-card bg-transparent text-[#2D3748] dark:text-white focus:outline-none"
                      />
                    </div>

                    <select
                      value={manualFilterType}
                      onChange={e => setManualFilterType(e.target.value)}
                      className="text-xs rounded-xl neu-card bg-[#EBECF0] dark:bg-[#1A1E24] px-3 py-1.5 text-[#2D3748] dark:text-white focus:outline-none"
                    >
                      <option value="" className="bg-[#EBECF0] dark:bg-[#1A1E24]">Tất cả loại</option>
                      <option value="mcq" className="bg-[#EBECF0] dark:bg-[#1A1E24]">Trắc nghiệm</option>
                      <option value="truefalse" className="bg-[#EBECF0] dark:bg-[#1A1E24]">Đúng / Sai</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSelectAllFiltered}
                      className="text-xs font-display font-bold text-[#FF8800] hover:underline cursor-pointer"
                    >
                      Chọn tất cả ({manualFilteredQuestions.length})
                    </button>
                    <span className="text-[#A0AEC0]">|</span>
                    <button
                      onClick={handleClearSelection}
                      className="text-xs font-display font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                {/* Questions Checklist */}
                <div className="max-h-96 overflow-y-auto space-y-2 neu-inset rounded-2xl p-2.5">
                  {manualFilteredQuestions.length === 0 ? (
                    <div className="text-center p-6 text-xs text-[#718096]">
                      Không có câu hỏi nào khớp với bộ lọc.
                    </div>
                  ) : (
                    manualFilteredQuestions.map(q => {
                      const isSelected = selectedQuestionIds.has(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleSelectQuestion(q.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl neu-card border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'border-[#FF8800]/50 bg-[#FF8800]/10 shadow-sm'
                              : 'border-white/60 dark:border-white/5 hover:border-[#FF8800]/25'
                          }`}
                        >
                          <div className="mt-0.5 text-[#FF8800] shrink-0">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-[#FF8800]" /> : <Square className="w-4 h-4 text-[#718096]" />}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-display font-extrabold text-[10px] px-1.5 py-0.2 rounded-md bg-[#FF8800] text-white uppercase">
                                {q.type === 'mcq' ? 'MCQ' : 'Đ/S 4 ý'}
                              </span>
                              <span className="text-[10px] font-bold text-[#718096]">
                                {q.difficulty}
                              </span>
                            </div>
                            <div className="font-medium text-[#2D3748] dark:text-[#CBD5E1] line-clamp-2">
                              <MathRenderer text={q.stem} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
            <div className="text-xs font-medium text-[#718096] dark:text-[#94A3B8]">
              Tổng cộng: <span className="font-display font-extrabold text-[#FF8800]">{selectedQuestionIds.size}</span> câu hỏi được chọn
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="px-4 py-2.5 text-xs font-display font-bold text-[#718096] hover:text-rose-500 rounded-xl neu-btn cursor-pointer active:scale-95 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewExam}
                disabled={selectedQuestionIds.size === 0 || !examName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 neu-btn-primary text-xs font-display font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer active:scale-95 transition disabled:opacity-50"
              >
                Lưu Đề Thi
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
