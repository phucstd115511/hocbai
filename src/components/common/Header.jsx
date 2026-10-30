import React, { useRef, useEffect, useState, useCallback } from 'react';
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
 * Advanced motion hook for horizontal navigation:
 * - Fluid velocity-based momentum & kinetic inertia decay on mouse release
 * - Silky-smooth damped mouse wheel scrolling (60/120fps requestAnimationFrame)
 * - Real-time metrics for Neumorphic sliding active indicator pill
 * - Left/right edge fade mask visibility
 * - Smooth auto-centering of active tab
 */
function useHorizontalMotionScroll(activeTabId) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [pillStyle, setPillStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Measure active button and scroll boundaries
  const updateMetrics = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(maxScroll > 0 && el.scrollLeft < maxScroll - 6);

    const activeEl = el.querySelector('[data-active="true"]');
    if (activeEl) {
      setPillStyle({
        left: activeEl.offsetLeft,
        top: activeEl.offsetTop,
        width: activeEl.offsetWidth,
        height: activeEl.offsetHeight,
        opacity: 1,
      });
    } else {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, []);

  // Update metrics on tab changes, mount, and window resize
  useEffect(() => {
    updateMetrics();
    const raf = requestAnimationFrame(updateMetrics);
    const timer = setTimeout(updateMetrics, 120);
    window.addEventListener('resize', updateMetrics);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', updateMetrics);
    };
  }, [activeTabId, updateMetrics]);

  // Smoothly center the active tab into view when activeTabId changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const activeEl = el.querySelector('[data-active="true"]');
    if (activeEl) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 0) {
        const targetScroll = activeEl.offsetLeft - (el.clientWidth / 2) + (activeEl.offsetWidth / 2);
        const clamped = Math.max(0, Math.min(maxScroll, targetScroll));
        el.scrollTo({ left: clamped, behavior: 'smooth' });
      }
    }
  }, [activeTabId]);

  // Motion physics: drag, momentum, smooth wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let momentumRaf = null;
    let wheelTarget = null;
    let wheelRaf = null;

    const stopAllMotion = () => {
      if (momentumRaf) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
      }
      if (wheelRaf) {
        cancelAnimationFrame(wheelRaf);
        wheelRaf = null;
        wheelTarget = null;
      }
    };

    // 1. Silky-Smooth Wheel Scrolling (damped target accumulation)
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      e.preventDefault();
      stopAllMotion();

      if (wheelTarget === null) {
        wheelTarget = el.scrollLeft;
      }
      wheelTarget = Math.max(0, Math.min(maxScroll, wheelTarget + delta * 0.95));

      if (!wheelRaf) {
        const wheelStep = () => {
          const diff = wheelTarget - el.scrollLeft;
          if (Math.abs(diff) > 0.5) {
            el.scrollLeft += diff * 0.16;
            updateMetrics();
            wheelRaf = requestAnimationFrame(wheelStep);
          } else {
            el.scrollLeft = wheelTarget;
            updateMetrics();
            wheelRaf = null;
            wheelTarget = null;
          }
        };
        wheelRaf = requestAnimationFrame(wheelStep);
      }
    };

    // 2. Mouse Drag & Kinetic Momentum Decay
    const onMouseDown = (e) => {
      if (e.button !== 0 && e.button !== 1) return;
      stopAllMotion();
      isDown = true;
      hasDragged = false;
      startX = e.pageX - el.offsetLeft;
      scrollStart = el.scrollLeft;
      lastX = e.pageX;
      lastTime = performance.now();
      velocity = 0;
      if (e.button === 1) e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 4) {
        hasDragged = true;
        setIsDragging(true);
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }
      el.scrollLeft = scrollStart - walk;

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 10) {
        velocity = (e.pageX - lastX) / dt;
        lastX = e.pageX;
        lastTime = now;
      }
      updateMetrics();
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      setIsDragging(false);
      el.style.cursor = '';
      el.style.removeProperty('user-select');
      setTimeout(() => { hasDragged = false; }, 50);

      const now = performance.now();
      // If released while moving with sufficient velocity, glide with momentum
      if (now - lastTime < 80 && Math.abs(velocity) > 0.15) {
        let currentVel = velocity * 16;
        const friction = 0.94; // Deceleration rate

        const momentumStep = () => {
          currentVel *= friction;
          el.scrollLeft -= currentVel;
          updateMetrics();

          const maxScroll = el.scrollWidth - el.clientWidth;
          if (Math.abs(currentVel) > 0.25 && el.scrollLeft > 0 && el.scrollLeft < maxScroll) {
            momentumRaf = requestAnimationFrame(momentumStep);
          } else {
            momentumRaf = null;
          }
        };
        momentumRaf = requestAnimationFrame(momentumStep);
      }
    };

    const onWindowBlur = () => {
      if (isDown) {
        isDown = false;
        setIsDragging(false);
        el.style.cursor = '';
        el.style.removeProperty('user-select');
        hasDragged = false;
      }
    };

    const onClickCapture = (e) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onAuxClick = (e) => {
      if (e.button === 1) e.preventDefault();
    };

    const onScroll = () => {
      updateMetrics();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onWindowBlur);
    el.addEventListener('click', onClickCapture, { capture: true });
    el.addEventListener('auxclick', onAuxClick);
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      stopAllMotion();
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onWindowBlur);
      el.removeEventListener('click', onClickCapture, { capture: true });
      el.removeEventListener('auxclick', onAuxClick);
      el.removeEventListener('scroll', onScroll);
    };
  }, [updateMetrics]);

  return {
    ref: containerRef,
    canScrollLeft,
    canScrollRight,
    pillStyle,
    isDragging,
  };
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  questionCount = 0, 
  examCount = 0 
}) {
  const mobileNav = useHorizontalMotionScroll(activeTab);
  const desktopNav = useHorizontalMotionScroll(activeTab);

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

          {/* Desktop Navigation - Neumorphic Segmented Control Bar with Fluid Motion */}
          <div className="hidden lg:flex relative items-center">
            {/* Left Edge Fade Indicator */}
            <div 
              className={`absolute left-0 top-0 bottom-0 w-6 pointer-events-none rounded-l-2xl z-20 transition-opacity duration-300 bg-gradient-to-r from-[#EBECF0] dark:from-[#1A1E24] to-transparent ${
                desktopNav.canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`} 
            />

            <nav 
              ref={desktopNav.ref}
              className={`flex items-center gap-1 neu-inset p-1.5 rounded-2xl overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none relative transition-transform duration-200 ${
                desktopNav.isDragging ? 'scale-[0.995]' : ''
              }`}
            >
              {/* Sliding Neumorphic Active Pill */}
              {desktopNav.pillStyle.width > 0 && (
                <div 
                  className="absolute top-0 left-0 rounded-xl neu-extruded neu-pill-transition pointer-events-none shadow-[4px_4px_8px_rgb(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.7)] dark:shadow-[4px_4px_8px_rgb(14,17,21,0.85),-4px_-4px_8px_rgba(255,255,255,0.05)]"
                  style={{
                    transform: `translate3d(${desktopNav.pillStyle.left}px, ${desktopNav.pillStyle.top}px, 0)`,
                    width: `${desktopNav.pillStyle.width}px`,
                    height: `${desktopNav.pillStyle.height}px`,
                    opacity: desktopNav.pillStyle.opacity,
                  }}
                />
              )}

              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || 
                  (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

                return (
                  <button
                    key={item.id}
                    data-active={isActive}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer active:scale-95 ${
                      isActive
                        ? (!desktopNav.pillStyle.width ? 'neu-extruded text-[#FF8800]' : 'text-[#FF8800] dark:text-[#FF8800]')
                        : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-[#FF8800] drop-shadow-[0_2px_6px_rgba(255,136,0,0.35)]' : 'text-current'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full transition-colors ${
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

            {/* Right Edge Fade Indicator */}
            <div 
              className={`absolute right-0 top-0 bottom-0 w-6 pointer-events-none rounded-r-2xl z-20 transition-opacity duration-300 bg-gradient-to-l from-[#EBECF0] dark:from-[#1A1E24] to-transparent ${
                desktopNav.canScrollRight ? 'opacity-100' : 'opacity-0'
              }`} 
            />
          </div>

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

        {/* Mobile Navigation Bar with Fluid Motion & Edge Glow */}
        <div className="lg:hidden relative mb-2">
          {/* Left Edge Fade Indicator */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none rounded-l-2xl z-20 transition-opacity duration-300 bg-gradient-to-r from-[#EBECF0] dark:from-[#1A1E24] to-transparent ${
              mobileNav.canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`} 
          />

          <div 
            ref={mobileNav.ref}
            className={`flex items-center py-2.5 overflow-x-auto gap-1.5 neu-inset rounded-2xl px-2 no-scrollbar cursor-grab active:cursor-grabbing select-none relative transition-transform duration-200 ${
              mobileNav.isDragging ? 'scale-[0.995]' : ''
            }`}
          >
            {/* Sliding Neumorphic Active Pill */}
            {mobileNav.pillStyle.width > 0 && (
              <div 
                className="absolute top-0 left-0 rounded-xl neu-extruded neu-pill-transition pointer-events-none shadow-[3px_3px_7px_rgb(163,177,198,0.55),-3px_-3px_7px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_7px_rgb(14,17,21,0.85),-3px_-3px_7px_rgba(255,255,255,0.05)]"
                style={{
                  transform: `translate3d(${mobileNav.pillStyle.left}px, ${mobileNav.pillStyle.top}px, 0)`,
                  width: `${mobileNav.pillStyle.width}px`,
                  height: `${mobileNav.pillStyle.height}px`,
                  opacity: mobileNav.pillStyle.opacity,
                }}
              />
            )}

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'quiz' && (activeTab === 'congnghe_ghki' || activeTab === 'gdqp_ghki' || activeTab === 'practice'));

              return (
                <button
                  key={item.id}
                  data-active={isActive}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 active:scale-95 ${
                    isActive
                      ? (!mobileNav.pillStyle.width ? 'neu-extruded text-[#FF8800]' : 'text-[#FF8800]')
                      : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748] dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#FF8800] drop-shadow-[0_1px_4px_rgba(255,136,0,0.3)]' : ''}`} />
                  <span>{item.shortLabel || item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Edge Fade Indicator */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none rounded-r-2xl z-20 transition-opacity duration-300 bg-gradient-to-l from-[#EBECF0] dark:from-[#1A1E24] to-transparent ${
              mobileNav.canScrollRight ? 'opacity-100' : 'opacity-0'
            }`} 
          />
        </div>
      </div>
    </header>
  );
}
