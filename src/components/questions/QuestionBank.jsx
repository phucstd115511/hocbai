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
  ChevronUp,
  Database
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Quick Stats */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
              <Database className="w-5 h-5 drop-shadow-[0_2px_6px_rgba(255,136,0,0.4)]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight flex items-center gap-2.5">
              Ngân Hàng Câu Hỏi
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FF8800] text-white shadow-[0_2px_4px_rgba(255,136,0,0.35)]">
                {filteredQuestions.length} / {questions.length} câu
              </span>
            </h2>
          </div>
          <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] ml-13">
            Quản lý, tìm kiếm, phân loại theo độ khó và chọn lọc câu hỏi cho đề thi
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl neu-inset gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'neu-extruded text-[#FF8800]' 
                  : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
              }`}
              title="Dạng thẻ lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'neu-extruded text-[#FF8800]' 
                  : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
              }`}
              title="Dạng danh sách bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="neu-btn px-4 py-2.5 rounded-2xl text-xs font-bold text-[#FF8800] flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FF8800]" />
            Thêm Câu Hỏi
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="neu-card p-6 sm:p-7 rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-4 transition-all duration-300">
        {/* Quick Subject Category Navigation */}
        <div className="space-y-2.5 pb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] shrink-0">
              Môn học:
            </span>
            <button
              onClick={() => { setSelectedSubjectId(''); setSelectedChapterId(''); }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                !selectedSubjectId 
                  ? 'neu-inset text-[#FF8800]' 
                  : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
              }`}
            >
              Tất cả ({questions.length})
            </button>
            {subjects.map(s => {
              const isSelected = selectedSubjectId === s.id;
              const count = questions.filter(q => q.subjectId === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubjectId(s.id);
                    setSelectedChapterId('');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'neu-inset text-[#FF8800]'
                      : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-[#FF8800] text-white' : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-Chapter Pills (if a subject is selected) */}
          {availableChapters.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 pb-1 no-scrollbar">
              <span className="text-[#718096] dark:text-[#94A3B8] font-bold text-[11px] shrink-0">Chương / Bài:</span>
              <button
                onClick={() => setSelectedChapterId('')}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  !selectedChapterId
                    ? 'neu-inset text-[#FF8800]'
                    : 'neu-btn text-[#718096] dark:text-[#94A3B8]'
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
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isChapSelected
                        ? 'neu-inset text-[#FF8800]'
                        : 'neu-btn text-[#718096] dark:text-[#94A3B8]'
                    }`}
                  >
                    <span>{c.name.split(':')[0]}</span>
                    <span className="text-[10px] opacity-75">({cCount})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Row 1: Search & Favorite */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096] dark:text-[#94A3B8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nội dung câu hỏi, đáp án, giải thích, từ khóa..."
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-2xl neu-inset bg-transparent text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              onlyFavorites
                ? 'neu-inset text-amber-500'
                : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
            }`}
          >
            <Star className={`w-4 h-4 ${onlyFavorites ? 'fill-amber-400 text-amber-500' : 'text-current'}`} />
            Yêu thích
          </button>
        </div>

        {/* Row 2: Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Môn */}
          <select
            value={selectedSubjectId}
            onChange={e => {
              setSelectedSubjectId(e.target.value);
              setSelectedChapterId('');
            }}
            className="text-xs font-bold rounded-xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3 py-2 text-[#2D3748] dark:text-white focus:outline-none cursor-pointer"
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
            className="text-xs font-bold rounded-xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3 py-2 text-[#2D3748] dark:text-white disabled:opacity-50 focus:outline-none cursor-pointer"
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
            className="text-xs font-bold rounded-xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3 py-2 text-[#2D3748] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả loại câu</option>
            <option value="mcq">Trắc nghiệm (MCQ)</option>
            <option value="truefalse">Đúng / Sai 4 ý</option>
          </select>

          {/* Mức độ */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="text-xs font-bold rounded-xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3 py-2 text-[#2D3748] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả mức độ</option>
            {DIFFICULTY_LEVELS.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Tags bar (nếu có) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs pb-1 no-scrollbar">
            <span className="text-[#718096] dark:text-[#94A3B8] flex items-center gap-1 shrink-0 font-bold text-[11px]">
              <Tag className="w-3 h-3 text-[#FF8800]" /> Thẻ:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-2.5 py-0.5 rounded-xl font-bold text-[11px] shrink-0 transition-all cursor-pointer ${
                !selectedTag ? 'neu-inset text-[#FF8800]' : 'neu-btn text-[#718096] dark:text-[#94A3B8]'
              }`}
            >
              Tất cả
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                className={`px-2.5 py-0.5 rounded-xl font-bold text-[11px] shrink-0 transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'neu-inset text-[#FF8800]'
                    : 'neu-btn text-[#718096] dark:text-[#94A3B8]'
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
        <div className="neu-card rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] p-12 text-center">
          <HelpCircle className="w-12 h-12 text-[#718096] dark:text-[#94A3B8] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white">Không tìm thấy câu hỏi phù hợp</h3>
          <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1">
            Hãy thử thay đổi điều kiện tìm kiếm hoặc thêm câu hỏi mới từ tab "Nhập đề cương".
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuestions.map((q, idx) => {
            const diffMeta = getDifficultyMeta(q.difficulty);
            const source = getSourcePath(q);
            const isExplExpanded = expandedExplanationId === q.id;

            return (
              <div
                key={q.id}
                className="neu-card rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Type, Difficulty, Source, Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-xl neu-inset-sm text-[#2D3748] dark:text-white">
                        {q.type === 'mcq' ? 'Trắc nghiệm' : 'Đúng / Sai'}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-xl ${diffMeta.color}`}>
                        {diffMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleFavorite(q.id)}
                        className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] active:scale-95 transition-all cursor-pointer"
                        title={q.favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                      >
                        <Star className={`w-4 h-4 ${q.favorite ? 'fill-amber-400 text-amber-500' : 'hover:text-amber-400'}`} />
                      </button>
                      <button
                        onClick={() => onCloneQuestion(q)}
                        className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] active:scale-95 transition-all cursor-pointer"
                        title="Nhân bản câu hỏi"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(q)}
                        className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] active:scale-95 transition-all cursor-pointer"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingQuestion(q)}
                        className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Source Breadcrumb */}
                  {source.chapName && (
                    <div className="text-[11px] font-medium text-[#718096] dark:text-[#94A3B8] mb-2 truncate">
                      {source.chapName} {source.secName ? `› ${source.secName}` : ''}
                    </div>
                  )}

                  {/* Stem Content */}
                  <div className="text-sm font-bold text-[#2D3748] dark:text-white leading-relaxed mb-4">
                    <MathRenderer text={q.stem} />
                  </div>

                  {/* Answers Display */}
                  {q.type === 'mcq' ? (
                    <div className="space-y-2 mb-3">
                      {(q.options || []).map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correct;
                        const label = ['A', 'B', 'C', 'D'][optIdx];
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-2.5 p-2.5 rounded-2xl text-xs transition-all ${
                              isCorrect
                                ? 'neu-inset text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 bg-emerald-500/5 font-bold'
                                : 'neu-inset text-[#4A5568] dark:text-[#E2E8F0]'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white shadow-sm' : 'neu-extruded-sm text-[#718096] dark:text-[#94A3B8]'
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
                    <div className="space-y-2 mb-3">
                      {(q.statements || []).map((stmt, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start justify-between gap-2 p-2.5 rounded-2xl text-xs neu-inset text-[#2D3748] dark:text-white"
                        >
                          <div className="flex items-start gap-1.5 flex-1 font-medium">
                            <span className="font-bold text-[#718096] dark:text-[#94A3B8] shrink-0">{stmt.label})</span>
                            <span className="mt-0.5"><MathRenderer text={stmt.text} /></span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                            stmt.answer
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                          }`}>
                            {stmt.answer ? 'Đúng' : 'Sai'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {q.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-bold neu-inset-sm text-[#718096] dark:text-[#94A3B8] px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Explanation Toggle */}
                {q.explanation && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 mt-2">
                    <button
                      onClick={() => setExpandedExplanationId(isExplExpanded ? null : q.id)}
                      className="text-xs font-bold text-[#FF8800] flex items-center justify-between w-full cursor-pointer hover:underline"
                    >
                      <span>{isExplExpanded ? 'Ẩn lời giải' : 'Xem lời giải chi tiết'}</span>
                      {isExplExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isExplExpanded && (
                      <div className="mt-2.5 p-3 neu-inset rounded-2xl text-xs text-[#4A5568] dark:text-[#CBD5E1]">
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
        <div className="neu-card rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] overflow-x-auto shadow-sm p-2">
          <table className="w-full text-left text-xs text-[#4A5568] dark:text-[#CBD5E1]">
            <thead className="text-[#718096] dark:text-[#94A3B8] uppercase text-[11px] font-bold border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="p-3 w-10 text-center">★</th>
                <th className="p-3 w-28">Phân loại</th>
                <th className="p-3 min-w-[250px]">Nội dung câu hỏi</th>
                <th className="p-3 min-w-[150px]">Chương / Nguồn</th>
                <th className="p-3 w-24">Mức độ</th>
                <th className="p-3 w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredQuestions.map(q => {
                const diffMeta = getDifficultyMeta(q.difficulty);
                const source = getSourcePath(q);
                return (
                  <tr key={q.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition">
                    <td className="p-3 text-center">
                      <button onClick={() => onToggleFavorite(q.id)} className="cursor-pointer">
                        <Star className={`w-4 h-4 mx-auto ${q.favorite ? 'fill-amber-400 text-amber-500' : 'text-[#718096]'}`} />
                      </button>
                    </td>
                    <td className="p-3 font-bold">
                      <span className="px-2 py-0.5 rounded-xl neu-inset-sm text-[#2D3748] dark:text-white">
                        {q.type === 'mcq' ? 'MCQ' : 'Đ/S 4 ý'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-[#2D3748] dark:text-white">
                      <div className="line-clamp-2">
                        <MathRenderer text={q.stem} />
                      </div>
                    </td>
                    <td className="p-3 text-[#718096] dark:text-[#94A3B8]">
                      <div className="truncate max-w-[180px]">{source.chapName || source.subName}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${diffMeta.color}`}>
                        {diffMeta.label}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onCloneQuestion(q)}
                          className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] cursor-pointer"
                          title="Nhân bản"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(q)}
                          className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] cursor-pointer"
                          title="Sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingQuestion(q)}
                          className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-rose-600 cursor-pointer"
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
          <p className="text-sm text-[#4A5568] dark:text-[#CBD5E1]">
            Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng không? Hành động này không thể hoàn tác.
          </p>
          {deletingQuestion && (
            <div className="p-3.5 neu-inset rounded-2xl text-xs italic text-[#2D3748] dark:text-white">
              "{deletingQuestion.stem.slice(0, 100)}..."
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeletingQuestion(null)}
              className="px-4 py-2 text-xs font-bold rounded-2xl neu-btn text-[#718096] dark:text-[#94A3B8] cursor-pointer active:scale-95 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-bold rounded-2xl neu-btn text-rose-600 hover:text-rose-500 cursor-pointer active:scale-95 transition-all"
            >
              Xóa Vĩnh Viễn
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
