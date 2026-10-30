import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Clock, 
  FileText, 
  TrendingUp,
  Cpu,
  Shield,
  Wrench,
  Globe,
  Sliders,
  Palette,
  Heart
} from 'lucide-react';

export default function NeoLandingPage({ onEnterApp }) {
  const [sliderVal, setSliderVal] = useState(65);
  const [toggleActive, setToggleActive] = useState(true);
  const [activeSegment, setActiveSegment] = useState('account');
  const [radioSelected, setRadioSelected] = useState('A');

  return (
    <div className="font-sans text-[#4A5568] dark:text-[#E2E8F0] bg-[#EBECF0] dark:bg-[#1A1E24] min-h-screen selection:bg-[#FF8800] selection:text-white transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-16 lg:py-24 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 neu-inset-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#FF8800]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8800]" />
              <span>Neumorphism (Soft UI) Experience</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-[#2D3748] dark:text-white">
              Light <span className="text-[#FF8800]">Neumorphism</span>
            </h1>

            <p className="text-base sm:text-lg text-[#718096] dark:text-[#94A3B8] font-normal leading-relaxed max-w-2xl">
              A clean, airy interface style using soft shadows and vibrant orange accents. 
              Backgrounds are light gray (<code className="neu-inset-sm px-2 py-0.5 rounded-md text-[#FF8800] font-mono text-sm">#EBECF0</code>), never pure white.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onEnterApp}
                className="neu-btn-primary px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-[6px_6px_14px_rgba(255,136,0,0.35),-6px_-6px_14px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 transition cursor-pointer"
              >
                <span>Vào Học Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#widgets"
                className="neu-btn px-6 py-4 rounded-full text-sm font-bold text-[#4A5568] dark:text-[#E2E8F0] flex items-center gap-2 transition"
              >
                <Sliders className="w-4 h-4 text-[#FF8800]" />
                <span>Xem Demo Widgets</span>
              </a>
            </div>
          </div>

          {/* 2. SECTION: SHADOW PHYSICS (Direct reference to screenshot 0) */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#2D3748] dark:text-white">
                  Shadow Physics
                </h2>
                <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
                  Soft, diffused shadows defining depth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Extruded (Default) */}
              <div className="neu-card p-8 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[180px] bg-[#EBECF0] dark:bg-[#1A1E24]">
                <h3 className="font-display font-bold text-sm text-[#2D3748] dark:text-white">
                  Extruded (Default)
                </h3>
                <span className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1">
                  Resting state
                </span>
              </div>

              {/* Extruded Hover */}
              <div className="neu-card p-8 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[180px] bg-[#EBECF0] dark:bg-[#1A1E24] -translate-y-1 shadow-[12px_12px_20px_rgb(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.8)]">
                <h3 className="font-display font-bold text-sm text-[#2D3748] dark:text-white">
                  Extruded Hover
                </h3>
                <span className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1">
                  Lifted interaction
                </span>
              </div>

              {/* Inset (Pressed) */}
              <div className="neu-inset p-8 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[180px]">
                <h3 className="font-display font-bold text-sm text-[#FF8800]">
                  Inset (Pressed)
                </h3>
                <span className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1">
                  Active / Wells
                </span>
              </div>

              {/* Convex / Concave (Round) */}
              <div className="flex items-center justify-center">
                <div className="w-40 h-40 rounded-full neu-extruded flex flex-col items-center justify-center text-center p-4">
                  <h3 className="font-display font-bold text-sm text-[#2D3748] dark:text-white">
                    Convex / Concave
                  </h3>
                  <span className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1">
                    Complex forms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SECTION: COLOR PALETTE (Direct reference to screenshot 1) */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#2D3748] dark:text-white">
                  Color Palette
                </h2>
                <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
                  Off-white base with energetic orange.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Background */}
              <div className="neu-card p-5 rounded-2xl space-y-3 bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="h-16 rounded-xl bg-[#EBECF0] neu-inset-sm"></div>
                <div>
                  <div className="font-display font-bold text-xs text-[#2D3748] dark:text-white">Background</div>
                  <div className="text-[11px] font-mono text-[#718096] dark:text-[#94A3B8]">#EBECF0</div>
                </div>
              </div>

              {/* Foreground */}
              <div className="neu-card p-5 rounded-2xl space-y-3 bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="h-16 rounded-xl bg-[#4A5568] shadow-inner"></div>
                <div>
                  <div className="font-display font-bold text-xs text-[#2D3748] dark:text-white">Foreground</div>
                  <div className="text-[11px] font-mono text-[#718096] dark:text-[#94A3B8]">#4A5568</div>
                </div>
              </div>

              {/* Muted */}
              <div className="neu-card p-5 rounded-2xl space-y-3 bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="h-16 rounded-xl bg-[#A0AEC0] shadow-inner"></div>
                <div>
                  <div className="font-display font-bold text-xs text-[#2D3748] dark:text-white">Muted</div>
                  <div className="text-[11px] font-mono text-[#718096] dark:text-[#94A3B8]">#A0AEC0</div>
                </div>
              </div>

              {/* Accent */}
              <div className="neu-card p-5 rounded-2xl space-y-3 bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="h-16 rounded-xl bg-[#FF8800] shadow-[0_4px_12px_rgba(255,136,0,0.4)]"></div>
                <div>
                  <div className="font-display font-bold text-xs text-[#FF8800]">Accent</div>
                  <div className="text-[11px] font-mono text-[#718096] dark:text-[#94A3B8]">#FF8800</div>
                </div>
              </div>

              {/* Secondary */}
              <div className="neu-card p-5 rounded-2xl space-y-3 bg-[#EBECF0] dark:bg-[#1A1E24]">
                <div className="h-16 rounded-xl bg-[#E2E8F0] shadow-inner"></div>
                <div>
                  <div className="font-display font-bold text-xs text-[#2D3748] dark:text-white">Secondary</div>
                  <div className="text-[11px] font-mono text-[#718096] dark:text-[#94A3B8]">#E2E8F0</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. SECTION: UI WIDGETS (Direct recreation of screenshot 2) */}
          <div id="widgets" className="space-y-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#2D3748] dark:text-white">
                  UI Widgets
                </h2>
                <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
                  Complex components interacting with the light source.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Widget: Peak Demand Radial Dial & Bar Chart */}
              <div className="lg:col-span-5 neu-card p-8 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-[#718096] dark:text-[#94A3B8] uppercase tracking-wide">
                    Tiến Độ Luyện Thi
                  </span>
                </div>

                {/* Circular Gauge */}
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full neu-inset flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full neu-extruded flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-display font-extrabold text-[#2D3748] dark:text-white">88</span>
                      <span className="text-[10px] font-bold text-[#FF8800] uppercase">Điểm cao</span>
                    </div>
                  </div>
                  {/* Gauge Arc Graphic */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="66" fill="transparent" stroke="#E2E8F0" strokeWidth="6" opacity="0.3" />
                    <circle cx="80" cy="80" r="66" fill="transparent" stroke="#FF8800" strokeWidth="6" strokeDasharray="414" strokeDashoffset="80" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Bar Graph */}
                <div className="pt-2">
                  <div className="flex items-end justify-between gap-2 h-24 px-4 pb-2">
                    {[
                      { day: 'T2', h: '40%' },
                      { day: 'T3', h: '55%' },
                      { day: 'T4', h: '30%' },
                      { day: 'T5', h: '95%', active: true },
                      { day: 'T6', h: '70%' },
                      { day: 'T7', h: '45%' },
                      { day: 'CN', h: '60%' }
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div 
                          className={`w-3.5 rounded-full transition-all duration-300 ${
                            bar.active 
                              ? 'bg-[#FF8800] shadow-[0_2px_8px_rgba(255,136,0,0.5)]' 
                              : 'neu-inset-sm bg-[#A0AEC0]/40'
                          }`}
                          style={{ height: bar.h }}
                        />
                        <span className={`text-[10px] font-bold ${bar.active ? 'text-[#FF8800]' : 'text-[#718096]'}`}>
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account / Client Segments */}
                <div className="neu-inset p-1.5 rounded-2xl flex items-center gap-1">
                  <button
                    onClick={() => setActiveSegment('account')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                      activeSegment === 'account'
                        ? 'neu-extruded text-[#FF8800]'
                        : 'text-[#718096] dark:text-[#94A3B8]'
                    }`}
                  >
                    HỌC SINH
                  </button>
                  <button
                    onClick={() => setActiveSegment('client')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                      activeSegment === 'client'
                        ? 'neu-extruded text-[#FF8800]'
                        : 'text-[#718096] dark:text-[#94A3B8]'
                    }`}
                  >
                    GIÁO VIÊN
                  </button>
                </div>
              </div>

              {/* Right Widget: Forms, Sliders, Buttons, Inputs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Carved Input Wells */}
                <div className="neu-card p-8 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-display font-bold text-[#2D3748] dark:text-white uppercase tracking-wider">
                      Họ và tên thí sinh
                    </label>
                    <input 
                      type="text" 
                      defaultValue="Nguyễn Văn An" 
                      className="neu-input w-full px-5 py-3.5 text-sm font-medium"
                      placeholder="Nhập tên..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-display font-bold text-[#2D3748] dark:text-white uppercase tracking-wider">
                      Môn học cần ôn luyện
                    </label>
                    <div className="relative">
                      <select className="neu-input w-full px-5 py-3.5 text-sm font-medium appearance-none cursor-pointer">
                        <option>Công Nghệ 11 (Cơ Khí) - 93 câu</option>
                        <option>Giáo Dục Quốc Phòng & An Ninh 11 - 52 câu</option>
                        <option>Địa Lí 11 - 51 câu</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#718096]">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#2D3748] dark:text-white">Mục tiêu điểm số</span>
                      <span className="text-[#FF8800]">{sliderVal} / 100%</span>
                    </div>
                    <div className="relative flex items-center h-6">
                      <div className="w-full h-2.5 rounded-full neu-inset-sm relative overflow-hidden">
                        <div 
                          className="h-full bg-[#FF8800] rounded-full transition-all"
                          style={{ width: `${sliderVal}%` }}
                        />
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sliderVal}
                        onChange={(e) => setSliderVal(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Toggle Switch & Radio Options */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#2D3748] dark:text-white">Tự động chấm:</span>
                      <button 
                        onClick={() => setToggleActive(!toggleActive)}
                        className={`w-14 h-7 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                          toggleActive ? 'neu-inset' : 'neu-inset-sm'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                          toggleActive 
                            ? 'translate-x-7 bg-[#FF8800] shadow-[0_2px_6px_rgba(255,136,0,0.5)]' 
                            : 'translate-x-0 neu-extruded bg-[#EBECF0] dark:bg-[#1A1E24]'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {['A', 'B', 'C'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setRadioSelected(opt)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            radioSelected === opt
                              ? 'neu-inset text-[#FF8800] ring-2 ring-[#FF8800]'
                              : 'neu-extruded text-[#718096]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tactile Button Actions */}
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={onEnterApp}
                      className="flex-1 neu-btn-primary py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-center"
                    >
                      BẮT ĐẦU LÀM BÀI
                    </button>

                    <button className="w-12 h-12 rounded-full neu-btn flex items-center justify-center text-[#FF8800]">
                      <Heart className="w-5 h-5 fill-[#FF8800]" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 5. 3 SUBJECT OVERVIEW CARDS */}
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-display font-extrabold text-[#2D3748] dark:text-white">
              Đề Cương Môn Học Có Sẵn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Công Nghệ 11 */}
              <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-[#2D3748] dark:text-white">
                      Công Nghệ 11 (Cơ Khí)
                    </h3>
                    <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Trọn bộ 93 câu hỏi kiểm tra Giữa HKI (83 câu trắc nghiệm nhiều lựa chọn + 10 câu đúng/sai 4 ý).
                    </p>
                  </div>
                </div>
                <button
                  onClick={onEnterApp}
                  className="w-full neu-btn py-3 rounded-2xl text-xs font-bold text-[#FF8800] hover:neu-card transition"
                >
                  Làm Bài Thi (93 câu)
                </button>
              </div>

              {/* Card 2: GDQP&AN 11 */}
              <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-[#2D3748] dark:text-white">
                      GDQP & AN 11
                    </h3>
                    <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Trọn bộ 52 câu trắc nghiệm khách quan chuẩn đề cương THPT Giữa Học Kì I.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onEnterApp}
                  className="w-full neu-btn py-3 rounded-2xl text-xs font-bold text-[#FF8800] hover:neu-card transition"
                >
                  Làm Bài Thi (52 câu)
                </button>
              </div>

              {/* Card 3: Địa Lí 11 */}
              <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-[#2D3748] dark:text-white">
                      Địa Lí 11
                    </h3>
                    <p className="text-xs text-[#718096] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Trọn bộ 51 câu hỏi (35 câu trắc nghiệm + 8 câu đúng/sai + 8 câu trả lời ngắn tính số liệu).
                    </p>
                  </div>
                </div>
                <button
                  onClick={onEnterApp}
                  className="w-full neu-btn py-3 rounded-2xl text-xs font-bold text-[#FF8800] hover:neu-card transition"
                >
                  Làm Bài Thi (51 câu)
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-black/5 dark:border-white/5 text-center text-xs text-[#718096] dark:text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-display font-bold text-sm text-[#2D3748] dark:text-white">
            Học<span className="text-[#FF8800]">Bài</span> • Neumorphism (Soft UI) Edition
          </p>
          <p>© 2026 Học Bài. Thiết kế theo tiêu chuẩn Soft UI Neumorphism hiện đại.</p>
        </div>
      </footer>

    </div>
  );
}
