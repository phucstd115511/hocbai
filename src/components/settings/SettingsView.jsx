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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Cài Đặt Hệ Thống & Sao Lưu Dữ Liệu
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quản lý giao diện, khóa API sinh câu hỏi thông minh, xuất nhập sao lưu an toàn
        </p>
      </div>

      {/* Notification Toast */}
      {statusNotice && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-xs font-bold ${
          statusType === 'success'
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
        }`}>
          {statusType === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {statusNotice}
        </div>
      )}

      {/* Interface Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          1. Giao Diện & Quy Tắc Chấm Điểm
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chế độ màu hiển thị
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => { if (theme !== 'light') toggleTheme(e); }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  theme === 'light'
                    ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" /> Sáng (Light)
              </button>
              <button
                type="button"
                onClick={(e) => { if (theme !== 'dark') toggleTheme(e); }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  theme === 'dark'
                    ? 'bg-sky-950/70 border-sky-500 text-sky-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-sky-400" /> Tối (Dark)
              </button>
            </div>
          </div>

          {/* Scoring Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Quy chế chấm điểm câu Đúng / Sai (4 ý)
            </label>
            <select
              value={scoringMode}
              onChange={e => setScoringMode(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white"
            >
              <option value="standard_thpt">Chuẩn đề thi THPT mới (1 ý: 0.1đ; 2 ý: 0.25đ; 3 ý: 0.5đ; 4 ý: 1.0đ)</option>
              <option value="proportional">Chia điểm đều tỷ lệ (mỗi ý đúng 0.25 điểm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Key Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-500" />
          2. Cấu Hình Google Gemini AI (Tùy Chọn)
        </h3>

        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Mặc định ứng dụng đã tích hợp sẵn <b>Bộ quy tắc sư phạm tự động ngoại tuyến (Offline)</b> để sinh câu hỏi ngay tức thì không cần mạng. Nếu bạn muốn sinh câu hỏi sâu sắc, tự nhiên hơn bằng mô hình ngôn ngữ lớn của Google, hãy nhập API Key cá nhân của bạn dưới đây. Khóa này chỉ lưu trữ cục bộ trong trình duyệt của bạn.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
              >
                Lưu Khóa
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bạn có thể lấy khóa miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-sky-500 underline">Google AI Studio</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          3. Sao Lưu & Khôi Phục Dữ Liệu (JSON)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">Xuất Toàn Bộ Dữ Liệu</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Tải tệp tin .json chứa tất cả câu hỏi, đề thi và lịch sử làm bài về máy tính.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Xuất File JSON
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">Nhập Lại Từ JSON</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Khôi phục ngân hàng câu hỏi từ tệp JSON đã sao lưu (hỗ trợ ghi đè hoặc gộp thêm).
              </p>
            </div>
            <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm">
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
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">Dữ Liệu Mẫu Ban Đầu</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Khôi phục lại bộ câu hỏi và đề thi mẫu chuẩn Tin học 12.
              </p>
            </div>
            <button
              onClick={handleResetSeed}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Đặt Lại Dữ Liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
