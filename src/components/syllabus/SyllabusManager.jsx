import React, { useState } from 'react';
import MathRenderer from '../common/MathRenderer.jsx';
import Modal from '../common/Modal.jsx';
import QuestionFormModal from '../questions/QuestionFormModal.jsx';
import { extractTextFromFile, parseSyllabusText } from '../../services/parser.js';
import { 
  generateLocalMCQ, 
  generateLocalTrueFalse, 
  generateQuestionWithGemini 
} from '../../services/questionGenerator.js';
import { generateId, DIFFICULTY_LEVELS } from '../../types/schema.js';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle,
  HelpCircle,
  Zap,
  Bot
} from 'lucide-react';

const SAMPLE_SYLLABUS = `Chương 1: Các định luật chuyển động của Newton
Mục 1.1: Định luật I và Định luật II Newton
- Định luật I Newton: Quán tính là xu hướng của một vật giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều.
- Định luật II Newton: Gia tốc của một vật tỉ lệ thuận với lực tác dụng và tỉ lệ nghịch với khối lượng của vật: $\\vec{a} = \\frac{\\vec{F}}{m}$.
- Khối lượng là đại lượng đặc trưng cho mức quán tính của vật.

Mục 1.2: Định luật III Newton và lực tương hỗ
- Định luật III Newton: Khi vật A tác dụng lên vật B một lực, thì vật B cũng tác dụng lại vật A một lực cùng phương, ngược chiều, cùng độ lớn: $\\vec{F}_{AB} = -\\vec{F}_{BA}$.
- Cặp lực và phản lực là cặp lực trực đối nhưng không cân bằng vì đặt vào hai vật khác nhau.

Chương 2: Động lực học chất điểm và các lực cơ học
Mục 2.1: Lực hấp dẫn và trọng lực
- Định luật vạn vật hấp dẫn: Mọi vật trong vũ trụ đều hút nhau với một lực tỉ lệ thuận với tích hai khối lượng và tỉ lệ nghịch với bình phương khoảng cách: $F_{hd} = G \\frac{m_1 m_2}{r^2}$.
- Trọng lực là trường hợp riêng của lực hấp dẫn tác dụng lên vật gần bề mặt Trái Đất: $\\vec{P} = m\\vec{g}$.
`;

