import React, { useState, useMemo } from 'react';
import MathRenderer from '../common/MathRenderer.jsx';
import QuestionFormModal from './QuestionFormModal.jsx';
import Modal from '../common/Modal.jsx';
import { DIFFICULTY_LEVELS, QUESTION_TYPES, generateId } from '../../types/schema.js';
import { 
  Search, 
  Plus, 
  Star, 
  Copy, 
  Edit3, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  LayoutGrid, 
  List, 
  HelpCircle,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function QuestionBank({
  questions = [],
  subjects = [],
  onSaveQuestion,
  onDeleteQuestion,
  onCloneQuestion,
  onToggleFavorite
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    // Ưu tiên chọn sẵn Công Nghệ GHKI để người dùng thấy ngay
    const cn = subjects.find(s => s.id === 'sub_congnghe_ghki' || s.name === 'Công Nghệ GHKI');
    return cn ? cn.id : '';
  });
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [expandedExplanationId, setExpandedExplanationId] = useState(null);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  // Danh sách chương theo môn đã chọn
  const availableChapters = useMemo(() => {
    if (!selectedSubjectId) return [];
    const sub = subjects.find(s => s.id === selectedSubjectId);
    return sub?.chapters || [];
  }, [selectedSubjectId, subjects]);

  // Tập hợp tất cả các tag có sẵn
  const allTags = useMemo(() => {
    const tagSet = new Set();
    questions.forEach(q => {
      (q.tags || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).slice(0, 15);
  }, [questions]);

  // Bộ lọc câu hỏi
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (onlyFavorites && !q.favorite) return false;
      if (selectedSubjectId && q.subjectId !== selectedSubjectId) return false;
      if (selectedChapterId && q.chapterId !== selectedChapterId) return false;
      if (selectedType && q.type !== selectedType) return false;
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
      if (selectedTag && !(q.tags || []).includes(selectedTag)) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const inStem = (q.stem || '').toLowerCase().includes(term);
        const inExpl = (q.explanation || '').toLowerCase().includes(term);
        const inOptions = (q.options || []).some(o => o.toLowerCase().includes(term));
        const inStatements = (q.statements || []).some(s => s.text.toLowerCase().includes(term));
        const inTags = (q.tags || []).some(t => t.toLowerCase().includes(term));
        if (!inStem && !inExpl && !inOptions && !inStatements && !inTags) return false;
      }

      return true;
    });
  }, [questions, onlyFavorites, selectedSubjectId, selectedChapterId, selectedType, selectedDifficulty, selectedTag, searchTerm]);

  const handleEdit = (q) => {
    setEditingQuestion(q);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingQuestion) {
      onDeleteQuestion(deletingQuestion.id);
      setDeletingQuestion(null);
    }
  };

  const getDifficultyMeta = (diff) => {
    return DIFFICULTY_LEVELS.find(d => d.id === diff) || DIFFICULTY_LEVELS[0];
  };

  // Tra cứu tên chương/mục
  const getSourcePath = (q) => {
    const sub = subjects.find(s => s.id === q.subjectId);
    const chap = sub?.chapters?.find(c => c.id === q.chapterId);
    const sec = chap?.sections?.find(s => s.id === q.sectionId);
    return {
      subName: sub?.name || 'Môn học',
      chapName: chap?.name || '',
      secName: sec?.name || ''
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Ngân Hàng Câu Hỏi
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-semibold">
              {filteredQuestions.length} / {questions.length} câu
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý, tìm kiếm, phân loại theo độ khó và chọn lọc câu hỏi cho đề thi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-xs text-sky-600 dark:text-sky-400' : 'text-slate-500'}`}
              title="Dạng thẻ lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-xs text-sky-600 dark:text-sky-400' : 'text-slate-500'}`}
              title="Dạng danh sách bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm Câu Hỏi
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Quick Subject Category Navigation */}
        <div className="space-y-2 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Mục môn học:
            </span>
            <button
              onClick={() => { setSelectedSubjectId(''); setSelectedChapterId(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                !selectedSubjectId 
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất cả ({questions.length})
            </button>
            {subjects.map(s => {
              const isSelected = selectedSubjectId === s.id;
              const count = questions.filter(q => q.subjectId === s.id).length;
              const isCongNghe = s.id === 'sub_congnghe_ghki' || s.name === 'Công Nghệ GHKI';
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubjectId(s.id);
                    setSelectedChapterId('');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isSelected
                      ? isCongNghe
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20 ring-2 ring-sky-400'
                        : 'bg-sky-600 text-white shadow-sm'
                      : isCongNghe
                        ? 'bg-sky-50 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 hover:bg-sky-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {count} câu
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-Chapter Pills (if a subject is selected) */}
          {availableChapters.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 pb-1">
              <span className="text-slate-400 font-semibold text-[11px] shrink-0">Chương / Bài:</span>
              <button
                onClick={() => setSelectedChapterId('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  !selectedChapterId
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Tất cả ({questions.filter(q => q.subjectId === selectedSubjectId).length})
              </button>
              {availableChapters.map(c => {
                const isChapSelected = selectedChapterId === c.id;
                const cCount = questions.filter(q => q.chapterId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChapterId(isChapSelected ? '' : c.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      isChapSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.name.split(':')[0]}</span>
                    <span className="opacity-75 text-[10px]">({cCount})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Row 1: Search & Favorite */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nội dung câu hỏi, đáp án, giải thích, từ khóa..."
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              onlyFavorites
                ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${onlyFavorites ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            Yêu thích
          </button>
        </div>

        {/* Row 2: Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Môn */}
          <select
            value={selectedSubjectId}
            onChange={e => {
              setSelectedSubjectId(e.target.value);
              setSelectedChapterId('');
            }}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="">Tất cả môn học</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Chương */}
          <select
            value={selectedChapterId}
            onChange={e => setSelectedChapterId(e.target.value)}
            disabled={!selectedSubjectId}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 disabled:opacity-50"
          >
            <option value="">Tất cả chương</option>
            {availableChapters.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Loại câu */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="">Tất cả loại câu</option>
            <option value="mcq">Trắc nghiệm (MCQ)</option>
            <option value="truefalse">Đúng / Sai 4 ý</option>
          </select>

          {/* Mức độ */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="">Tất cả mức độ</option>
            {DIFFICULTY_LEVELS.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Tags bar (nếu có) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs pb-1">
            <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium text-[11px]">
              <Tag className="w-3 h-3" /> Thẻ:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-2 py-0.5 rounded-md font-medium text-[11px] shrink-0 transition ${
                !selectedTag ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] shrink-0 transition ${
                  selectedTag === tag
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions Display */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Không tìm thấy câu hỏi phù hợp</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hãy thử thay đổi điều kiện tìm kiếm hoặc thêm câu hỏi mới từ tab "Nhập đề cương".
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q, idx) => {
            const diffMeta = getDifficultyMeta(q.difficulty);
            const source = getSourcePath(q);
            const isExplExpanded = expandedExplanationId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Type, Difficulty, Source, Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.type === 'mcq' ? 'Trắc nghiệm' : 'Đúng / Sai'}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${diffMeta.color}`}>
                        {diffMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(q.id)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
                        title={q.favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                      >
                        <Star className={`w-4 h-4 ${q.favorite ? 'fill-amber-400 text-amber-500' : 'hover:text-amber-400'}`} />
                      </button>
                      <button
                        onClick={() => onCloneQuestion(q)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-600 transition"
                        title="Nhân bản câu hỏi"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(q)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-600 transition"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingQuestion(q)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Source Breadcrumb */}
                  {source.chapName && (
                    <div className="text-[11px] text-slate-400 mb-2 truncate">
                      {source.chapName} {source.secName ? `› ${source.secName}` : ''}
                    </div>
                  )}

                  {/* Stem Content */}
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                    <MathRenderer text={q.stem} />
                  </div>

                  {/* Answers Display */}
                  {q.type === 'mcq' ? (
                    <div className="space-y-1.5 mb-3">
                      {(q.options || []).map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correct;
                        const label = ['A', 'B', 'C', 'D'][optIdx];
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-2 p-2 rounded-xl text-xs transition ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 font-medium text-emerald-900 dark:text-emerald-200'
                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {label}
                            </span>
                            <span className="flex-1 mt-0.5">
                              <MathRenderer text={opt} />
                            </span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* True/False Statements */
                    <div className="space-y-1.5 mb-3">
                      {(q.statements || []).map((stmt, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start justify-between gap-2 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
                        >
                          <div className="flex items-start gap-1.5 flex-1">
                            <span className="font-bold text-slate-500 shrink-0">{stmt.label})</span>
                            <span className="mt-0.5"><MathRenderer text={stmt.text} /></span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                            stmt.answer
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                          }`}>
                            {stmt.answer ? 'Đúng' : 'Sai'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {q.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Explanation Toggle */}
                {q.explanation && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <button
                      onClick={() => setExpandedExplanationId(isExplExpanded ? null : q.id)}
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center justify-between w-full hover:underline"
                    >
                      <span>{isExplExpanded ? 'Ẩn lời giải' : 'Xem lời giải thích'}</span>
                      {isExplExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isExplExpanded && (
                      <div className="mt-2 p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-sky-100 dark:border-sky-900">
                        <MathRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 w-10 text-center">★</th>
                <th className="p-3 w-28">Phân loại</th>
                <th className="p-3 min-w-[250px]">Nội dung câu hỏi</th>
                <th className="p-3 min-w-[150px]">Chương / Nguồn</th>
                <th className="p-3 w-24">Mức độ</th>
                <th className="p-3 w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuestions.map(q => {
                const diffMeta = getDifficultyMeta(q.difficulty);
                const source = getSourcePath(q);
                return (
                  <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 text-center">
                      <button onClick={() => onToggleFavorite(q.id)}>
                        <Star className={`w-4 h-4 mx-auto ${q.favorite ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    </td>
                    <td className="p-3 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.type === 'mcq' ? 'MCQ' : 'Đ/S 4 ý'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      <div className="line-clamp-2">
                        <MathRenderer text={q.stem} />
                      </div>
                    </td>
                    <td className="p-3 text-slate-500">
                      <div className="truncate max-w-[180px]">{source.chapName || source.subName}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${diffMeta.color}`}>
                        {diffMeta.label}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onCloneQuestion(q)}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          title="Nhân bản"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(q)}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          title="Sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingQuestion(q)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={onSaveQuestion}
        initialQuestion={editingQuestion}
        subjects={subjects}
        existingQuestions={questions}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        title="Xác nhận xóa câu hỏi"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng không? Hành động này không thể hoàn tác.
          </p>
          {deletingQuestion && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs italic text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              "{deletingQuestion.stem.slice(0, 100)}..."
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeletingQuestion(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
            >
              Xóa Vĩnh Viễn
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
