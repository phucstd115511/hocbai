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
  Sparkles,
  Zap
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
              <BarChart3 className="w-5 h-5 drop-shadow-[0_2px_6px_rgba(255,136,0,0.4)]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight">
              Thống Kê & Phân Tích Năng Lực
            </h2>
          </div>
          <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] ml-13">
            Theo dõi tiến độ, tỷ lệ đúng theo từng chương kiến thức và ôn tập các câu làm sai
          </p>
        </div>

        {summary.totalWrongQuestions > 0 && (
          <button
            onClick={handleCreateAllWrongExam}
            className="neu-btn px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 active:scale-95 transition-all hover:text-rose-500 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
            Tạo Đề Ôn {summary.totalWrongQuestions} Câu Sai
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="neu-card p-6 rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] flex flex-col justify-between transition-all duration-300">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF8800]" />
            Số lần đã luyện tập
          </div>
          <div className="text-3xl font-display font-extrabold text-[#2D3748] dark:text-white mt-1">
            {totalAttempts} <span className="text-xs font-medium text-[#718096] dark:text-[#94A3B8]">lượt làm bài</span>
          </div>
        </div>

        <div className="neu-card p-6 rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] flex flex-col justify-between transition-all duration-300">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#FF8800]" />
            Điểm trung bình
          </div>
          <div className="text-3xl font-display font-extrabold text-[#FF8800] drop-shadow-[0_2px_8px_rgba(255,136,0,0.3)] mt-1">
            {summary.avgPercentage}%
          </div>
        </div>

        <div className="neu-card p-6 rounded-[28px] bg-[#EBECF0] dark:bg-[#1A1E24] flex flex-col justify-between transition-all duration-300">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Số câu cần củng cố
          </div>
          <div className="text-3xl font-display font-extrabold text-rose-500 mt-1">
            {summary.totalWrongQuestions} <span className="text-xs font-medium text-[#718096] dark:text-[#94A3B8]">câu hỏi</span>
          </div>
        </div>
      </div>

      {/* Chapter Breakdown Analysis */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-5 transition-all duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div>
            <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white">
              Tỷ Lệ Đúng Theo Từng Chương Kiến Thức
            </h3>
            <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] mt-0.5">
              Các chương có tỷ lệ thấp dưới 60% được khuyến nghị cần dành thêm thời gian ôn tập
            </p>
          </div>
        </div>

        {chapterAggregate.length === 0 ? (
          <div className="neu-inset p-8 rounded-2xl text-center text-xs text-[#718096] dark:text-[#94A3B8]">
            Chưa có đủ dữ liệu bài thi để thống kê theo chương. Hãy hoàn thành ít nhất 1 bài luyện tập.
          </div>
        ) : (
          <div className="space-y-4">
            {chapterAggregate.map(item => {
              const isWeak = item.percent < 60;
              return (
                <div key={item.chapterName} className="neu-inset p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D3748] dark:text-white flex items-center gap-2">
                      {item.chapterName}
                      {isWeak && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Cần ôn lại
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-[#718096] dark:text-[#94A3B8]">
                      {item.correct} / {item.total} đ ({item.percent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 neu-inset-sm rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.percent >= 80 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : item.percent >= 60 
                            ? 'bg-gradient-to-r from-[#FF8800] to-amber-400' 
                            : 'bg-gradient-to-r from-rose-500 to-orange-500'
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
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-4 transition-all duration-300">
        <h3 className="text-base font-display font-extrabold text-[#2D3748] dark:text-white pb-3 border-b border-black/5 dark:border-white/5">
          Lịch Sử Các Lần Luyện Tập
        </h3>

        {attempts.length === 0 ? (
          <div className="neu-inset p-8 rounded-2xl text-center text-xs text-[#718096] dark:text-[#94A3B8]">
            Chưa có lượt làm bài nào được ghi nhận.
          </div>
        ) : (
          <div className="space-y-3">
            {[...attempts].reverse().map(att => {
              const dateStr = new Date(att.date).toLocaleString('vi-VN');
              const wrongCount = (att.wrongQuestionIds || []).length;

              return (
                <div key={att.id} className="neu-inset p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#2D3748] dark:text-white">
                      {att.examName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#718096] dark:text-[#94A3B8] mt-1.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#FF8800]" /> {dateStr}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#FF8800]" /> {formatDuration(att.durationSeconds)}</span>
                      {wrongCount > 0 ? (
                        <span className="text-rose-500 font-bold">{wrongCount} câu sai</span>
                      ) : (
                        <span className="text-emerald-500 font-bold">Đúng 100%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-display font-extrabold text-[#FF8800]">
                        {att.score} / {att.totalMaxScore}
                      </div>
                      <div className="text-[11px] font-bold text-[#718096] dark:text-[#94A3B8]">
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
