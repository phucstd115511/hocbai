/**
 * Telemetry & Check Var Service
 * Tự động thu thập thông tin thiết bị, IP, vị trí địa lý và gửi thông báo bảo mật về Telegram của Admin.
 * Hoạt động hoàn toàn ngầm trong nền, không gây ảnh hưởng đến trải nghiệm người dùng.
 */

import { getActiveTelemetryConfig } from './telemetryConfig.js';

const STORAGE_LOGS_KEY = 'hocbai_admin_visitor_logs';
const SESSION_VAR_KEY = 'hocbai_var_session_recorded';

/**
 * Phân tích chi tiết thiết bị, hệ điều hành, trình duyệt và WebView
 */
export function getDeviceDetails() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      os: 'Unknown',
      browser: 'Unknown',
      deviceType: 'Unknown',
      screen: 'Unknown',
      timezone: 'Unknown',
      language: 'Unknown'
    };
  }

  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';
  let deviceType = 'Máy tính (Desktop)';

  // 1. Nhận diện hệ điều hành & dòng máy
  if (/iPad|iPhone|iPod/.test(ua)) {
    os = 'iOS';
    deviceType = /iPad/.test(ua) ? 'iPad (Tablet)' : 'iPhone (Mobile)';
    const match = ua.match(/OS (\d+[_\d]*)/);
    if (match) os += ` ${match[1].replace(/_/g, '.')}`;
  } else if (/Android/.test(ua)) {
    os = 'Android';
    deviceType = /Mobile/.test(ua) ? 'Android (Mobile)' : 'Android (Tablet)';
    const match = ua.match(/Android\s([0-9.]+)/);
    if (match) os += ` ${match[1]}`;
  } else if (/Windows NT 10.0/.test(ua)) {
    os = 'Windows 10/11';
  } else if (/Windows NT 6.3/.test(ua)) {
    os = 'Windows 8.1';
  } else if (/Windows NT 6.1/.test(ua)) {
    os = 'Windows 7';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'macOS';
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    if (match) os += ` ${match[1].replace(/_/g, '.')}`;
  } else if (/CrOS/.test(ua)) {
    os = 'ChromeOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // 2. Nhận diện Trình duyệt & Các WebView trong ứng dụng mạng xã hội
  let browser = 'Unknown Browser';
  let inApp = '';

  if (/Zalo/i.test(ua)) {
    inApp = ' • Mở qua Zalo In-App';
  } else if (/FBAN|FBAV/i.test(ua)) {
    inApp = ' • Mở qua Facebook / Messenger';
  } else if (/Instagram/i.test(ua)) {
    inApp = ' • Mở qua Instagram';
  } else if (/ByteLocale|TikTok/i.test(ua)) {
    inApp = ' • Mở qua TikTok';
  }

  if (/Edg\//.test(ua)) {
    const match = ua.match(/Edg\/([0-9.]+)/);
    browser = `Microsoft Edge ${match ? match[1].split('.')[0] : ''}`;
  } else if (/CocCoc/i.test(ua)) {
    browser = 'Cốc Cốc';
  } else if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) {
    const match = ua.match(/Chrome\/([0-9.]+)/);
    browser = `Google Chrome ${match ? match[1].split('.')[0] : ''}`;
  } else if (/Firefox\//.test(ua)) {
    const match = ua.match(/Firefox\/([0-9.]+)/);
    browser = `Mozilla Firefox ${match ? match[1].split('.')[0] : ''}`;
  } else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    const match = ua.match(/Version\/([0-9.]+)/);
    browser = `Apple Safari ${match ? match[1].split('.')[0] : ''}`;
  }

  browser += inApp;

  // 3. Màn hình & Viewport
  const screenWidth = window.screen?.width || window.innerWidth;
  const screenHeight = window.screen?.height || window.innerHeight;
  const dpr = window.devicePixelRatio ? `${window.devicePixelRatio.toFixed(1)}x` : '1.0x';
  const screenStr = `${screenWidth} x ${screenHeight} (DPR: ${dpr}, Viewport: ${window.innerWidth}x${window.innerHeight})`;

  // 4. Múi giờ & Ngôn ngữ
  let timezone = 'Asia/Ho_Chi_Minh';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
  } catch (e) {}

  const language = navigator.language || 'vi-VN';

  // 5. Loại kết nối mạng (nếu trình duyệt hỗ trợ)
  let connectionType = '';
  if (navigator.connection?.effectiveType) {
    connectionType = navigator.connection.effectiveType.toUpperCase();
  }

  return {
    os,
    deviceType,
    browser,
    screen: screenStr,
    timezone,
    language,
    connectionType,
    referrer: document.referrer ? document.referrer : 'Truy cập trực tiếp / Bookmark'
  };
}

/**
 * Lấy IP công khai và định vị địa lý (sử dụng service miễn phí, nhanh, có hỗ trợ CORS)
 */
