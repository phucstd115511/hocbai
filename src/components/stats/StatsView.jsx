import React, { useMemo } from 'react';
import { getUniqueWrongQuestionIds } from '../../services/practiceService.js';
import { createNewExam } from '../../services/examService.js';
import { 
  BarChart3, 
  Award, 
  RotateCcw, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function StatsView({
  attempts = [],
  exams = [],
  questions = [],
  subjects = [],
  onSaveExam,
  onStartPractice
}) {
  const totalAttempts = attempts.length;

  // Tổng hợp thống kê
  const summary = useMemo(() => {
    if (attempts.length === 0) {
      return { avgScore: 0, avgPercentage: 0, totalWrongQuestions: 0 };
    }

    const totalPercentage = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
    const avgPercentage = Math.round(totalPercentage / attempts.length);
    const wrongIds = getUniqueWrongQuestionIds(attempts);

    return {
      avgPercentage,
      totalWrongQuestions: wrongIds.length
    };
  }, [attempts]);

  // Tổng hợp tỷ lệ đúng theo từng chương qua mọi lần thi
  const chapterAggregate = useMemo(() => {
    const agg = {};

    attempts.forEach(att => {
      if (att.chapterBreakdown) {
        Object.entries(att.chapterBreakdown).forEach(([chName, stats]) => {
          if (!agg[chName]) {
            agg[chName] = { correct: 0, total: 0 };
          }
          agg[chName].correct += stats.correct || 0;
          agg[chName].total += stats.total || 0;
        });
      }
    });

    return Object.entries(agg).map(([chName, stats]) => {
      const percent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return {
        chapterName: chName,
        correct: Math.round(stats.correct * 10) / 10,
        total: Math.round(stats.total * 10) / 10,
        percent
      };
    }).sort((a, b) => a.percent - b.percent); // xếp từ yếu nhất đến tốt nhất
  }, [attempts]);

  // Tạo đề câu sai từ tất cả các lần thi
  const handleCreateAllWrongExam = () => {
    const wrongIds = getUniqueWrongQuestionIds(attempts);
    if (wrongIds.length === 0) {
      alert('Không có câu hỏi sai nào trong lịch sử luyện tập.');
      return;
    }

    const newExam = createNewExam({
      name: `Đề Ôn Tập Toàn Diện Câu Sai (${wrongIds.length} câu)`,
      description: `Tổng hợp tất cả các câu hỏi từng làm sai trong ${attempts.length} lượt thi đã qua`,
      questionIds: wrongIds
    });

    onSaveExam(newExam);
    onStartPractice(newExam);
  };

  const formatDuration = (secs = 0) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Thống Kê Luyện Tập & Phân Tích Năng Lực
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi tiến độ, tỷ lệ đúng theo từng chương kiến thức và ôn tập các câu làm sai
          </p>
        </div>

        {summary.totalWrongQuestions > 0 && (
          <button
            onClick={handleCreateAllWrongExam}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            Tạo Đề Ôn {summary.totalWrongQuestions} Câu Sai
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Số lần đã luyện tập
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalAttempts} <span className="text-xs font-normal text-slate-400">lượt làm bài</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Điểm trung bình
          </div>
          <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
            {summary.avgPercentage}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Số câu cần củng cố lại
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {summary.totalWrongQuestions} <span className="text-xs font-normal text-slate-400">câu hỏi</span>
          </div>
        </div>
      </div>

      {/* Chapter Breakdown Analysis */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tỷ Lệ Đúng Theo Từng Chương Kiến Thức
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Các chương có tỷ lệ thấp dưới 60% được khuyến nghị cần dành thêm thời gian ôn tập.
            </p>
          </div>
        </div>

        {chapterAggregate.length === 0 ? (
          <div className="text-center p-8 text-xs text-slate-400">
            Chưa có đủ dữ liệu bài thi để thống kê theo chương. Hãy hoàn thành ít nhất 1 bài luyện tập.
          </div>
        ) : (
          <div className="space-y-4">
            {chapterAggregate.map(item => {
              const isWeak = item.percent < 60;
              return (
                <div key={item.chapterName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {item.chapterName}
                      {isWeak && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Cần ôn lại
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {item.correct} / {item.total} đ ({item.percent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.percent >= 80 ? 'bg-emerald-500' : item.percent >= 60 ? 'bg-sky-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attempts History */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Lịch Sử Các Lần Luyện Tập
        </h3>

        {attempts.length === 0 ? (
          <div className="text-center p-8 text-xs text-slate-400">
            Chưa có lượt làm bài nào được ghi nhận.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...attempts].reverse().map(att => {
              const dateStr = new Date(att.date).toLocaleString('vi-VN');
              const wrongCount = (att.wrongQuestionIds || []).length;

              return (
                <div key={att.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {att.examName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(att.durationSeconds)}</span>
                      {wrongCount > 0 ? (
                        <span className="text-rose-500 font-semibold">{wrongCount} câu sai</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">Đúng 100%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-sky-600 dark:text-sky-400">
                        {att.score} / {att.totalMaxScore}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ({att.percentage}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
