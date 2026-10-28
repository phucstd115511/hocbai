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
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Chọn phân loại và chương mục */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="">-- Chọn chương --</option>
              {chapters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mục / Bài học
            </label>
            <select
              value={formData.sectionId || ''}
              onChange={e => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="">-- Chọn mục --</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loại câu hỏi và Mức độ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Loại câu hỏi
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChangeType('mcq')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                  formData.type === 'mcq'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200'
                }`}
              >
                Trắc nghiệm (MCQ)
              </button>
              <button
                type="button"
                onClick={() => handleChangeType('truefalse')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                  formData.type === 'truefalse'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200'
                }`}
              >
                Đúng / Sai 4 ý
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mức độ nhận thức
            </label>
            <select
              value={formData.difficulty}
              onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
            >
              {DIFFICULTY_LEVELS.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cảnh báo trùng lặp nếu phát hiện */}
        {duplicateWarning && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-bold">Cảnh báo trùng lặp ({duplicateWarning.similarity}% tương đồng):</span>{' '}
              Đã có một câu hỏi tương tự trong hệ thống:
              <p className="mt-1 font-mono italic text-[11px] bg-amber-100/70 dark:bg-amber-900/50 p-1.5 rounded">
                "{duplicateWarning.question.stem}"
              </p>
            </div>
          </div>
        )}

        {/* Nội dung câu dẫn (Stem) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nội dung câu hỏi (hỗ trợ công thức $math$ hoặc $$block$$):
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? 'Ẩn xem trước' : 'Xem trước công thức'}
            </button>
          </div>
          <textarea
            rows={3}
            value={formData.stem}
            onChange={e => setFormData(prev => ({ ...prev, stem: e.target.value }))}
            placeholder="Nhập nội dung câu hỏi... Ví dụ: Cho phương trình $x^2 - 4 = 0$..."
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            required
          />
          {showPreview && formData.stem && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Xem trước câu dẫn:</span>
              <MathRenderer text={formData.stem} />
            </div>
          )}
        </div>

        {/* Chi tiết theo loại câu hỏi */}
        {formData.type === 'mcq' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Các phương án trả lời (chọn radio để đánh dấu đáp án đúng):
            </label>
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div key={letter} className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mcq_correct"
                      checked={formData.correct === idx}
                      onChange={() => setFormData(prev => ({ ...prev, correct: idx }))}
                      className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                    />
                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${
                      formData.correct === idx
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {letter}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.options?.[idx] || ''}
                    onChange={e => handleMCQOptionChange(idx, e.target.value)}
                    placeholder={`Nội dung phương án ${letter}...`}
                    className="flex-1 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              4 nhận định phát biểu (đánh dấu Đúng hoặc Sai cho mỗi ý):
            </label>
            <div className="space-y-2.5">
              {(formData.statements || []).map((stmt, idx) => (
                <div key={stmt.label || idx} className="flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs">
                    {stmt.label})
                  </span>
                  <input
                    type="text"
                    value={stmt.text}
                    onChange={e => handleStatementChange(idx, 'text', e.target.value)}
                    placeholder={`Phát biểu ý ${stmt.label}...`}
                    className="flex-1 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    required
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatementChange(idx, 'answer', true)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                        stmt.answer === true
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatementChange(idx, 'answer', false)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                        stmt.answer === false
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
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
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Giải thích chi tiết / Hướng dẫn giải:
          </label>
          <textarea
            rows={2}
            value={formData.explanation}
            onChange={e => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
            placeholder="Giải thích vì sao đáp án đúng, chỉ ra lỗi sai của các phương án nhiễu..."
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
          />
        </div>

        {/* Thẻ tự do */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Thẻ từ khóa (phân cách bởi dấu phẩy):
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="Ví dụ: CSDL, khóa chính, định nghĩa"
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition"
          >
            {initialQuestion ? 'Lưu Thay Đổi' : 'Thêm Vào Ngân Hàng'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