export default function SyllabusManager({
  subjects = [],
  onUpdateSubjects,
  onSaveQuestion,
  existingQuestions = [],
  geminiApiKey = ''
}) {
  const [activeInputTab, setActiveInputTab] = useState('paste'); // 'paste' | 'upload'
  const [rawText, setRawText] = useState('');
  const [subjectName, setSubjectName] = useState('Vật lý 10 - Động học');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState('');
  
  // Trạng thái cấu trúc sau khi nhận diện
  const [parsedSubject, setParsedSubject] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});

  // Cấu hình sinh câu hỏi
  const [generatorEngine, setGeneratorEngine] = useState('local'); // 'local' | 'gemini'
  const [selectedDifficulty, setSelectedDifficulty] = useState('thong_hieu');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Tải mẫu đề cương
  const handleLoadSample = () => {
    setRawText(SAMPLE_SYLLABUS);
    setSubjectName('Vật lý 10 - Cơ học');
  };

  // Xử lý tải file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    setFileError('');
    try {
      const text = await extractTextFromFile(file);
      setRawText(text);
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setSubjectName(nameWithoutExt);
      setActiveInputTab('paste');
    } catch (err) {
      setFileError(err.message || 'Lỗi khi đọc file. Vui lòng dán văn bản trực tiếp.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Phân tích đề cương
  const handleParse = () => {
    if (!rawText.trim()) {
      alert('Vui lòng nhập hoặc tải nội dung đề cương.');
      return;
    }
    const result = parseSyllabusText(rawText, subjectName);
    setParsedSubject(result);
    // Mở rộng tất cả các chương mặc định
    const expanded = {};
    result.chapters.forEach(c => { expanded[c.id] = true; });
    setExpandedChapters(expanded);
  };

  // Lưu môn học vào kho dữ liệu chung
  const handleSaveSubjectToBank = () => {
    if (!parsedSubject) return;
    const existingIndex = subjects.findIndex(s => s.id === parsedSubject.id);
    let newSubjects = [];
    if (existingIndex >= 0) {
      newSubjects = [...subjects];
      newSubjects[existingIndex] = parsedSubject;
    } else {
      newSubjects = [parsedSubject, ...subjects];
    }
    onUpdateSubjects(newSubjects);
    showToast(`Đã lưu cấu trúc môn "${parsedSubject.name}" vào hệ thống!`);
  };

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Tạo câu hỏi từ một Ý hoặc Mục
  const handleGenerateQuestion = async ({ type, chapter, section, pointText = '' }) => {
    setIsGenerating(true);
    try {
      let q = null;
      const contentToUse = pointText || section.content || section.points.join('\n');

      if (generatorEngine === 'gemini' && geminiApiKey) {
        q = await generateQuestionWithGemini({
          apiKey: geminiApiKey,
          type,
          subjectName: parsedSubject?.name || subjectName,
          chapterName: chapter.name,
          sectionName: section.name,
          content: contentToUse,
          difficulty: selectedDifficulty
        });
      } else {
        // Local Rule-based Generator
        if (type === 'mcq') {
          q = generateLocalMCQ({
            subjectId: parsedSubject?.id || '',
            chapterId: chapter.id,
            sectionId: section.id,
            chapterName: chapter.name,
            sectionName: section.name,
            pointText: pointText || section.points?.[0] || section.name,
            difficulty: selectedDifficulty
          });
        } else {
          q = generateLocalTrueFalse({
            subjectId: parsedSubject?.id || '',
            chapterId: chapter.id,
            sectionId: section.id,
            chapterName: chapter.name,
            sectionName: section.name,
            pointText: pointText || section.points?.[0] || section.name,
            extraPoints: section.points?.filter(p => p !== pointText) || [],
            difficulty: selectedDifficulty
          });
        }
      }

      setGeneratedQuestion(q);
      setIsPreviewModalOpen(true);
    } catch (err) {
      alert(`Lỗi khi tạo câu hỏi: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Chỉnh sửa cấu trúc cây (Xóa/Thêm)
  const handleDeleteChapter = (chapId) => {
    if (!confirm('Bạn có chắc muốn xóa chương này?')) return;
    setParsedSubject(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== chapId)
    }));
  };

  const handleDeleteSection = (chapId, secId) => {
    setParsedSubject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => {
        if (c.id !== chapId) return c;
        return {
          ...c,
          sections: c.sections.filter(s => s.id !== secId)
        };
      })
    }));
  };

  const handleAddSection = (chapId) => {
    const secName = prompt('Nhập tên mục mới:');
    if (!secName) return;
    setParsedSubject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => {
        if (c.id !== chapId) return c;
        return {
          ...c,
          sections: [
            ...c.sections,
            {
              id: generateId('sec'),
              name: secName,
              content: '',
              points: []
            }
          ]
        };
      })
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successMessage && (
        <div className="fixed bottom-24 right-6 z-50 neu-card border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4 text-emerald-500" />
          {successMessage}
        </div>
      )}

      {/* Top Banner */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 shadow-[0_8px_20px_rgba(163,177,198,0.4),0_2px_6px_rgba(163,177,198,0.2)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF8800] animate-pulse" />
            <span className="text-[11px] font-display font-extrabold text-[#FF8800] uppercase tracking-wider">
              Trợ lý AI Đề Cương
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight flex items-center gap-2">
            Nhập Đề Cương & Tự Động Sinh Câu Hỏi
          </h2>
          <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] mt-1 max-w-xl">
            Dán nội dung hoặc tải lên file Word/PDF. Hệ thống tự động bóc tách Chương → Mục → Ý và tạo trắc nghiệm thông minh.
          </p>
        </div>

        {/* Engine selector */}
        <div className="flex items-center gap-1 neu-inset p-1 rounded-2xl text-xs shrink-0">
          <button
            onClick={() => setGeneratorEngine('local')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold transition-all cursor-pointer ${
              generatorEngine === 'local'
                ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            AI Ngoại Tuyến
          </button>
          <button
            onClick={() => {
              if (!geminiApiKey) {
                alert('Bạn chưa cài đặt Google Gemini API Key. Bạn có thể nhập key trong tab "Cài đặt & Sao lưu". Ứng dụng sẽ dùng chế độ Ngoại Tuyến.');
                return;
              }
              setGeneratorEngine('gemini');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold transition-all cursor-pointer ${
              generatorEngine === 'gemini'
                ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Gemini AI {geminiApiKey ? '✓' : '(Cần Key)'}
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-4">
        {/* Input Switch Tabs */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div className="flex items-center neu-inset p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveInputTab('paste')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition cursor-pointer ${
                activeInputTab === 'paste'
                  ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                  : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
              }`}
            >
              <FileText className="w-4 h-4" />
              Dán văn bản trực tiếp
            </button>
            <button
              onClick={() => setActiveInputTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition cursor-pointer ${
                activeInputTab === 'upload'
                  ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                  : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Tải lên tệp (.txt, .docx, .pdf)
            </button>
          </div>

          <button
            onClick={handleLoadSample}
            className="text-xs font-display font-bold text-[#FF8800] hover:underline cursor-pointer"
          >
            Nạp đề cương mẫu
          </button>
        </div>

        {/* Subject Name Input */}
        <div>
          <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
            Tên môn học / Chuyên đề:
          </label>
          <input
            type="text"
            value={subjectName}
            onChange={e => setSubjectName(e.target.value)}
            placeholder="Ví dụ: Lịch sử 12, Vật lý 10, Tin học nâng cao..."
            className="w-full text-xs font-medium rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
          />
        </div>

        {/* Tab 1: Paste Text */}
        {activeInputTab === 'paste' ? (
          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Nội dung đề cương:
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Dán toàn bộ văn bản đề cương vào đây... Cấu trúc nhận diện tối ưu: Chương X -> Mục X -> Ý kiến thức gạch đầu dòng..."
              className="w-full text-xs font-mono rounded-2xl neu-inset bg-transparent p-3.5 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50 leading-relaxed"
            />
          </div>
        ) : (
          /* Tab 2: Upload File */
          <div className="border-2 border-dashed border-[#A0AEC0]/40 dark:border-white/10 rounded-[28px] p-8 text-center neu-inset bg-transparent">
            <UploadCloud className="w-10 h-10 text-[#FF8800] mx-auto mb-2" />
            <h4 className="text-sm font-display font-bold text-[#2D3748] dark:text-white">
              Chọn hoặc kéo thả file đề cương vào đây
            </h4>
            <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1 mb-4">
              Hỗ trợ tệp văn bản .txt, tài liệu Word .docx và tài liệu PDF .pdf
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 neu-btn text-[#FF8800] text-xs font-display font-extrabold rounded-2xl active:scale-95 transition">
              <span>{isLoadingFile ? 'Đang trích xuất văn bản...' : 'Chọn Tệp Tin'}</span>
              <input
                type="file"
                accept=".txt,.docx,.pdf"
                onChange={handleFileUpload}
                disabled={isLoadingFile}
                className="hidden"
              />
            </label>
            {fileError && (
              <p className="text-xs text-rose-500 mt-3 font-medium flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileError}
              </p>
            )}
          </div>
        )}

        {/* Action Button: Parse */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neu-btn-primary text-xs font-display font-extrabold uppercase tracking-wider disabled:opacity-50 cursor-pointer active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4" />
            Phân Tích Cấu Trúc Đề Cương
          </button>
        </div>
      </div>

      {/* Parsed Structure Section */}
      {parsedSubject && (
        <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#FF8800]">
                Cấu trúc đề cương đã nhận diện
              </span>
              <h3 className="text-lg font-display font-extrabold text-[#2D3748] dark:text-white flex items-center gap-2">
                {parsedSubject.name}
                <span className="text-xs font-normal text-[#718096] dark:text-[#94A3B8]">({parsedSubject.chapters.length} chương)</span>
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Difficulty selector for generator */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#718096] dark:text-[#94A3B8]">
                <span>Mức độ:</span>
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="rounded-xl neu-inset bg-[#EBECF0] dark:bg-[#1A1E24] px-2.5 py-1 text-[#2D3748] dark:text-white text-xs font-medium focus:outline-none"
                >
                  {DIFFICULTY_LEVELS.map(d => (
                    <option key={d.id} value={d.id} className="bg-[#EBECF0] dark:bg-[#1A1E24] text-[#2D3748] dark:text-white">{d.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveSubjectToBank}
                className="px-4 py-2 rounded-xl neu-btn text-emerald-600 dark:text-emerald-400 font-display font-bold text-xs cursor-pointer active:scale-95 transition"
              >
                Lưu Môn Học Này
              </button>
            </div>
          </div>

          {/* Chapters and Sections Tree */}
          <div className="space-y-3">
            {parsedSubject.chapters.map(chapter => {
              const isExpanded = !!expandedChapters[chapter.id];
              return (
                <div
                  key={chapter.id}
                  className="neu-card rounded-2xl overflow-hidden border border-white/60 dark:border-white/5"
                >
                  {/* Chapter Header */}
                  <div className="flex items-center justify-between p-3.5 bg-black/5 dark:bg-white/5">
                    <button
                      onClick={() => setExpandedChapters(prev => ({ ...prev, [chapter.id]: !prev[chapter.id] }))}
                      className="flex items-center gap-2 font-display font-bold text-xs sm:text-sm text-[#2D3748] dark:text-white text-left flex-1 cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-[#FF8800]" /> : <ChevronRight className="w-4 h-4 text-[#718096]" />}
                      <span>{chapter.name}</span>
                      <span className="text-xs font-normal text-[#718096] dark:text-[#94A3B8]">({chapter.sections.length} mục)</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddSection(chapter.id)}
                        className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-[#718096] hover:text-[#FF8800] cursor-pointer"
                        title="Thêm mục con"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-[#718096] hover:text-rose-500 cursor-pointer"
                        title="Xóa chương"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chapter Sections */}
                  {isExpanded && (
                    <div className="p-3.5 space-y-3">
                      {chapter.sections.length === 0 ? (
                        <p className="text-xs text-[#718096] italic">Chưa có mục nào trong chương này.</p>
                      ) : (
                        chapter.sections.map(section => (
                          <div
                            key={section.id}
                            className="neu-inset rounded-2xl p-3.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h4 className="text-xs font-display font-bold text-[#2D3748] dark:text-white">
                                {section.name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider mr-1">Tạo câu:</span>
                                <button
                                  onClick={() => handleGenerateQuestion({ type: 'mcq', chapter, section })}
                                  disabled={isGenerating}
                                  className="px-2.5 py-1 rounded-xl neu-btn text-[#FF8800] text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3 text-[#FF8800]" />
                                  + Trắc nghiệm
                                </button>
                                <button
                                  onClick={() => handleGenerateQuestion({ type: 'truefalse', chapter, section })}
                                  disabled={isGenerating}
                                  className="px-2.5 py-1 rounded-xl neu-btn text-indigo-500 dark:text-indigo-400 text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-500" />
                                  + Đúng/Sai
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(chapter.id, section.id)}
                                  className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-[#718096] hover:text-rose-500 cursor-pointer"
                                  title="Xóa mục"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Section Points */}
                            {section.points && section.points.length > 0 && (
                              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-[#FF8800]/30">
                                {section.points.map((point, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="flex items-start justify-between gap-2 text-xs text-[#4A5568] dark:text-[#CBD5E1] group py-1 hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-xl transition"
                                  >
                                    <div className="flex-1">
                                      <span className="font-bold text-[#FF8800] mr-1.5">•</span>
                                      <MathRenderer text={point} />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleGenerateQuestion({ type: 'mcq', chapter, section, pointText: point })}
                                        className="text-[10px] px-2 py-0.5 rounded-lg neu-btn text-[#FF8800] font-bold cursor-pointer"
                                      >
                                        MCQ
                                      </button>
                                      <button
                                        onClick={() => handleGenerateQuestion({ type: 'truefalse', chapter, section, pointText: point })}
                                        className="text-[10px] px-2 py-0.5 rounded-lg neu-btn text-indigo-500 font-bold cursor-pointer"
                                      >
                                        Đ/S
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Question Form / Preview Modal */}
      {generatedQuestion && (
        <QuestionFormModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          initialQuestion={generatedQuestion}
          subjects={parsedSubject ? [parsedSubject, ...subjects] : subjects}
          existingQuestions={existingQuestions}
          onSave={(q) => {
            onSaveQuestion(q);
            showToast('Đã lưu câu hỏi thành công vào Ngân hàng!');
          }}
        />
      )}
    </div>
  );
}
