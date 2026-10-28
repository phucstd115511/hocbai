import React from 'react';
import { 
  Zap,
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
      id: 'quiz', 
      label: 'Làm bài thi', 
      shortLabel: 'Làm bài', 
      icon: Award 
    },
    { 
      id: 'landing', 
      label: 'Giới thiệu Neo', 
      shortLabel: 'Giới thiệu', 
      icon: Sparkles 
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
    <header className="no-print sticky top-0 z-40 bg-[#ffe17c] dark:bg-[#171e19] border-b-2 border-black shadow-[0_2px_0_0_#000] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Neo-Brutalist Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('quiz')}>
            <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-6 h-6 text-[#ffe17c] fill-[#ffe17c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cabinet font-extrabold text-xl text-black dark:text-white tracking-tight uppercase">Học Bài</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black text-[#ffe17c] border border-black shadow-[1px_1px_0px_0px_#000]">
                  Neo v2.0
                </span>
              </div>
              <p className="text-[11px] font-bold text-black/75 dark:text-[#b7c6c2] hidden sm:block">Ngân hàng câu hỏi & Ôn luyện thông minh</p>
            </div>
          </div>

          {/* Navigation - Desktop Neo-Brutalist */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-black text-[#ffe17c] border-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white/80 dark:bg-slate-800 text-black dark:text-white border-black/80 hover:bg-white hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffe17c]' : 'text-black dark:text-slate-300'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border border-black ${
                      isActive 
                        ? 'bg-[#ffe17c] text-black' 
                        : 'bg-black text-white'
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
              className="p-2 rounded-xl border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t-2 border-black overflow-x-auto gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition ${
                  isActive
                    ? 'text-black bg-white border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black/70 dark:text-white/70 border-transparent hover:bg-white/50'
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