export async function fetchIPDetails() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    // Service 1: ipwho.is (Rất nhanh, miễn phí, đầy đủ Tỉnh/Thành, Quốc gia, Nhà mạng ISP)
    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false) {
        return {
          ip: data.ip || 'Unknown IP',
          country: data.country || 'Việt Nam',
          countryCode: data.country_code || 'VN',
          flag: data.flag?.emoji || '🇻🇳',
          city: data.city || data.region || 'Unknown City',
          region: data.region || '',
          isp: data.connection?.isp || data.connection?.org || 'Unknown ISP',
          success: true
        };
      }
    }
  } catch (e) {
    // Thử fallback tiếp theo
  }

  try {
    // Service 2 fallback: ipify
    const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || 'Unknown IP',
        country: 'Việt Nam',
        countryCode: 'VN',
        flag: '🇻🇳',
        city: 'Việt Nam',
        region: '',
        isp: 'Internet Provider',
        success: true
      };
    }
  } catch (e) {
    // Fail-safe
  }

  return {
    ip: 'Không xác định',
    country: 'Việt Nam',
    countryCode: 'VN',
    flag: '🇻🇳',
    city: 'Việt Nam',
    region: '',
    isp: 'Không rõ',
    success: false
  };
}

/**
 * Lưu lịch sử truy cập vào bộ nhớ cục bộ để Admin tra cứu trực tiếp trong Bảng Quản Trị
 */
function recordLocalVisitLog(logItem) {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    let logs = [];
    if (raw) {
      logs = JSON.parse(raw);
    }
    // Thêm vào đầu danh sách, giữ tối đa 100 bản ghi mới nhất
    logs.unshift(logItem);
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    // Ignore storage quota
  }
}

export function getVisitorLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function clearVisitorLogs() {
  try {
    localStorage.removeItem(STORAGE_LOGS_KEY);
  } catch (e) {}
}

/**
 * Gửi thông báo Check Var tới Telegram Bot của Admin
 */
export async function sendTelegramNotification(payload, isTest = false) {
  const { botToken, chatId, isEnabled } = getActiveTelemetryConfig();

  if (!isEnabled && !isTest) {
    return { success: false, reason: 'Telemetry is disabled' };
  }

  if (!botToken || !chatId) {
    return { success: false, reason: 'Chưa cấu hình Telegram Bot Token hoặc Chat ID' };
  }

  const now = new Date();
  const timeFormatted = now.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const headerTitle = isTest 
    ? '🔔 <b>[TEST KẾT NỐI] Cấu hình Check Var thành công!</b>'
    : '🎯 <b>[CHECK VAR HỌC BÀI] Có lượt truy cập mới!</b>';

  const messageText = `${headerTitle}
━━━━━━━━━━━━━━━━━━
📍 <b>Địa chỉ IP:</b> <code>${payload.ip}</code>
🌍 <b>Vị trí:</b> ${payload.city}${payload.region ? `, ${payload.region}` : ''}, ${payload.country} ${payload.flag || '🇻🇳'}
🏢 <b>Nhà mạng:</b> ${payload.isp || 'Không rõ'}
📱 <b>Thiết bị:</b> ${payload.deviceType} (${payload.os})
🌐 <b>Trình duyệt:</b> ${payload.browser}
📐 <b>Độ phân giải:</b> ${payload.screen}
📶 <b>Tốc độ mạng:</b> ${payload.connectionType || 'Tự động'}
📚 <b>Đang xem:</b> ${payload.subject || 'Trang ôn tập'}
🔗 <b>Nguồn truy cập:</b> ${payload.referrer}
⏱️ <b>Thời gian:</b> <code>${timeFormatted}</code> (Giờ VN)
━━━━━━━━━━━━━━━━━━
🛡️ <i>Thông báo riêng tư chỉ dành cho Quản trị viên HọcBài</i>`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      keepalive: true
    });

    const resJson = await response.json();
    return {
      success: resJson.ok === true,
      data: resJson,
      time: timeFormatted
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  }
}

/**
 * Khởi tạo kiểm tra và gửi dữ liệu truy cập ngầm trong nền
 * Áp dụng cơ chế Debounce phiên truy cập để không làm phiền Admin liên tục
 */
export async function initTelemetry(subjectName = 'Môn Công Nghệ 11') {
  if (typeof window === 'undefined') return;

  try {
    const { isEnabled, botToken, chatId } = getActiveTelemetryConfig();
    if (!isEnabled || !botToken || !chatId) {
      return;
    }

    // Cơ chế Debounce: Mỗi người dùng vào làm bài chỉ gửi 1 thông báo mỗi 20 phút
    const sessionRecorded = sessionStorage.getItem(SESSION_VAR_KEY);
    const lastTime = sessionRecorded ? parseInt(sessionRecorded, 10) : 0;
    const now = Date.now();

    if (now - lastTime < 20 * 60 * 1000) {
      // Đã ghi nhận trong 20 phút vừa qua, bỏ qua để tránh spam
      return;
    }

    sessionStorage.setItem(SESSION_VAR_KEY, String(now));

    // Thu thập thông tin thiết bị và IP trong nền
    const deviceDetails = getDeviceDetails();
    const ipDetails = await fetchIPDetails();

    const fullPayload = {
      ...deviceDetails,
      ...ipDetails,
      subject: subjectName,
      timestamp: new Date().toISOString()
    };

    // Gửi thông báo đến Telegram
    await sendTelegramNotification(fullPayload, false);

    // Lưu vào lịch sử cục bộ cho Admin
    recordLocalVisitLog({
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleString('vi-VN', { hour12: false }),
      ...fullPayload
    });
  } catch (err) {
    // Fail-safe ngầm, không bao giờ ảnh hưởng tới giao diện học tập
  }
}
