import React, { useState, useRef } from 'react';
import { 
  exportDataToJSON, 
  importDataFromJSON, 
  resetToSeedData,
  saveSettings
} from '../../services/storage.js';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Key, 
  Check, 
  AlertCircle, 
  Sun, 
  Moon, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function SettingsView({
  settings = {},
  onUpdateSettings,
  onDataReloaded,
  theme,
  toggleTheme
}) {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [scoringMode, setScoringMode] = useState(settings.scoringMode || 'standard_thpt');
  const [statusNotice, setStatusNotice] = useState('');
  const [statusType, setStatusType] = useState('success');
  const fileInputRef = useRef(null);

  const showNotice = (msg, type = 'success') => {
    setStatusNotice(msg);
    setStatusType(type);
    setTimeout(() => setStatusNotice(''), 4000);
  };

  const handleSaveSettings = () => {
    const updated = {
      ...settings,
      geminiApiKey: apiKey.trim(),
      scoringMode
    };
    saveSettings(updated);
    onUpdateSettings(updated);
    showNotice('Đã lưu cấu hình thành công!');
  };

  const handleExportJSON = () => {
    exportDataToJSON();
    showNotice('Đã xuất tệp dữ liệu sao lưu thành công!');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const confirmMode = confirm('Bấm OK để GHI ĐÈ toàn bộ dữ liệu hiện tại, hoặc bấm CANCEL để GỘP thêm câu hỏi và đề thi mới?');
      const mode = confirmMode ? 'replace' : 'merge';

      const res = importDataFromJSON(content, mode);
      if (res.success) {
        showNotice(`Nhập dữ liệu thành công (${res.count} câu hỏi)!`);
        onDataReloaded();
      } else {
        showNotice(`Lỗi nhập dữ liệu: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetSeed = () => {
    if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu về mẫu ban đầu? Tất cả các câu hỏi và đề thi tự tạo sẽ bị xóa.')) {
      resetToSeedData();
      showNotice('Đã khôi phục dữ liệu mẫu ban đầu!');
      onDataReloaded();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 shadow-[0_8px_20px_rgba(163,177,198,0.4),0_2px_6px_rgba(163,177,198,0.2)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#FF8800] animate-pulse" />
          <span className="text-[11px] font-display font-extrabold text-[#FF8800] uppercase tracking-wider">
            Cấu hình & Đồng bộ
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight">
          Cài Đặt Hệ Thống & Sao Lưu Dữ Liệu
        </h2>
        <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] mt-1">
          Quản lý giao diện, khóa API sinh câu hỏi thông minh, xuất nhập sao lưu an toàn
        </p>
      </div>

      {/* Notification Toast */}
      {statusNotice && (
        <div className={`p-4 rounded-2xl neu-card border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
          statusType === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
        }`}>
          {statusType === 'success' ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          {statusNotice}
        </div>
      )}

      {/* Interface Settings */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-4">
        <h3 className="text-xs font-display font-extrabold text-[#2D3748] dark:text-white border-b border-black/5 dark:border-white/5 pb-3 uppercase tracking-wider">
          1. Giao Diện & Quy Tắc Chấm Điểm
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme Toggle */}
          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Chế độ màu hiển thị
            </label>
            <div className="flex neu-inset p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={(e) => { if (theme !== 'light') toggleTheme(e); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  theme === 'light'
                    ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" /> Sáng (Light)
              </button>
              <button
                type="button"
                onClick={(e) => { if (theme !== 'dark') toggleTheme(e); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  theme === 'dark'
                    ? 'neu-btn text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/25'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" /> Tối (Dark)
              </button>
            </div>
          </div>

          {/* Scoring Mode */}
          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Quy chế chấm điểm câu Đúng / Sai (4 ý)
            </label>
            <select
              value={scoringMode}
              onChange={e => setScoringMode(e.target.value)}
              className="w-full text-xs font-medium rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
            >
              <option value="standard_thpt" className="bg-[#EBECF0] dark:bg-[#1A1E24]">Chuẩn đề thi THPT mới (1 ý: 0.1đ; 2 ý: 0.25đ; 3 ý: 0.5đ; 4 ý: 1.0đ)</option>
              <option value="proportional" className="bg-[#EBECF0] dark:bg-[#1A1E24]">Chia điểm đều tỷ lệ (mỗi ý đúng 0.25 điểm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Key Settings */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-4">
        <h3 className="text-xs font-display font-extrabold text-[#2D3748] dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-[#FF8800]" />
          2. Cấu Hình Google Gemini AI (Tùy Chọn)
        </h3>

        <div className="space-y-3">
          <p className="text-xs font-medium text-[#718096] dark:text-[#94A3B8] leading-relaxed">
            Mặc định ứng dụng đã tích hợp sẵn <b>Bộ quy tắc sư phạm tự động ngoại tuyến (Offline)</b> để sinh câu hỏi ngay tức thì không cần mạng. Nếu bạn muốn sinh câu hỏi sâu sắc, tự nhiên hơn bằng mô hình ngôn ngữ lớn của Google, hãy nhập API Key cá nhân của bạn dưới đây. Khóa này chỉ lưu trữ cục bộ trong trình duyệt của bạn.
          </p>

          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5">
              Google Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 text-xs font-mono rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white placeholder:text-[#718096] dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
              />
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 neu-btn-primary rounded-2xl text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer active:scale-95 transition"
              >
                Lưu Khóa
              </button>
            </div>
            <p className="text-[11px] text-[#718096] mt-1.5">
              Bạn có thể lấy khóa miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#FF8800] underline font-bold">Google AI Studio</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="neu-card p-6 sm:p-7 rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 space-y-4">
        <h3 className="text-xs font-display font-extrabold text-[#2D3748] dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          3. Sao Lưu & Khôi Phục Dữ Liệu (JSON)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export */}
          <div className="p-5 rounded-[28px] neu-inset flex flex-col justify-between">
            <div>
              <div className="font-display font-bold text-xs text-[#2D3748] dark:text-white mb-1">Xuất Toàn Bộ Dữ Liệu</div>
              <p className="text-[11px] font-medium text-[#718096] dark:text-[#94A3B8] mb-3">
                Tải tệp tin .json chứa tất cả câu hỏi, đề thi và lịch sử làm bài về máy tính.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 neu-btn-primary rounded-2xl text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" /> Xuất File JSON
            </button>
          </div>

          {/* Import */}
          <div className="p-5 rounded-[28px] neu-inset flex flex-col justify-between">
            <div>
              <div className="font-display font-bold text-xs text-[#2D3748] dark:text-white mb-1">Nhập Lại Từ JSON</div>
              <p className="text-[11px] font-medium text-[#718096] dark:text-[#94A3B8] mb-3">
                Khôi phục ngân hàng câu hỏi từ tệp JSON đã sao lưu (hỗ trợ ghi đè hoặc gộp thêm).
              </p>
            </div>
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 neu-btn text-[#FF8800] rounded-2xl text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer active:scale-95 transition">
              <Upload className="w-3.5 h-3.5" /> Chọn File JSON
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset to seed */}
          <div className="p-5 rounded-[28px] neu-inset flex flex-col justify-between">
            <div>
              <div className="font-display font-bold text-xs text-[#2D3748] dark:text-white mb-1">Dữ Liệu Mẫu Ban Đầu</div>
              <p className="text-[11px] font-medium text-[#718096] dark:text-[#94A3B8] mb-3">
                Khôi phục lại bộ câu hỏi và đề thi mẫu chuẩn Tin học 12.
              </p>
            </div>
            <button
              onClick={handleResetSeed}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 neu-btn text-rose-500 rounded-2xl text-xs font-display font-bold cursor-pointer active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Đặt Lại Dữ Liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
