import React, { useState } from 'react';
import MathRenderer from '../common/MathRenderer.jsx';
import { Printer, ArrowLeft, CheckCircle2, FileCheck, Eye } from 'lucide-react';

export default function PrintView({
  exam,
  questions = [],
  subjects = [],
  onClose
}) {
  const [printMode, setPrintMode] = useState('student'); // 'student' (không đáp án) | 'teacher' (kèm đáp án & giải thích)
  const [examCode, setExamCode] = useState('101');
  const [schoolName, setSchoolName] = useState('TRƯỜNG THPT CHUYÊN');
  const [timeMinutes, setTimeMinutes] = useState(45);
  const [showAnswerSheet, setShowAnswerSheet] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const mcqQuestions = questions.filter(q => q.type === 'mcq');
  const tfQuestions = questions.filter(q => q.type === 'truefalse');
  const saQuestions = questions.filter(q => q.type === 'short_answer');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-12">
      {/* Action Toolbar - Hidden on Print */}
      <div className="no-print sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-md p-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>

          <div className="flex items-center gap-3">
            {/* Mode selection */}
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs">
              <button
                onClick={() => setPrintMode('student')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  printMode === 'student' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Bản học sinh (Không đáp án)
              </button>
              <button
                onClick={() => setPrintMode('teacher')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  printMode === 'teacher' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Bản giáo viên (Kèm đáp án & Lời giải)
              </button>
            </div>

            {/* Answer sheet checkbox */}
            {printMode === 'student' && (
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showAnswerSheet}
                  onChange={e => setShowAnswerSheet(e.target.checked)}
                  className="rounded text-sky-600"
                />
                Kèm phiếu trả lời
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20"
            >
              <Printer className="w-4 h-4" />
              In Đề Thi (Ctrl + P)
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Controls - Configurable in Preview */}
      <div className="no-print max-w-4xl mx-auto mt-4 px-4">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Đơn vị / Trường:</span>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-transparent text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Mã đề thi:</span>
            <input
              type="text"
              value={examCode}
              onChange={e => setExamCode(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-transparent text-xs w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Thời gian (phút):</span>
            <input
              type="number"
              value={timeMinutes}
              onChange={e => setTimeMinutes(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-transparent text-xs w-16"
            />
          </div>
        </div>
      </div>

      {/* A4 Printable Paper Container */}
      <div className="max-w-[210mm] mx-auto mt-6 bg-white text-black p-8 sm:p-12 shadow-xl border border-slate-200 min-h-[297mm] font-serif leading-relaxed text-[11pt]">
        
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div className="w-1/2 text-center pr-4">
            <div className="font-bold uppercase text-[10pt]">{schoolName}</div>
            <div className="font-bold uppercase text-[11pt] mt-1">{exam.name}</div>
            <div className="text-[10pt] italic mt-1">Năm học 2026 - 2027</div>
            <div className="text-[10pt] mt-1 font-semibold">Thời gian làm bài: {timeMinutes} phút</div>
            <div className="text-[9pt] italic">(Không kể thời gian phát đề)</div>
          </div>

          <div className="w-1/2 pl-4 border-l border-slate-300">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[11pt]">MÃ ĐỀ THI: {examCode}</span>
              {printMode === 'teacher' && (
                <span className="px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[9pt] rounded">
                  HƯỚNG DẪN CHẤM
                </span>
              )}
            </div>
            <div className="text-[10pt] space-y-1.5 mt-2">
              <div className="border-b border-dotted border-black pb-1">
                Họ và tên thí sinh: ....................................................
              </div>
              <div className="border-b border-dotted border-black pb-1">
                Số báo danh: ....................... Phòng thi: ......................
              </div>
            </div>
          </div>
        </div>

        {/* Answer Sheet Grid (for student version) */}
        {printMode === 'student' && showAnswerSheet && (
          <div className="mb-6 p-3 border-2 border-black rounded text-[10pt]">
            <div className="font-bold text-center uppercase text-[10.5pt] mb-2">
              PHIẾU TRẢ LỜI TRẮC NGHIỆM
            </div>
            {/* MCQ Answer circles */}
            {mcqQuestions.length > 0 && (
              <div className="mb-2">
                <div className="font-bold text-[9pt] uppercase mb-1">Phần I: Trắc nghiệm nhiều lựa chọn</div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center text-[9pt]">
                  {mcqQuestions.map((_, i) => (
                    <div key={i} className="border border-slate-400 p-0.5 rounded">
                      <div className="font-bold border-b border-slate-200">{i + 1}</div>
                      <div className="text-[8pt] text-slate-500">A B C D</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* True/False Answer grid */}
            {tfQuestions.length > 0 && (
              <div>
                <div className="font-bold text-[9pt] uppercase mb-1">Phần II: Câu trắc nghiệm Đúng / Sai</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9pt]">
                  {tfQuestions.map((_, i) => (
                    <div key={i} className="border border-slate-400 p-1 rounded text-center">
                      <div className="font-bold border-b border-slate-200">Câu {mcqQuestions.length + i + 1}</div>
                      <div className="text-[8pt] flex justify-around mt-0.5">
                        <span>a: Đ/S</span>
                        <span>b: Đ/S</span>
                        <span>c: Đ/S</span>
                        <span>d: Đ/S</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: MCQ QUESTIONS */}
        {mcqQuestions.length > 0 && (
          <div className="mb-6">
            <div className="font-bold text-[11.5pt] uppercase mb-3 bg-slate-100 p-1 border-l-4 border-black">
              PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (Thí sinh chọn 1 đáp án đúng nhất)
            </div>
            <div className="space-y-4">
              {mcqQuestions.map((q, idx) => (
                <div key={q.id} className="question-item-print">
                  <div className="font-semibold text-[11pt] mb-1.5">
                    <span className="font-bold">Câu {idx + 1}: </span>
                    <MathRenderer text={q.stem} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-4 text-[10.5pt]">
                    {q.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isCorrect = optIdx === q.correct;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-start gap-1.5 ${
                            printMode === 'teacher' && isCorrect ? 'font-bold text-red-600 underline' : ''
                          }`}
                        >
                          <span className="font-bold">{letter}.</span>
                          <span><MathRenderer text={opt} /></span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Teacher Explanation */}
                  {printMode === 'teacher' && q.explanation && (
                    <div className="mt-2 ml-4 p-2 bg-slate-50 border-l-2 border-emerald-600 text-[10pt] text-slate-700 italic">
                      <span className="font-bold text-emerald-700 not-italic">Hướng dẫn giải: </span>
                      <MathRenderer text={q.explanation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: TRUE / FALSE QUESTIONS */}
        {tfQuestions.length > 0 && (
          <div className="mb-6">
            <div className="font-bold text-[11.5pt] uppercase mb-3 bg-slate-100 p-1 border-l-4 border-black">
              PHẦN II. Câu trắc nghiệm Đúng / Sai (Thí sinh trả lời Đúng hoặc Sai cho mỗi ý a, b, c, d)
            </div>
            <div className="space-y-4">
              {tfQuestions.map((q, idx) => (
                <div key={q.id} className="question-item-print">
                  <div className="font-semibold text-[11pt] mb-1.5">
                    <span className="font-bold">Câu {mcqQuestions.length + idx + 1}: </span>
                    <MathRenderer text={q.stem} />
                  </div>
                  <div className="space-y-1 pl-4 text-[10.5pt]">
                    {q.statements.map((stmt, sIdx) => {
                      const ansStr = stmt.answer ? 'ĐÚNG' : 'SAI';
                      return (
                        <div key={sIdx} className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className="font-bold mr-1">{stmt.label})</span>
                            <MathRenderer text={stmt.text} />
                          </div>
                          {printMode === 'teacher' && (
                            <span className={`font-bold px-1.5 py-0.2 rounded text-[9.5pt] shrink-0 ${
                              stmt.answer ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                            }`}>
                              [{ansStr}]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Teacher Explanation */}
                  {printMode === 'teacher' && q.explanation && (
                    <div className="mt-2 ml-4 p-2 bg-slate-50 border-l-2 border-emerald-600 text-[10pt] text-slate-700 italic">
                      <span className="font-bold text-emerald-700 not-italic">Hướng dẫn giải: </span>
                      <MathRenderer text={q.explanation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: SHORT ANSWER QUESTIONS */}
        {saQuestions.length > 0 && (
          <div className="mb-6">
            <div className="font-bold text-[11.5pt] uppercase mb-3 bg-slate-100 p-1 border-l-4 border-black">
              PHẦN III. Câu trắc nghiệm yêu cầu trả lời ngắn (Thí sinh ghi đáp án vào ô quy định)
            </div>
            <div className="space-y-4">
              {saQuestions.map((q, idx) => (
                <div key={q.id} className="question-item-print">
                  <div className="font-semibold text-[11pt] mb-1.5">
                    <span className="font-bold">Câu {mcqQuestions.length + tfQuestions.length + idx + 1}: </span>
                    <MathRenderer text={q.stem} />
                  </div>
                  <div className="pl-4 text-[10.5pt]">
                    {printMode === 'teacher' ? (
                      <div className="font-bold text-red-600">
                        Đáp án: {q.correctAnswer || q.answer}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic">
                        Đáp số: ................................................................
                      </div>
                    )}
                  </div>
                  {/* Teacher Explanation */}
                  {printMode === 'teacher' && q.explanation && (
                    <div className="mt-2 ml-4 p-2 bg-slate-50 border-l-2 border-emerald-600 text-[10pt] text-slate-700 italic">
                      <span className="font-bold text-emerald-700 not-italic">Hướng dẫn giải: </span>
                      <MathRenderer text={q.explanation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center font-bold text-[10.5pt] mt-8 pt-4 border-t border-slate-300">
          ---------- HẾT ----------
          <div className="text-[9pt] font-normal italic text-slate-500 mt-1">
            (Cán bộ coi thi không giải thích gì thêm)
          </div>
        </div>
      </div>
    </div>
  );
}
