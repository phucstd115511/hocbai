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
      label: 'Khám phá UI', 
      shortLabel: 'Soft UI', 
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
    <header className="no-print sticky top-0 z-40 bg-[#EBECF0]/90 dark:bg-[#1A1E24]/90 backdrop-blur-md shadow-[0_8px_20px_rgb(163,177,198,0.35)] dark:shadow-[0_8px_20px_rgb(0,0,0,0.5)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Neumorphic Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => setActiveTab('quiz')}
          >
            <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <Zap className="w-6 h-6 text-[#FF8800] fill-[#FF8800] drop-shadow-[0_2px_8px_rgba(255,136,0,0.4)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl text-[#2D3748] dark:text-white tracking-tight">
                  Học<span className="text-[#FF8800]">Bài</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full neu-inset-sm text-[#FF8800]">
                  Soft UI
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#718096] dark:text-[#94A3B8] hidden sm:block">
                Ngân hàng câu hỏi & Ôn luyện thông minh
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Neumorphic Segmented Control Bar */}
          <nav className="hidden lg:flex items-center gap-1 neu-inset p-1.5 rounded-2xl">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'neu-extruded text-[#FF8800] dark:text-[#FF8800] shadow-[4px_4px_8px_rgb(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.7)] dark:shadow-[4px_4px_8px_rgb(14,17,21,0.85),-4px_-4px_8px_rgba(255,255,255,0.05)]'
                      : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white hover:neu-extruded-sm'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF8800]' : 'text-current'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive 
                        ? 'bg-[#FF8800] text-white' 
                        : 'neu-inset-sm text-[#718096] dark:text-[#94A3B8]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Water Ripple Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              className="w-12 h-12 rounded-2xl neu-btn flex items-center justify-center text-[#4A5568] dark:text-[#E2E8F0] hover:text-[#FF8800] dark:hover:text-[#FF8800] transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#FF8800] drop-shadow-[0_0_8px_rgba(255,136,0,0.5)]" />
              ) : (
                <Moon className="w-5 h-5 text-[#4A5568]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center py-2.5 overflow-x-auto gap-1.5 neu-inset rounded-2xl px-2 mb-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'neu-extruded text-[#FF8800]'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.shortLabel || item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
