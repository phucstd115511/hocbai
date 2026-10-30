import React, { useRef, useEffect } from 'react';
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

/**
 * Custom hook providing mouse wheel horizontal scrolling & mouse drag-to-scroll.
 * Supports both left-click drag and middle-click/wheel drag, suppresses click on drag,
 * and leaves touch scrolling native.
 */
function useHorizontalScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 1. Mouse wheel horizontal scrolling
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta !== 0) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          e.preventDefault();
          el.scrollLeft += delta;
        }
      }
    };

    // 2. Mouse drag-to-scroll (supports Left Click and Middle/Wheel Click)
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    const onMouseDown = (e) => {
      // Button 0 (left-click) or Button 1 (middle-click / wheel click)
      if (e.button !== 0 && e.button !== 1) return;
      isDown = true;
      hasDragged = false;
      startX = e.pageX - el.offsetLeft;
      scrollStart = el.scrollLeft;
      if (e.button === 1) {
        e.preventDefault(); // Prevent default middle click autoscroll icon
      }
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 4) {
        hasDragged = true;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }
      el.scrollLeft = scrollStart - walk;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      el.style.removeProperty('user-select');
      setTimeout(() => {
        hasDragged = false;
      }, 50);
    };

    const onWindowBlur = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = '';
        el.style.removeProperty('user-select');
        hasDragged = false;
      }
    };

    // Block click action if user was dragging
    const onClickCapture = (e) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    // Prevent middle-click auxiliary click action
    const onAuxClick = (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onWindowBlur);
    el.addEventListener('click', onClickCapture, { capture: true });
    el.addEventListener('auxclick', onAuxClick);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onWindowBlur);
      el.removeEventListener('click', onClickCapture, { capture: true });
      el.removeEventListener('auxclick', onAuxClick);
    };
  }, []);

  return ref;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  questionCount = 0, 
  examCount = 0 
}) {
  const mobileNavRef = useHorizontalScroll();
  const desktopNavRef = useHorizontalScroll();

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
          <nav 
            ref={desktopNavRef}
            className="hidden lg:flex items-center gap-1 neu-inset p-1.5 rounded-2xl overflow-x-auto no-scrollbar cursor-grab"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer ${
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
        <div 
          ref={mobileNavRef}
          className="lg:hidden flex items-center py-2.5 overflow-x-auto gap-1.5 neu-inset rounded-2xl px-2 mb-2 no-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 ${
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
