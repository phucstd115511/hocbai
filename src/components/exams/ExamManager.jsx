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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Tạo & Quản Lý Đề Thi
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-semibold">
              {exams.length} đề thi
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chọn câu hỏi từ ngân hàng, bốc ma trận ngẫu nhiên, xáo trộn thứ tự và xuất in A4 chuẩn thi
          </p>
        </div>

        {currentView === 'list' ? (
          <button
            onClick={() => setCurrentView('create')}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Tạo Đề Mới
          </button>
        ) : (
          <button
            onClick={() => setCurrentView('list')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200"
          >
            Quay Lại Danh Sách
          </button>
        )}
      </div>

      {currentView === 'list' ? (
        /* LIST OF EXAMS */
        exams.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Chưa có đề thi nào</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Hãy bấm "Tạo Đề Mới" để gom các câu hỏi từ ngân hàng thành một đề hoàn chỉnh.
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl"
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
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {exam.name}
                      </h3>
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
                            onDeleteExam(exam.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Xóa đề"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {exam.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold border border-sky-100 dark:border-sky-900">
                        {count} câu hỏi ({mcqCount} MCQ + {tfCount} Đ/S)
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleShuffleAndClone(exam)}
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-sky-600 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Xáo trộn câu và đáp án để tạo mã đề mới"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Xáo đề</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrintExam(exam)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        In Đề
                      </button>
                      <button
                        onClick={() => onStartPractice(exam)}
                        className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thiết Lập Đề Thi Mới</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Điền thông tin và lựa chọn các câu hỏi muốn đưa vào đề thi.
            </p>
          </div>

          {/* Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên đề thi *
              </label>
              <input
                type="text"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                placeholder="Ví dụ: Đề Kiểm Tra 45 Phút - Chương 1 & 2"
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú / Mô tả
              </label>
              <input
                type="text"
                value={examDescription}
                onChange={e => setExamDescription(e.target.value)}
                placeholder="Ghi chú thời gian làm bài, cấu trúc điểm..."
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Method Selector Tabs */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setSelectionMethod('manual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectionMethod === 'manual'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Chọn thủ công bằng Checkbox ({selectedQuestionIds.size} câu đã chọn)
              </button>
              <button
                onClick={() => setSelectionMethod('matrix')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectionMethod === 'matrix'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Dices className="w-4 h-4" />
                Tạo ngẫu nhiên theo ma trận
              </button>
            </div>

            {selectionMethod === 'matrix' ? (
              /* MATRIX GENERATOR */
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" /> Cấu hình Ma Trận Ngẫu Nhiên
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Môn học
                    </label>
                    <select
                      value={matrixSubjectId}
                      onChange={e => setMatrixSubjectId(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="">Tất cả môn học</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số câu Trắc nghiệm (MCQ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={matrixMCQCount}
                      onChange={e => setMatrixMCQCount(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số câu Đúng / Sai (4 ý)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={matrixTFCount}
                      onChange={e => setMatrixTFCount(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateMatrix}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20"
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
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={manualSearch}
                        onChange={e => setManualSearch(e.target.value)}
                        placeholder="Lọc nội dung câu hỏi..."
                        className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <select
                      value={manualFilterType}
                      onChange={e => setManualFilterType(e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5"
                    >
                      <option value="">Tất cả loại</option>
                      <option value="mcq">Trắc nghiệm</option>
                      <option value="truefalse">Đúng / Sai</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAllFiltered}
                      className="text-xs font-semibold text-sky-600 hover:underline"
                    >
                      Chọn tất cả ({manualFilteredQuestions.length})
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={handleClearSelection}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                {/* Questions Checklist */}
                <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                  {manualFilteredQuestions.length === 0 ? (
                    <div className="text-center p-6 text-xs text-slate-400">
                      Không có câu hỏi nào khớp với bộ lọc.
                    </div>
                  ) : (
                    manualFilteredQuestions.map(q => {
                      const isSelected = selectedQuestionIds.has(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleSelectQuestion(q.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 shadow-xs'
                              : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="mt-0.5 text-sky-600 shrink-0">
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                                {q.type === 'mcq' ? 'MCQ' : 'Đ/S 4 ý'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {q.difficulty}
                              </span>
                            </div>
                            <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
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
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Tổng cộng: <span className="font-bold text-sky-600 dark:text-sky-400">{selectedQuestionIds.size}</span> câu hỏi được chọn
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewExam}
                disabled={selectedQuestionIds.size === 0 || !examName.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-50"
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
