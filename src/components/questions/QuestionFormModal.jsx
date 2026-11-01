import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import MathRenderer from '../common/MathRenderer.jsx';
import { DIFFICULTY_LEVELS, createDefaultMCQ, createDefaultTrueFalse } from '../../types/schema.js';
import { findDuplicateQuestion } from '../../services/duplicateChecker.js';
import { AlertTriangle, Eye, CheckCircle2, XCircle } from 'lucide-react';

export default function QuestionFormModal({
  isOpen,
  onClose,
  onSave,
  initialQuestion = null,
  subjects = [],
  existingQuestions = []
}) {
  const [formData, setFormData] = useState(initialQuestion || createDefaultMCQ());
  const [tagInput, setTagInput] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setFormData(initialQuestion);
      setTagInput((initialQuestion.tags || []).join(', '));
    } else {
      const defaultSub = subjects[0];
      const defaultChap = defaultSub?.chapters?.[0];
      const defaultSec = defaultChap?.sections?.[0];
      const newQ = createDefaultMCQ({
        subjectId: defaultSub?.id || '',
        chapterId: defaultChap?.id || '',
        sectionId: defaultSec?.id || ''
      });
      setFormData(newQ);
      setTagInput('');
    }
    setDuplicateWarning(null);
    setShowPreview(false);
  }, [initialQuestion, isOpen, subjects]);

  // Kiểm tra trùng lặp khi nội dung stem thay đổi
  useEffect(() => {
    if (formData.stem && formData.stem.trim().length > 10) {
      const dup = findDuplicateQuestion(formData, existingQuestions);
      setDuplicateWarning(dup);
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.stem, formData.id, existingQuestions]);

  const handleChangeType = (type) => {
    if (type === 'mcq') {
      setFormData(prev => ({
        ...prev,
        type: 'mcq',
        options: prev.options || ['', '', '', ''],
        correct: prev.correct !== undefined ? prev.correct : 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        type: 'truefalse',
        statements: prev.statements || [
          { id: 'a', label: 'a', text: '', answer: true },
          { id: 'b', label: 'b', text: '', answer: false },
          { id: 'c', label: 'c', text: '', answer: true },
          { id: 'd', label: 'd', text: '', answer: false }
        ]
      }));
    }
  };

  const handleMCQOptionChange = (idx, value) => {
    const newOptions = [...formData.options];
    newOptions[idx] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleStatementChange = (idx, field, value) => {
    const newStatements = [...formData.statements];
    newStatements[idx] = { ...newStatements[idx], [field]: value };
    setFormData(prev => ({ ...prev, statements: newStatements }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.stem.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const questionToSave = {
      ...formData,
      tags,
      updatedAt: new Date().toISOString()
    };

    onSave(questionToSave);
    onClose();
  };

  const currentSubject = subjects.find(s => s.id === formData.subjectId) || subjects[0];
  const chapters = currentSubject?.chapters || [];
  const currentChapter = chapters.find(c => c.id === formData.chapterId) || chapters[0];
  const sections = currentChapter?.sections || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chọn phân loại và chương mục */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Môn học
            </label>
            <select
              value={formData.subjectId || ''}
              onChange={e => {
                const subId = e.target.value;
                const sub = subjects.find(s => s.id === subId);
                const chap = sub?.chapters?.[0];
                setFormData(prev => ({
                  ...prev,
                  subjectId: subId,
                  chapterId: chap?.id || '',
                  sectionId: chap?.sections?.[0]?.id || ''
                }));
              }}
              className="w-full text-xs font-medium rounded-2xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id} className="bg-[#EBECF0] dark:bg-[#1A1E24] text-[#2D3748] dark:text-white">{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Chương / Phần
            </label>
            <select
              value={formData.chapterId || ''}
              onChange={e => {
                const chapId = e.target.value;
                const chap = chapters.find(c => c.id === chapId);
                setFormData(prev => ({
                  ...prev,
                  chapterId: chapId,
                  sectionId: chap?.sections?.[0]?.id || ''
                }));
              }}
              className="w-full text-xs font-medium rounded-2xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
            >
              <option value="" className="bg-[#EBECF0] dark:bg-[#1A1E24]">-- Chọn chương --</option>
              {chapters.map(c => (
                <option key={c.id} value={c.id} className="bg-[#EBECF0] dark:bg-[#1A1E24] text-[#2D3748] dark:text-white">{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Mục / Bài học
            </label>
            <select
              value={formData.sectionId || ''}
              onChange={e => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
              className="w-full text-xs font-medium rounded-2xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
            >
              <option value="" className="bg-[#EBECF0] dark:bg-[#1A1E24]">-- Chọn mục --</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id} className="bg-[#EBECF0] dark:bg-[#1A1E24] text-[#2D3748] dark:text-white">{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loại câu hỏi và Mức độ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Loại câu hỏi
            </label>
            <div className="flex neu-inset p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => handleChangeType('mcq')}
                className={`flex-1 py-2 px-3 text-xs font-display font-bold rounded-xl transition cursor-pointer ${
                  formData.type === 'mcq'
                    ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
                }`}
              >
                Trắc nghiệm (MCQ)
              </button>
              <button
                type="button"
                onClick={() => handleChangeType('truefalse')}
                className={`flex-1 py-2 px-3 text-xs font-display font-bold rounded-xl transition cursor-pointer ${
                  formData.type === 'truefalse'
                    ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
                }`}
              >
                Đúng / Sai 4 ý
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Mức độ nhận thức
            </label>
            <select
              value={formData.difficulty}
              onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full text-xs font-medium rounded-2xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
            >
              {DIFFICULTY_LEVELS.map(d => (
                <option key={d.id} value={d.id} className="bg-[#EBECF0] dark:bg-[#1A1E24] text-[#2D3748] dark:text-white">{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cảnh báo trùng lặp nếu phát hiện */}
        {duplicateWarning && (
          <div className="p-3.5 neu-card border border-amber-500/30 bg-amber-500/10 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-bold">Cảnh báo trùng lặp ({duplicateWarning.similarity}% tương đồng):</span>{' '}
              Đã có một câu hỏi tương tự trong hệ thống:
              <p className="mt-1 font-mono italic text-[11px] neu-inset p-2 rounded-xl text-amber-900 dark:text-amber-100">
                "{duplicateWarning.question.stem}"
              </p>
            </div>
          </div>
        )}

        {/* Nội dung câu dẫn (Stem) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8]">
              Nội dung câu hỏi ($math$ hoặc $$block$$):
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-[#FF8800] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
            </button>
          </div>
          <textarea
            rows={3}
            value={formData.stem}
            onChange={e => setFormData(prev => ({ ...prev, stem: e.target.value }))}
            placeholder="Nhập nội dung câu hỏi... Ví dụ: Cho phương trình $x^2 - 4 = 0$..."
            className="w-full text-xs font-medium rounded-2xl neu-inset bg-transparent p-3 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
            required
          />
          {showPreview && formData.stem && (
            <div className="mt-2 p-3 neu-inset rounded-2xl text-xs text-[#2D3748] dark:text-white">
              <span className="text-[10px] font-display font-bold uppercase text-[#FF8800] block mb-1">Xem trước câu dẫn:</span>
              <MathRenderer text={formData.stem} />
            </div>
          )}
        </div>

        {/* Chi tiết theo loại câu hỏi */}
        {formData.type === 'mcq' ? (
          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-2">
              Các phương án trả lời (chọn để đánh dấu đáp án đúng):
            </label>
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div key={letter} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, correct: idx }))}
                    className={`w-8 h-8 rounded-xl font-display font-extrabold text-xs flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                      formData.correct === idx
                        ? 'neu-inset text-[#FF8800] bg-[#FF8800]/15 border border-[#FF8800]/40 shadow-sm scale-105'
                        : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
                    }`}
                  >
                    {letter}
                  </button>
                  <input
                    type="text"
                    value={formData.options?.[idx] || ''}
                    onChange={e => handleMCQOptionChange(idx, e.target.value)}
                    placeholder={`Nội dung phương án ${letter}...`}
                    className="flex-1 text-xs font-medium rounded-xl neu-inset bg-transparent px-3 py-2 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-2">
              4 nhận định phát biểu (đánh dấu Đúng hoặc Sai cho mỗi ý):
            </label>
            <div className="space-y-2.5">
              {(formData.statements || []).map((stmt, idx) => (
                <div key={stmt.label || idx} className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center rounded-xl neu-btn font-display font-extrabold text-xs text-[#2D3748] dark:text-white shrink-0">
                    {stmt.label}
                  </span>
                  <input
                    type="text"
                    value={stmt.text}
                    onChange={e => handleStatementChange(idx, 'text', e.target.value)}
                    placeholder={`Phát biểu ý ${stmt.label}...`}
                    className="flex-1 text-xs font-medium rounded-xl neu-inset bg-transparent px-3 py-2 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
                    required
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatementChange(idx, 'answer', true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                        stmt.answer === true
                          ? 'neu-inset text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                          : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-emerald-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatementChange(idx, 'answer', false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                        stmt.answer === false
                          ? 'neu-inset text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30'
                          : 'neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-rose-500'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Sai
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lời giải thích ngắn */}
        <div>
          <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
            Giải thích chi tiết / Hướng dẫn giải:
          </label>
          <textarea
            rows={2}
            value={formData.explanation}
            onChange={e => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
            placeholder="Giải thích vì sao đáp án đúng, chỉ ra lỗi sai của các phương án nhiễu..."
            className="w-full text-xs font-medium rounded-2xl neu-inset bg-transparent p-3 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
          />
        </div>

        {/* Thẻ tự do */}
        <div>
          <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
            Thẻ từ khóa (phân cách bởi dấu phẩy):
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="Ví dụ: CSDL, khóa chính, định nghĩa"
            className="w-full text-xs font-medium rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-display font-bold rounded-2xl neu-btn text-[#718096] dark:text-[#94A3B8] hover:text-red-500 cursor-pointer active:scale-95 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-display font-extrabold uppercase tracking-wider rounded-2xl neu-btn-primary cursor-pointer active:scale-95 transition"
          >
            {initialQuestion ? 'Lưu Thay Đổi' : 'Thêm Vào Ngân Hàng'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
