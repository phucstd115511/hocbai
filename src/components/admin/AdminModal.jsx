import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  Smartphone, 
  Monitor, 
  Globe, 
  Clock, 
  Search, 
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { 
  encryptString, 
  decryptString, 
  EMBEDDED_CONFIG, 
  getActiveTelemetryConfig 
} from '../../services/telemetryConfig.js';
import { 
  sendTelegramNotification, 
  getVisitorLogs, 
  clearVisitorLogs, 
  getDeviceDetails, 
  fetchIPDetails 
} from '../../services/telemetryService.js';

export default function AdminModal({ isOpen, onClose }) {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('telegram'); // 'telegram' | 'logs'

  // Telegram Settings State
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  const [testStatus, setTestStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [isTesting, setIsTesting] = useState(false);
  const [copiedEncrypted, setCopiedEncrypted] = useState(false);

  // Visitor Logs State
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load configuration & logs when unlocked
  useEffect(() => {
    if (isUnlocked) {
      const active = getActiveTelemetryConfig();
      setBotToken(active.botToken || '');
      setChatId(active.chatId || '');
      setIsTrackingEnabled(active.isEnabled);
      setLogs(getVisitorLogs());
    }
  }, [isUnlocked]);

  // Handle URL hash shortcut #admin
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        // Can trigger modal open from parent
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (!isOpen) return null;

  const handleUnlock = (e) => {
    e?.preventDefault();
    const storedPin = localStorage.getItem('hocbai_admin_pin') || EMBEDDED_CONFIG.defaultAdminPin;
    if (pin.trim() === storedPin) {
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('Mã PIN không chính xác. Vui lòng thử lại!');
    }
  };

  const handleSaveConfig = () => {
    try {
      const encToken = encryptString(botToken);
      const encChat = encryptString(chatId);
      localStorage.setItem('hocbai_tele_enc_token', encToken);
      localStorage.setItem('hocbai_tele_enc_chat', encChat);
      localStorage.setItem('hocbai_tele_enabled', String(isTrackingEnabled));

      setTestStatus({
        type: 'success',
        message: 'Đã lưu và mã hóa cấu hình bảo mật vào thiết bị thành công!'
      });
      setTimeout(() => setTestStatus(null), 3500);
    } catch (e) {
      setTestStatus({
        type: 'error',
        message: 'Lỗi khi lưu cấu hình: ' + e.message
      });
    }
  };

  const handleTestTelegram = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID trước khi test!'
      });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);

    // Lưu tạm để test
    localStorage.setItem('hocbai_tele_enc_token', encryptString(botToken));
    localStorage.setItem('hocbai_tele_enc_chat', encryptString(chatId));

    try {
      const deviceDetails = getDeviceDetails();
      const ipDetails = await fetchIPDetails();

      const testPayload = {
        ...deviceDetails,
        ...ipDetails,
        subject: 'Kiểm tra kết nối Check Var (Admin Test)'
      };

      const result = await sendTelegramNotification(testPayload, true);
      setIsTesting(false);

      if (result.success) {
        setTestStatus({
          type: 'success',
          message: '✓ Đã gửi tin nhắn test thành công tới Telegram! Hãy kiểm tra ứng dụng Telegram của bạn.'
        });
      } else {
        setTestStatus({
          type: 'error',
          message: `Lỗi kết nối Telegram: ${result.error || result.data?.description || 'Kiểm tra lại Token hoặc Chat ID'}`
        });
      }
    } catch (err) {
      setIsTesting(false);
      setTestStatus({
        type: 'error',
        message: 'Lỗi gửi test: ' + err.message
      });
    }
  };

  const handleCopyEncryptedSnippet = () => {
    const encToken = encryptString(botToken);
    const encChat = encryptString(chatId);
    const snippet = `// Copy đoạn này thay vào EMBEDDED_CONFIG trong src/services/telemetryConfig.js:
export const EMBEDDED_CONFIG = {
  encryptedBotToken: '${encToken}',
  encryptedChatId: '${encChat}',
  enabled: true,
  defaultAdminPin: '1155'
};`;

    navigator.clipboard.writeText(snippet);
    setCopiedEncrypted(true);
    setTimeout(() => setCopiedEncrypted(false), 2500);
  };

  const handleClearLogs = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử truy cập đã lưu?')) {
      clearVisitorLogs();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.ip || '').toLowerCase().includes(q) ||
      (log.city || '').toLowerCase().includes(q) ||
      (log.os || '').toLowerCase().includes(q) ||
      (log.deviceType || '').toLowerCase().includes(q) ||
      (log.browser || '').toLowerCase().includes(q) ||
      (log.isp || '').toLowerCase().includes(q) ||
      (log.subject || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl neu-card rounded-[32px] bg-[#EBECF0] dark:bg-[#1A1E24] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#FF8800]">
              <ShieldAlert className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(255,136,0,0.4)]" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-[#2D3748] dark:text-white flex items-center gap-2">
                Trung Tâm Quản Trị • Check Var
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Riêng tư (Admin)
                </span>
              </h2>
              <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
                Giám sát thiết bị & IP truy cập qua Telegram cá nhân
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-[#718096] hover:text-[#2D3748] dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Màn hình Khóa mã PIN */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl neu-inset flex items-center justify-center text-[#FF8800]">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-[#2D3748] dark:text-white">
                Xác thực Quyền Quản Trị
              </h3>
              <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
                Vui lòng nhập mã PIN quản trị viên để mở khóa khu vực bí mật này.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Nhập mã PIN (Mặc định: 1155)"
                  className="w-full text-center text-lg tracking-widest font-mono font-bold rounded-2xl neu-inset bg-transparent px-4 py-3 text-[#2D3748] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8800]/50 placeholder:text-xs placeholder:tracking-normal placeholder:font-sans"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs font-bold text-rose-500 mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full neu-btn-primary py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(255,136,0,0.35)]"
              >
                <KeyRound className="w-4 h-4" /> Mở Khóa Quản Trị
              </button>
            </form>
          </div>
        ) : (
          /* Màn hình Bảng Điều Khiển Quản Trị */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Thanh Tab điều hướng */}
            <div className="flex neu-inset p-1 rounded-2xl gap-1 text-xs select-none">
              <button
                type="button"
                onClick={() => setActiveTab('telegram')}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  activeTab === 'telegram'
                    ? 'neu-btn text-[#FF8800] font-extrabold'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> Cấu Hình Telegram Bot
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  activeTab === 'logs'
                    ? 'neu-btn text-[#FF8800] font-extrabold'
                    : 'text-[#718096] dark:text-[#94A3B8] hover:text-[#2D3748]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Lịch Sử Check Var ({logs.length})
              </button>
            </div>

            {/* TAB 1: Cấu hình Telegram */}
            {activeTab === 'telegram' && (
              <div className="space-y-4">
                {/* Trạng thái thông báo */}
                {testStatus && (
                  <div className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 neu-inset ${
                    testStatus.type === 'success' 
                      ? 'text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {testStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <div className="flex-1 leading-relaxed font-medium">{testStatus.message}</div>
                  </div>
                )}

                {/* Form nhập Token & Chat ID */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5 flex items-center justify-between">
                      <span>Telegram Bot Token</span>
                      <span className="text-[10px] text-[#FF8800] font-medium lowercase">Lấy từ @BotFather</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="Ví dụ: 7894561230:AAF..."
                        className="w-full text-xs font-mono font-medium rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 text-[#718096] hover:text-[#FF8800] cursor-pointer"
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#FF8800]" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-[#718096] dark:text-[#94A3B8] mb-1.5 flex items-center justify-between">
                      <span>Telegram Chat ID</span>
                      <span className="text-[10px] text-[#FF8800] font-medium lowercase">Lấy từ @userinfobot</span>
                    </label>
                    <input
                      type="text"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      placeholder="Ví dụ: 624891234 hoặc -100..."
                      className="w-full text-xs font-mono font-medium rounded-2xl neu-inset bg-transparent px-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8800]/50"
                    />
                  </div>

                  {/* Toggle bật/tắt theo dõi */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl neu-inset">
                    <div>
                      <span className="text-xs font-bold text-[#2D3748] dark:text-white block">
                        Kích hoạt Check Var ngầm
                      </span>
                      <span className="text-[11px] text-[#718096] dark:text-[#94A3B8]">
                        Tự động bắn tin nhắn khi có người truy cập trang web
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTrackingEnabled(!isTrackingEnabled)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isTrackingEnabled 
                          ? 'neu-btn text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' 
                          : 'neu-inset text-[#718096]'
                      }`}
                    >
                      {isTrackingEnabled ? '✓ Đang Bật' : '✕ Đang Tắt'}
                    </button>
                  </div>
                </div>

                {/* Các nút hành động */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={isTesting}
                    className="flex-1 neu-btn px-4 py-2.5 rounded-2xl text-xs font-display font-bold flex items-center justify-center gap-1.5 cursor-pointer text-[#FF8800] hover:text-[#e07700] disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-bounce' : ''}`} />
                    <span>{isTesting ? 'Đang gửi test...' : 'Gửi Test Telegram'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="flex-1 neu-btn-primary px-4 py-2.5 rounded-2xl text-xs font-display font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(255,136,0,0.35)]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Lưu & Mã Hóa</span>
                  </button>
                </div>

                {/* Hộp mã hóa nhúng code vĩnh viễn vào dự án */}
                {botToken && chatId && (
                  <div className="mt-4 p-4 rounded-2xl neu-inset space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2D3748] dark:text-white flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-[#FF8800]" /> Mã hóa nhúng vĩnh viễn vào web
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyEncryptedSnippet}
                        className="neu-btn px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#FF8800] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedEncrypted ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEncrypted ? 'Đã chép!' : 'Sao chép mã hóa'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#718096] dark:text-[#94A3B8] leading-relaxed">
                      Token và Chat ID được mã hóa 2 chiều (XOR Cipher). Bạn có thể sao chép đoạn code này dán vào mã nguồn để triển khai tự động lên GitHub Pages mà không sợ bị lộ.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Nhật ký truy cập (Lịch sử Check Var) */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#718096]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo IP, thiết bị, tỉnh thành..."
                      className="w-full text-xs rounded-2xl neu-inset bg-transparent pl-9 pr-3.5 py-2.5 text-[#2D3748] dark:text-white focus:outline-none"
                    />
                  </div>
                  {logs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearLogs}
                      className="neu-btn px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer shrink-0"
                      title="Xóa toàn bộ lịch sử"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Xóa lịch sử</span>
                    </button>
                  )}
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center neu-inset rounded-2xl space-y-2">
                    <Globe className="w-8 h-8 text-[#718096] mx-auto opacity-50" />
                    <p className="text-xs text-[#718096] dark:text-[#94A3B8]">
                      Chưa có lượt truy cập nào được ghi nhận gần đây.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredLogs.map((item) => (
                      <div 
                        key={item.id || Math.random()} 
                        className="p-3.5 rounded-2xl neu-card bg-[#EBECF0] dark:bg-[#1A1E24] space-y-2 text-xs border border-white/50 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#FF8800] bg-[#FF8800]/10 px-2 py-0.5 rounded-lg border border-[#FF8800]/20">
                              {item.ip}
                            </span>
                            <span className="text-[11px] font-semibold text-[#2D3748] dark:text-white flex items-center gap-1">
                              {item.flag || '🇻🇳'} {item.city}, {item.country}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#718096] dark:text-[#94A3B8]">
                            {item.time}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[#718096] dark:text-[#94A3B8]">
                          <div className="flex items-center gap-1.5 truncate">
                            {item.deviceType?.includes('Mobile') || item.deviceType?.includes('iPhone') ? (
                              <Smartphone className="w-3.5 h-3.5 text-[#FF8800] shrink-0" />
                            ) : (
                              <Monitor className="w-3.5 h-3.5 text-[#FF8800] shrink-0" />
                            )}
                            <span className="truncate">{item.deviceType} ({item.os})</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Globe className="w-3.5 h-3.5 text-[#FF8800] shrink-0" />
                            <span className="truncate">{item.browser}</span>
                          </div>
                        </div>

                        {item.isp && (
                          <div className="text-[10px] text-[#718096] dark:text-[#94A3B8] border-t border-black/5 dark:border-white/5 pt-1.5 flex items-center justify-between">
                            <span>Nhà mạng: <strong className="text-[#2D3748] dark:text-white">{item.isp}</strong></span>
                            <span className="text-[#FF8800] truncate max-w-[200px]">{item.subject}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
