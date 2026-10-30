import React, { useState, useEffect } from 'react';
import Header from './components/common/Header.jsx';
import QuestionBank from './components/questions/QuestionBank.jsx';
import SyllabusManager from './components/syllabus/SyllabusManager.jsx';
import ExamManager from './components/exams/ExamManager.jsx';
import PracticeRoom from './components/practice/PracticeRoom.jsx';
import CongNgheGHKIQuiz from './components/practice/CongNgheGHKIQuiz.jsx';
import StatsView from './components/stats/StatsView.jsx';
import SettingsView from './components/settings/SettingsView.jsx';
import NeoLandingPage from './components/landing/NeoLandingPage.jsx';

import { 
  getStoredData, 
  saveAllData, 
  saveSettings 
} from './services/storage.js';
import { generateId } from './types/schema.js';

export default function App() {
  const [data, setData] = useState(() => getStoredData());
  const [activeTab, setActiveTab] = useState('quiz');
  const [theme, setTheme] = useState(() => {
    const saved = getStoredData().settings?.theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [selectedExamForPractice, setSelectedExamForPractice] = useState(null);

  // Áp dụng class dark lên thẻ html
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = (event) => {
    const next = theme === 'dark' ? 'light' : 'dark';

    // Tính toán tọa độ tâm xuất phát từ icon/nút click
    let x = window.innerWidth - 40;
    let y = 32;
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (event && event.clientX) {
      x = event.clientX;
      y = event.clientY;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Nếu trình duyệt hỗ trợ View Transitions API (Chrome 111+, Edge, Safari 18+)
    if (document.startViewTransition) {
      document.documentElement.classList.add('in-theme-transition');

      const transition = document.startViewTransition(() => {
        setTheme(next);
        const updatedSettings = { ...data.settings, theme: next };
        saveSettings(updatedSettings);
        setData(prev => ({ ...prev, settings: updatedSettings }));
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });

      transition.ready.then(() => {
        // Giai đoạn 1: Loang từ tâm icon ra bán kính ~280px trong 0.45s
        // Giai đoạn 2: DỪNG LẠI/NGƯNG 0.4s tại bán kính đó (giữ nguyên clip-path)
        // Giai đoạn 3: Bùng nổ loang hết toàn bộ màn hình trong 0.45s còn lại
        const firstRadius = Math.min(260, endRadius * 0.25);

        const anim = document.documentElement.animate(
          [
            {
              clipPath: `circle(0px at ${x}px ${y}px)`
            },
            {
              clipPath: `circle(${firstRadius}px at ${x}px ${y}px)`,
              offset: 0.35 // 0s -> 0.45s (loang đợt 1)
            },
            {
              clipPath: `circle(${firstRadius}px at ${x}px ${y}px)`,
              offset: 0.68 // 0.45s -> 0.85s (dừng hẳn 0.4s để thấy rõ điểm dừng)
            },
            {
              clipPath: `circle(${endRadius * 1.05}px at ${x}px ${y}px)` // 0.85s -> 1.3s (loang hết màn hình)
            }
          ],
          {
            duration: 1300,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );

        anim.onfinish = () => {
          document.documentElement.classList.remove('in-theme-transition');
        };
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove('in-theme-transition');
      });
      return;
    }

    // Fallback cho trình duyệt cũ
    setTheme(next);
    const updatedSettings = { ...data.settings, theme: next };
    saveSettings(updatedSettings);
    setData(prev => ({ ...prev, settings: updatedSettings }));
  };

  const reloadDataFromStorage = () => {
    setData(getStoredData());
  };

  // Quản lý câu hỏi
  const handleSaveQuestion = (question) => {
    setData(prev => {
      const idx = prev.questions.findIndex(q => q.id === question.id);
      let nextQuestions = [];
      if (idx >= 0) {
        nextQuestions = [...prev.questions];
        nextQuestions[idx] = question;
      } else {
        nextQuestions = [question, ...prev.questions];
      }
      saveAllData({ ...prev, questions: nextQuestions });
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleDeleteQuestion = (questionId) => {
    setData(prev => {
      const nextQuestions = prev.questions.filter(q => q.id !== questionId);
      saveAllData({ ...prev, questions: nextQuestions });
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleCloneQuestion = (q) => {
    const cloned = {
      ...q,
      id: generateId('q'),
      stem: `${q.stem} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    handleSaveQuestion(cloned);
  };

  const handleToggleFavorite = (questionId) => {
    setData(prev => {
      const nextQuestions = prev.questions.map(q => {
        if (q.id === questionId) {
          return { ...q, favorite: !q.favorite };
        }
        return q;
      });
      saveAllData({ ...prev, questions: nextQuestions });
      return { ...prev, questions: nextQuestions };
    });
  };

  // Quản lý môn học
  const handleUpdateSubjects = (newSubjects) => {
    setData(prev => {
      saveAllData({ ...prev, subjects: newSubjects });
      return { ...prev, subjects: newSubjects };
    });
  };

  // Quản lý đề thi
  const handleSaveExam = (exam) => {
    setData(prev => {
      const idx = prev.exams.findIndex(e => e.id === exam.id);
      let nextExams = [];
      if (idx >= 0) {
        nextExams = [...prev.exams];
        nextExams[idx] = exam;
      } else {
        nextExams = [exam, ...prev.exams];
      }
      saveAllData({ ...prev, exams: nextExams });
      return { ...prev, exams: nextExams };
    });
  };

  const handleDeleteExam = (examId) => {
    setData(prev => {
      const nextExams = prev.exams.filter(e => e.id !== examId);
      saveAllData({ ...prev, exams: nextExams });
      return { ...prev, exams: nextExams };
    });
  };

  // Quản lý lượt thi
  const handleSaveAttempt = (attempt) => {
    setData(prev => {
      const nextAttempts = [...prev.attempts, attempt];
      saveAllData({ ...prev, attempts: nextAttempts });
      return { ...prev, attempts: nextAttempts };
    });
  };

  // Bắt đầu luyện tập một đề
  const handleStartPractice = (exam) => {
    setSelectedExamForPractice(exam);
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'practice') setSelectedExamForPractice(null);
          setActiveTab(tab);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        questionCount={data.questions.length}
        examCount={data.exams.length}
      />

      {activeTab === 'landing' ? (
        <NeoLandingPage onEnterApp={() => setActiveTab('quiz')} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {(activeTab === 'quiz' || activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki') && (
            <CongNgheGHKIQuiz
              initialSubjectId={activeTab === 'gdqp_ghki' ? 'sub_gdqp11' : 'sub_congnghe_ghki'}
              allQuestions={data.questions}
              subjects={data.subjects}
              onSaveAttempt={handleSaveAttempt}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionBank
              questions={data.questions}
              subjects={data.subjects}
              onSaveQuestion={handleSaveQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onCloneQuestion={handleCloneQuestion}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'syllabus' && (
            <SyllabusManager
              subjects={data.subjects}
              onUpdateSubjects={handleUpdateSubjects}
              onSaveQuestion={handleSaveQuestion}
              existingQuestions={data.questions}
              geminiApiKey={data.settings.geminiApiKey}
            />
          )}

          {activeTab === 'exams' && (
            <ExamManager
              exams={data.exams}
              questions={data.questions}
              subjects={data.subjects}
              onSaveExam={handleSaveExam}
              onDeleteExam={handleDeleteExam}
              onStartPractice={handleStartPractice}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeRoom
              exams={data.exams}
              questions={data.questions}
              subjects={data.subjects}
              attempts={data.attempts}
              scoringMode={data.settings.scoringMode}
              initialExam={selectedExamForPractice}
              onSaveAttempt={handleSaveAttempt}
              onSaveExam={handleSaveExam}
              onNavigateToStats={() => setActiveTab('stats')}
            />
          )}

          {activeTab === 'stats' && (
            <StatsView
              attempts={data.attempts}
              exams={data.exams}
              questions={data.questions}
              subjects={data.subjects}
              onSaveExam={handleSaveExam}
              onStartPractice={handleStartPractice}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={data.settings}
              onUpdateSettings={(newSettings) => setData(prev => ({ ...prev, settings: newSettings }))}
              onDataReloaded={reloadDataFromStorage}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          )}
        </main>
      )}
    </div>
  );
}
