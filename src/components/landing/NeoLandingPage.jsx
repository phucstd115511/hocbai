import React from 'react';
import { 
  Zap, 
  ArrowRight, 
  Check, 
  X, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  BarChart2, 
  Clock, 
  FileText, 
  Layers, 
  Flame, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Users
} from 'lucide-react';

export default function NeoLandingPage({ onEnterApp }) {
  const brandLogos = [
    'ACME CORP',
    'GLOBEX TECH',
    'SOYLENT AI',
    'INITECH LABS',
    'UMBRELLA EDU',
    'MASSIVE DYNAMIC',
    'HOOLY EDUTECH',
    'WAYNE EDUSYS'
  ];

  return (
    <div className="font-satoshi text-black bg-white min-h-screen selection:bg-black selection:text-[#ffe17c]">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 h-20 bg-[#ffe17c] border-b-2 border-black flex items-center px-4 sm:px-8 justify-between">
        <div className="flex items-center gap-3">
          {/* Logo with a 10x10 black square icon containing a #ffe17c bolt */}
          <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <Zap className="w-6 h-6 text-[#ffe17c] fill-[#ffe17c]" />
          </div>
          <span className="font-cabinet font-extrabold text-2xl tracking-tight uppercase">
            HOCBAI.AI
          </span>
          <span className="hidden sm:inline-block bg-[#171e19] text-[#ffe17c] text-[10px] font-bold px-2 py-0.5 border border-black uppercase tracking-wider">
            v2.0 Neo
          </span>
        </div>

        {/* Center Links in bold Satoshi */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm tracking-wide">
          <a href="#features" className="hover:underline underline-offset-4 decoration-2">Tính năng</a>
          <a href="#solution" className="hover:underline underline-offset-4 decoration-2">Giải pháp</a>
          <a href="#how-it-works" className="hover:underline underline-offset-4 decoration-2">Quy trình</a>
          <a href="#personas" className="hover:underline underline-offset-4 decoration-2">Đối tượng</a>
          <a href="#testimonials" className="hover:underline underline-offset-4 decoration-2">Đánh giá</a>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onEnterApp}
            className="neo-btn bg-[#171e19] text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <span>Vào Học Ngay</span>
            <ArrowRight className="w-4 h-4 text-[#ffe17c]" />
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative bg-[#ffe17c] border-b-2 border-black py-16 lg:py-24 px-4 sm:px-8 overflow-hidden">
        {/* 32px x 32px radial dot pattern (opacity 10%) */}
        <div className="absolute inset-0 neo-dot-pattern opacity-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badge: Pill-shaped, white, 2px border */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border-2 border-black neo-shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
              <span className="font-extrabold text-xs tracking-wider uppercase">
                NEW: AI Content Assistant 2.0
              </span>
            </div>

            {/* Heading: Cabinet Grotesk 8xl, black, with one keyword using -webkit-text-stroke: 2px black and transparent fill */}
            <h1 className="font-cabinet font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tighter text-black uppercase">
              ÔN LUYỆN <br />
              <span className="neo-stroke-text">THÔNG MINH</span> <br />
              ĐIỂM SỐ BỨT PHÁ
            </h1>

            <p className="font-medium text-base sm:text-xl text-black/85 max-w-xl leading-relaxed">
              Hệ thống ngân hàng đề thi thế hệ mới dành cho học sinh THPT: Công nghệ 11, GDQP&AN 11, Địa Lí 11. 
              Trải nghiệm thi trực tuyến không lộ trước đáp án, chuẩn format thi tốt nghiệp 2026.
            </p>

            {/* CTA Group */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {/* Primary Black Button with 8px hard shadow */}
              <button
                onClick={onEnterApp}
                className="neo-btn-lg bg-[#171e19] text-white px-8 py-4 rounded-xl font-cabinet font-extrabold text-base tracking-wide uppercase flex items-center gap-3 cursor-pointer"
              >
                <span>Bắt Đầu Làm Đề Ngay</span>
                <ArrowRight className="w-5 h-5 text-[#ffe17c]" />
              </button>

              {/* Secondary White Button with 4px hard shadow */}
              <a
                href="#features"
                className="neo-btn bg-white text-black px-6 py-4 rounded-xl font-bold text-sm tracking-wide uppercase cursor-pointer"
              >
                Khám Phá Tính Năng
              </a>
            </div>

            {/* Mini Trust Stats */}
            <div className="pt-6 flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-black/80">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" /> Miễn phí 100%
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" /> 196+ Câu hỏi chuẩn
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" /> In đề thi giấy A4
              </div>
            </div>
          </div>

          {/* Right Column: Browser Mockup */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-black rounded-2xl neo-shadow-xl overflow-hidden">
              {/* Header bar: Background black, 3 circles */}
              <div className="bg-[#171e19] px-4 py-3 flex items-center justify-between border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] border border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e] border border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#28c840] border border-black" />
                </div>
                <div className="text-[11px] font-mono text-[#b7c6c2] font-bold px-3 py-0.5 rounded bg-black/40 border border-[#b7c6c2]/20">
                  app.hocbai.ai/quiz
                </div>
              </div>

              {/* Content area: Grid layout with sage #b7c6c2 and charcoal #171e19 internal cards */}
              <div className="p-6 bg-white space-y-4">
                
                {/* Active Test Card in Sage #b7c6c2 */}
                <div className="bg-[#b7c6c2] border-2 border-black p-4 rounded-xl neo-shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase bg-[#171e19] text-white px-2 py-0.5 rounded">
                      Đang thi trực tiếp
                    </span>
                    <span className="font-mono font-bold text-xs text-black flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 38:42
                    </span>
                  </div>
                  <h4 className="font-cabinet font-extrabold text-base text-black">
                    Địa Lí 11 • Giữa Học Kì I (2026)
                  </h4>
                  <div className="w-full bg-white h-2.5 border border-black rounded-full overflow-hidden">
                    <div className="bg-[#171e19] h-full w-[65%]" />
                  </div>
                  <p className="text-[11px] font-bold text-black/80 flex justify-between">
                    <span>Đã làm: 34/51 câu</span>
                    <span>Tiến độ: 65%</span>
                  </p>
                </div>

                {/* Dashboard Stats in Charcoal #171e19 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#171e19] text-white p-3.5 rounded-xl border-2 border-black neo-shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-[#b7c6c2] uppercase tracking-wider block">
                      Điểm Trung Bình
                    </span>
                    <div className="font-cabinet font-extrabold text-3xl text-[#ffe17c]">
                      9.4<span className="text-sm text-white">/10</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +18% so với tuần trước
                    </span>
                  </div>

                  <div className="bg-[#ffe17c] p-3.5 rounded-xl border-2 border-black neo-shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                      Đề Hoàn Thành
                    </span>
                    <div className="font-cabinet font-extrabold text-3xl text-black">
                      48<span className="text-sm font-medium"> đề</span>
                    </div>
                    <span className="text-[10px] text-black/80 font-bold block">
                      Tỉ lệ đúng 92.5%
                    </span>
                  </div>
                </div>

                {/* Mini Question Item */}
                <div className="bg-white border-2 border-black p-3 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-black">Câu 12: Động cơ đốt trong 4 kì là gì?</span>
                  <div className="grid grid-cols-2 gap-1.5 font-bold text-[11px]">
                    <div className="p-1.5 bg-[#ffe17c] border border-black rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> A. Nạp - Nén - Cháy - Thải
                    </div>
                    <div className="p-1.5 bg-slate-100 border border-slate-300 rounded text-slate-500">
                      B. Nạp - Cháy - Nén
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SOCIAL PROOF MARQUEE */}
      <section className="bg-[#171e19] border-b-2 border-black py-4 overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 font-cabinet font-extrabold text-2xl tracking-wider text-[#b7c6c2] opacity-70 uppercase">
          {brandLogos.concat(brandLogos).map((brand, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>{brand}</span>
              <span className="text-[#ffe17c] text-xl">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* 4. PROBLEM VS SOLUTION */}
      <section id="solution" className="py-20 px-4 sm:px-8 bg-white max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="font-cabinet font-extrabold text-4xl sm:text-5xl uppercase tracking-tight text-black">
            VÌ SAO NÊN THAY ĐỔI CÁCH ÔN THI TRUYỀN THỐNG?
          </h2>
          <p className="text-black/70 font-medium text-base sm:text-lg">
            Học vẹt đề cương có sẵn đáp án khiến bạn chủ quan và dễ nhầm lẫn khi bước vào phòng thi chính thức.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card A: Problem (#f4f4f5, 2px dashed gray border, 70% opacity) */}
          <div className="bg-[#f4f4f5] neo-border-dashed p-8 rounded-3xl opacity-75 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border-2 border-rose-300">
                <X className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-slate-700 uppercase">
                Cách Ôn Thi Cũ (File Word/PDF)
              </h3>
              <ul className="space-y-3.5 text-sm sm:text-base font-medium text-slate-600">
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Đáp án gạch chân sẵn, học thuộc lòng mà không kích hoạt tư duy phản xạ.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Không có đồng hồ bấm giờ, không tạo được áp lực phòng thi thật.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Khó thống kê xem mình hay sai ở chương nào, dạng câu nào.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Dễ bị thất lạc tài liệu, file word cồng kềnh khó mở trên di động.</span>
                </li>
              </ul>
            </div>
            <div className="p-3 bg-white/60 border border-slate-300 rounded-xl text-xs font-bold text-slate-500 uppercase">
              Hiệu quả ghi nhớ chỉ đạt dưới 40%
            </div>
          </div>

          {/* Card B: Solution (#ffe17c, 2px solid black border, 8px hard shadow) */}
          <div className="bg-[#ffe17c] neo-border neo-shadow-lg p-8 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-black text-[#ffe17c] flex items-center justify-center border-2 border-black">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-black uppercase">
                HocBai Neo-System 2.0
              </h3>
              <ul className="space-y-3.5 text-sm sm:text-base font-bold text-black">
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[3]" />
                  <span>Ẩn 100% đáp án khi làm bài, chỉ hiện điểm và giải thích khi nhấn Nộp bài.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[3]" />
                  <span>Đồng hồ đếm thời gian thực kèm tính năng in đề A4 cho giáo viên/học sinh.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[3]" />
                  <span>Hỗ trợ đầy đủ 3 dạng thi: MCQ 1 đáp án, Đúng/Sai 4 ý, Trả lời ngắn điền số.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[3]" />
                  <span>Lưu lịch sử bài thi cục bộ an toàn, hoạt động mượt mà không cần mạng.</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onEnterApp}
              className="neo-btn bg-black text-[#ffe17c] p-3.5 rounded-xl text-xs sm:text-sm font-cabinet font-extrabold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center gap-2"
            >
              Trải Nghiệm Hệ Thống Mới Ngay <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. FEATURE GRID */}
      <section id="features" className="bg-[#ffe17c] border-y-2 border-black py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-cabinet font-extrabold text-4xl sm:text-5xl uppercase tracking-tight text-black">
              TÍNH NĂNG VƯỢT TRỘI
            </h2>
            <p className="font-medium text-black/80">
              Được thiết kế tinh chỉnh cho học sinh THPT và giáo viên ôn tập bám sát chương trình mới.
            </p>
          </div>

          {/* 3-column grid of white cards: 2px border, 4px hard shadow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white neo-border neo-shadow-md p-6 rounded-2xl group transition">
              {/* 16x16 icon box in #b7c6c2 that turns #ffe17c on hover */}
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] transition border-2 border-black rounded-xl flex items-center justify-center mb-6">
                <Layers className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl text-black uppercase mb-2">
                Trọn Bộ 3 Môn Học
              </h3>
              <p className="text-black/75 text-sm leading-relaxed font-medium">
                Gộp đề gọn gàng: Công nghệ 11 (93 câu), GDQP&AN 11 (52 câu), Địa Lí 11 (51 câu). Bấm là làm ngay, không chia nhỏ gây rối mắt.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white neo-border neo-shadow-md p-6 rounded-2xl group transition">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] transition border-2 border-black rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl text-black uppercase mb-2">
                Chuẩn Định Dạng 2026
              </h3>
              <p className="text-black/75 text-sm leading-relaxed font-medium">
                Bao gồm cả trắc nghiệm Đúng/Sai 4 ý chấm điểm THPT lũy tiến và phần trả lời ngắn điền số thập phân thông minh.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white neo-border neo-shadow-md p-6 rounded-2xl group transition">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] transition border-2 border-black rounded-xl flex items-center justify-center mb-6">
                <BarChart2 className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl text-black uppercase mb-2">
                Chấm Điểm & Lời Giải
              </h3>
              <p className="text-black/75 text-sm leading-relaxed font-medium">
                Ngay khi nộp bài, hệ thống hiển thị chi tiết số câu đúng, câu sai, điểm số quy đổi thang 10 kèm lời giải chuẩn xác.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (Dark Mode Section: #171e19) */}
      <section id="how-it-works" className="bg-[#171e19] text-white py-20 px-4 sm:px-8 border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-cabinet font-extrabold text-4xl sm:text-5xl uppercase tracking-tight text-white">
              QUY TRÌNH 3 BƯỚC ĐƠN GIẢN
            </h2>
            <p className="text-[#b7c6c2] font-medium">
              Từ lúc mở web đến khi đạt điểm 10 trọn vẹn chỉ mất vài cú nhấp chuột.
            </p>
          </div>

          {/* 3-step horizontal flow connected by a dark gray #272727 horizontal line */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-1 bg-[#272727] z-0" />

            {/* Step 1: Sage Glow */}
            <div className="relative z-10 text-center space-y-4 flex flex-col items-center">
              {/* Large 24x24 (6rem) circle with 4px colored glow border */}
              <div className="w-24 h-24 rounded-full bg-[#171e19] border-4 border-[#b7c6c2] flex items-center justify-center font-cabinet font-extrabold text-3xl text-[#b7c6c2] shadow-[0_0_15px_rgba(183,198,194,0.4)]">
                01
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl uppercase text-white">
                Chọn Môn Học
              </h3>
              <p className="text-[#b7c6c2] text-sm max-w-xs font-medium">
                Chọn ngay Công nghệ 11, GDQP&AN 11 hoặc Địa Lí 11 từ thanh công cụ gom môn trên đầu trang.
              </p>
            </div>

            {/* Step 2: Yellow Glow */}
            <div className="relative z-10 text-center space-y-4 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#171e19] border-4 border-[#ffe17c] flex items-center justify-center font-cabinet font-extrabold text-3xl text-[#ffe17c] shadow-[0_0_15px_rgba(255,225,124,0.4)]">
                02
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl uppercase text-[#ffe17c]">
                Tự Luyện & Bấm Giờ
              </h3>
              <p className="text-[#b7c6c2] text-sm max-w-xs font-medium">
                Làm bài thi độc lập với chế độ cuộn toàn đề hoặc chế độ từng câu. Đồng hồ bấm giờ chuẩn 45 phút.
              </p>
            </div>

            {/* Step 3: White Glow */}
            <div className="relative z-10 text-center space-y-4 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#171e19] border-4 border-white flex items-center justify-center font-cabinet font-extrabold text-3xl text-white shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                03
              </div>
              <h3 className="font-cabinet font-extrabold text-2xl uppercase text-white">
                Nộp Bài & Sửa Lỗi
              </h3>
              <p className="text-[#b7c6c2] text-sm max-w-xs font-medium">
                Xem điểm số tức thì, kiểm tra các câu bị sai và đọc hướng dẫn giải chi tiết để khắc sâu kiến thức.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. USE CASE PERSONAS */}
      <section id="personas" className="py-20 px-4 sm:px-8 bg-white max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-cabinet font-extrabold text-4xl sm:text-5xl uppercase tracking-tight text-black">
            DÀNH CHO AI?
          </h2>
          <p className="font-medium text-black/70">
            HocBai.AI tối ưu trải nghiệm cho mọi nhu cầu học tập và giảng dạy.
          </p>
        </div>

        {/* 3-column bento-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Sage (#b7c6c2) */}
          <div className="bg-[#b7c6c2] neo-border neo-shadow-md p-8 rounded-3xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-block bg-white text-black font-extrabold text-xs px-3 py-1 rounded-full border border-black neo-shadow-sm uppercase">
                Học Sinh Ôn Thi
              </span>
              <h3 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-black uppercase">
                Cần Tự Luyện Cấp Tốc
              </h3>
              <p className="text-black/85 text-sm font-medium leading-relaxed">
                Tự kiểm tra kiến thức trước kì thi giữa kì I. Rèn luyện tốc độ làm bài và sự tự tin khi vào phòng thi.
              </p>
            </div>
            <div className="p-3 bg-white/70 border border-black rounded-xl text-xs font-bold text-black">
              ★ Tự động lưu tiến độ làm bài
            </div>
          </div>

          {/* Card 2: Yellow (#ffe17c) with 8px hard shadow */}
          <div className="bg-[#ffe17c] neo-border neo-shadow-lg p-8 rounded-3xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-block bg-black text-[#ffe17c] font-extrabold text-xs px-3 py-1 rounded-full border border-black uppercase">
                Giáo Viên Bộ Môn
              </span>
              <h3 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-black uppercase">
                Xuất Đề & In Giấy A4
              </h3>
              <p className="text-black/85 text-sm font-bold leading-relaxed">
                Chế độ in chuyên dụng chia sẵn bản học sinh (để phát bài làm) và bản giáo viên (kèm đáp án đỏ và hướng dẫn giải).
              </p>
            </div>
            <div className="p-3 bg-black text-[#ffe17c] rounded-xl text-xs font-bold uppercase text-center">
              Tiết kiệm 80% thời gian soạn đề
            </div>
          </div>

          {/* Card 3: Dark Gray (#272727) with white text */}
          <div className="bg-[#272727] text-white neo-border neo-shadow-md p-8 rounded-3xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-block bg-white text-black font-extrabold text-xs px-3 py-1 rounded-full border border-black neo-shadow-sm uppercase">
                Nhóm Bạn Học Tập
              </span>
              <h3 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-white uppercase">
                Thi Đua Điểm Số
              </h3>
              <p className="text-[#b7c6c2] text-sm font-medium leading-relaxed">
                Cùng nhau làm đề, đọ thời gian hoàn thành và tỉ lệ câu đúng để kích thích tinh thần tự học mỗi ngày.
              </p>
            </div>
            <div className="p-3 bg-black/60 border border-[#b7c6c2]/30 rounded-xl text-xs font-bold text-[#ffe17c]">
              ✓ Dễ dàng chia sẻ qua 1 đường link
            </div>
          </div>

        </div>
      </section>

      {/* 8. TESTIMONIALS (Background #b7c6c2) */}
      <section id="testimonials" className="bg-[#b7c6c2] border-y-2 border-black py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-cabinet font-extrabold text-4xl sm:text-5xl uppercase tracking-tight text-black">
              CẢM NHẬN NGƯỜI DÙNG
            </h2>
            <p className="font-bold text-black/80">
              Hàng ngàn bạn học sinh đã tự tin đạt điểm 9-10 nhờ luyện đề tại HocBai.
            </p>
          </div>

          {/* Grid of 3 white cards with asymmetric corner rounding (Top-Right and Bottom-Left 3xl, Top-Left and Bottom-Right 2px) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Review 1 */}
            <div 
              style={{ borderTopRightRadius: '1.5rem', borderBottomLeftRadius: '1.5rem', borderTopLeftRadius: '2px', borderBottomRightRadius: '2px' }}
              className="bg-white neo-border neo-shadow-md p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* 5-star rating in #ffbc2e yellow */}
                <div className="flex items-center gap-1 text-[#febc2e]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#febc2e]" />
                  ))}
                </div>
                <p className="text-sm font-medium text-black leading-relaxed">
                  "Đề thi gộp môn rất tiện lợi. Mình ôn môn Công Nghệ 93 câu trong 2 buổi tối là nắm chắc toàn bộ kiến thức, thi giữa kì được 9.5!"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="font-cabinet font-extrabold text-base text-black">Nguyễn Minh Tuấn</div>
                <div className="text-xs text-slate-500 font-bold">Học sinh lớp 11A1, THPT Gia Định</div>
              </div>
            </div>

            {/* Review 2 */}
            <div 
              style={{ borderTopRightRadius: '1.5rem', borderBottomLeftRadius: '1.5rem', borderTopLeftRadius: '2px', borderBottomRightRadius: '2px' }}
              className="bg-white neo-border neo-shadow-md p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#febc2e]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#febc2e]" />
                  ))}
                </div>
                <p className="text-sm font-medium text-black leading-relaxed">
                  "Tính năng in đề thi giấy A4 rất xịn xò. Thầy cô có thể in trực tiếp bản học sinh để kiểm tra 15 phút trên lớp cực nhanh."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="font-cabinet font-extrabold text-base text-black">Cô Hoàng Mai</div>
                <div className="text-xs text-slate-500 font-bold">Giáo viên Địa Lí & GDQP</div>
              </div>
            </div>

            {/* Review 3 */}
            <div 
              style={{ borderTopRightRadius: '1.5rem', borderBottomLeftRadius: '1.5rem', borderTopLeftRadius: '2px', borderBottomRightRadius: '2px' }}
              className="bg-white neo-border neo-shadow-md p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#febc2e]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#febc2e]" />
                  ))}
                </div>
                <p className="text-sm font-medium text-black leading-relaxed">
                  "Giao diện phong cách Neo-Brutalist cực kỳ ấn tượng, nút bấm nảy như máy cơ, màu sắc bắt mắt làm cho việc học không còn nhàm chán!"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="font-cabinet font-extrabold text-base text-black">Lê Hoàng Nam</div>
                <div className="text-xs text-slate-500 font-bold">Học sinh lớp 11 Chuyên Tin</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FINAL CTA & FOOTER */}
      <section className="bg-[#ffe17c] border-b-2 border-black py-20 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 neo-dot-pattern opacity-10 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-8">
          <h2 className="font-cabinet font-extrabold text-5xl sm:text-7xl uppercase tracking-tighter text-black">
            SẴN SÀNG CHINH PHỤC <br />
            ĐIỂM 10 HÔM NAY?
          </h2>

          <p className="font-bold text-lg sm:text-xl text-black/85 max-w-xl mx-auto">
            Không cần đăng ký phức tạp. Nhấp chuột và bắt đầu làm bài luyện thi ngay lập tức.
          </p>

          <div className="flex justify-center">
            <button
              onClick={onEnterApp}
              className="neo-btn-lg bg-[#171e19] text-white px-10 py-5 rounded-xl font-cabinet font-extrabold text-lg tracking-wider uppercase flex items-center gap-3 cursor-pointer"
            >
              <span>Vào Làm Bài Thi Ngay</span>
              <ArrowRight className="w-6 h-6 text-[#ffe17c]" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer in #171e19 with 4 columns */}
      <footer className="bg-[#171e19] text-white py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center border-2 border-black">
                <Zap className="w-5 h-5 text-[#ffe17c] fill-[#ffe17c]" />
              </div>
              <span className="font-cabinet font-extrabold text-xl uppercase tracking-tight text-white">
                HOCBAI.AI
              </span>
            </div>
            <p className="text-xs text-[#b7c6c2] leading-relaxed">
              Nền tảng ôn thi trắc nghiệm trực quan, tốc độ cao theo tinh thần Neo-Brutalism hiện đại.
            </p>
            {/* Social icons: 10x10 squares (#272727) with light gray borders that turn Yellow/Black on hover */}
            <div className="flex items-center gap-3 pt-2">
              {['FB', 'YT', 'GH', 'DC'].map((label, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 bg-[#272727] border-2 border-[#b7c6c2]/40 rounded flex items-center justify-center font-bold text-xs text-[#b7c6c2] hover:bg-[#ffe17c] hover:text-black hover:border-black transition cursor-pointer"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-cabinet font-extrabold text-base text-white uppercase tracking-wider">
              Đề Thi Có Sẵn
            </h4>
            <ul className="space-y-2 text-xs font-bold text-[#b7c6c2]">
              <li><button onClick={onEnterApp} className="hover:text-[#ffe17c] transition">Công Nghệ 11 (93 câu)</button></li>
              <li><button onClick={onEnterApp} className="hover:text-[#ffe17c] transition">GDQP&AN 11 (52 câu)</button></li>
              <li><button onClick={onEnterApp} className="hover:text-[#ffe17c] transition">Địa Lí 11 (51 câu)</button></li>
              <li><button onClick={onEnterApp} className="hover:text-[#ffe17c] transition">Ngân hàng câu hỏi</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-cabinet font-extrabold text-base text-white uppercase tracking-wider">
              Tính Năng
            </h4>
            <ul className="space-y-2 text-xs font-bold text-[#b7c6c2]">
              <li><a href="#how-it-works" className="hover:text-[#ffe17c] transition">Thi trực tuyến</a></li>
              <li><a href="#features" className="hover:text-[#ffe17c] transition">In đề thi giấy A4</a></li>
              <li><a href="#solution" className="hover:text-[#ffe17c] transition">Chấm điểm tự động</a></li>
              <li><a href="#testimonials" className="hover:text-[#ffe17c] transition">Lưu lịch sử bài làm</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-cabinet font-extrabold text-base text-white uppercase tracking-wider">
              Bản Quyền
            </h4>
            <p className="text-xs text-[#b7c6c2] leading-relaxed">
              Dự án mã nguồn mở phục vụ mục đích học tập phi thương mại cho cộng đồng học sinh THPT Việt Nam.
            </p>
            <div className="text-[11px] text-white/50 pt-2">
              © 2026 HocBai Team. Powered by Neo-Brutalist Architecture.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
