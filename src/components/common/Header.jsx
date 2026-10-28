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
  Wrench
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
      id: 'congnghe_ghki', 
      label: 'Công Nghệ GHKI', 
      shortLabel: 'Công Nghệ',
      icon: Wrench, 
      isSpecial: true, 
      badgeText: '93 câu', 
      color: 'sky' 
    },
    { 
      id: 'gdqp_ghki', 
      label: 'GDQP&AN 11', 
      shortLabel: 'GDQP 11',
      icon: Shield, 
      isSpecial: true, 
      badgeText: '52 câu', 
      color: 'emerald' 
    },
    { id: 'questions', label: 'Ngân hàng câu hỏi', icon: Database, badge: questionCount },
    { id: 'syllabus', label: 'Nhập đề cương', icon: BookOpen },
    { id: 'exams', label: 'Tạo & Quản lý đề', icon: FileText, badge: examCount },
    { id: 'practice', label: 'Luyện tập chung', icon: Award },
    { id: 'stats', label: 'Thống kê', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt & Sao lưu', icon: Settings },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('questions')}>
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
              const isActive = activeTab === item.id;
              
              if (item.isSpecial) {
                const isEmerald = item.color === 'emerald';
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all mr-1 ${
                      isActive
                        ? isEmerald
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                          : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-400'
                        : isEmerald
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-xs'
                          : 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 shadow-xs'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isEmerald ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}`} />
                    <span>{item.label}</span>
                    <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-md ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : isEmerald
                          ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                          : 'bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100'
                    }`}>
                      {item.badgeText}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shadow-sm'
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
        <div className="md:hidden flex items-center justify-start py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto gap-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isEmerald = item.color === 'emerald';
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 ${
                  item.isSpecial
                    ? isActive
                      ? isEmerald
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-sky-600 text-white font-bold shadow-xs'
                      : isEmerald
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300'
                        : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-300'
                    : isActive
                    ? 'text-sky-600 dark:text-sky-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.shortLabel || item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
