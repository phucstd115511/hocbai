import React from 'react';
import { 
  BookOpen, 
  Layers, 
  FileText, 
  Award, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon,
  Database,
  Shield,
  Wrench,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  questionCount = 0, 
  examCount = 0 
}) {
  const navItems = [
    { 
      id: 'landing', 
      label: 'Giới thiệu Neo', 
      shortLabel: 'Neo', 
      icon: Sparkles 
    },
    { 
      id: 'quiz', 
      label: 'Làm bài thi', 
      shortLabel: 'Làm bài', 
      icon: Award 
    },
    { 
      id: 'questions', 
      label: 'Ngân hàng câu hỏi', 
      shortLabel: 'Ngân hàng', 
      icon: Database, 
      badge: questionCount 
    },
    { 
      id: 'syllabus', 
      label: 'Nhập đề cương', 
      shortLabel: 'Đề cương', 
      icon: BookOpen 
    },
    { 
      id: 'exams', 
      label: 'Tạo & Quản lý đề', 
      shortLabel: 'Tạo đề', 
      icon: FileText, 
      badge: examCount 
    },
    { 
      id: 'stats', 
      label: 'Thống kê', 
      shortLabel: 'Thống kê', 
      icon: BarChart3 
    },
    { 
      id: 'settings', 
      label: 'Cài đặt', 
      shortLabel: 'Cài đặt', 
      icon: Settings 
    },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('quiz')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Học Bài</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Ngân hàng câu hỏi & Ôn luyện thông minh</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isActive 
                        ? 'bg-sky-200 text-sky-800 dark:bg-sky-900 dark:text-sky-200' 
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/60'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.shortLabel || item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
