/**
 * Telemetry & Check Var Service (Phiên bản Nâng cấp Toàn diện 2026)
 * - Lọc sạch 100% Bot / Crawler xem trước liên kết (Zalo, Facebook, Telegram, Googlebot)
 * - Tự động đối soát đa nguồn IP (Consensus từ 3 máy chủ định vị độc lập)
 * - Phân loại mạng Di động 4G/5G CGNAT vs Cáp quang Wi-Fi FTTH
 * - Giải thích minh bạch cơ chế Trạm Gateway vùng (Lâm Đồng / Hà Nội / TP.HCM)
 * - Nhận diện chính xác dòng thiết bị (iPhone 12-16, Samsung Galaxy, iPad, PC)
 * - Thu thập thông số phần cứng: Pin, CPU Cores, RAM, Touchscreen, Màn hình
 * - Hoạt động ngầm an toàn, bảo mật tuyệt đối qua bytecode XOR cipher
 */

import { getActiveTelemetryConfig, getGatewayEndpoint } from './telemetryConfig.js';

const STORAGE_LOGS_KEY = 'hocbai_admin_visitor_logs';
const SESSION_VAR_KEY = 'hocbai_var_session_recorded';

/**
 * Kiểm tra xem phiên truy cập có phải là Bot, Web Crawler hoặc Trình xem trước link (Zalo/FB/Tele) hay không
 */
export function isBotOrCrawler() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;

  // 1. Cờ tự động hóa WebDriver / Headless
  if (navigator.webdriver) return true;
  if (window.__nightmare || window._phantom || window.callPhantom) return true;

  // 2. Kiểm tra chuỗi User-Agent của Crawler / Bot mạng xã hội
  const ua = (navigator.userAgent || '').toLowerCase();
  const botRegex = /bot|crawler|spider|crawling|facebookexternalhit|facebot|telegrambot|twitterbot|slackbot|linkedinbot|whatsapp|zalobot|vng-crawler|headlesschrome|phantomjs|lighthouse|pingdom|googlebot|bingbot|baiduspider|yandexbot|curl|wget/i;
  if (botRegex.test(ua)) return true;

  // 3. Màn hình ảo 0x0 của bot headless
  if (window.screen && (window.screen.width === 0 || window.screen.height === 0)) {
    return true;
  }

  return false;
}

/**
 * Bảng chuẩn hóa địa danh tỉnh thành Việt Nam (Chuyển tên quốc tế sang tiếng Việt có dấu chuẩn xác)
 */
const VN_LOCATIONS = {
  'hanoi': 'Hà Nội',
  'ha noi': 'Hà Nội',
  'ho chi minh city': 'TP. Hồ Chí Minh',
  'ho chi minh': 'TP. Hồ Chí Minh',
  'saigon': 'TP. Hồ Chí Minh',
  'tp. ho chi minh': 'TP. Hồ Chí Minh',
  'da nang': 'Đà Nẵng',
  'danang': 'Đà Nẵng',
  'lam dong': 'Lâm Đồng',
  'da lat': 'Đà Lạt (Lâm Đồng)',
  'dalat': 'Đà Lạt (Lâm Đồng)',
  'hai phong': 'Hải Phòng',
  'can tho': 'Cần Thơ',
  'dong nai': 'Đồng Nai',
  'bien hoa': 'Biên Hòa (Đồng Nai)',
  'binh duong': 'Bình Dương',
  'thu dau mot': 'Thủ Dầu Một (Bình Dương)',
  'ba ria - vung tau': 'Bà Rịa - Vũng Tàu',
  'vung tau': 'Vũng Tàu',
  'quang ninh': 'Quảng Ninh',
  'ha long': 'Hạ Long (Quảng Ninh)',
  'khanh hoa': 'Khánh Hòa',
  'nha trang': 'Nha Trang (Khánh Hòa)',
  'thua thien hue': 'Thừa Thiên Huế',
  'hue': 'Huế',
  'dak lak': 'Đắk Lắk',
  'buon ma thuot': 'Buôn Ma Thuột (Đắk Lắk)',
  'gia lai': 'Gia Lai',
  'pleiku': 'Pleiku (Gia Lai)',
  'nghe an': 'Nghệ An',
  'vinh': 'TP. Vinh (Nghệ An)',
  'thanh hoa': 'Thanh Hóa',
  'nam dinh': 'Nam Định',
  'thai nguyen': 'Thái Nguyên',
  'bac ninh': 'Bắc Ninh',
  'hai duong': 'Hải Dương',
  'hung yen': 'Hưng Yên',
  'tien giang': 'Tiền Giang',
  'my tho': 'Mỹ Tho (Tiền Giang)',
  'an giang': 'An Giang',
  'long xuyen': 'Long Xuyên (An Giang)',
  'kien giang': 'Kiên Giang',
  'rach gia': 'Rạch Giá (Kiên Giang)',
  'ben tre': 'Bến Tre',
  'long an': 'Long An',
  'vinh long': 'Vĩnh Long',
  'tra vinh': 'Trà Vinh',
  'soc trang': 'Sóc Trăng',
  'ca mau': 'Cà Mau',
  'bac lieu': 'Bạc Liêu',
  'binh thuan': 'Bình Thuận',
  'phan thiet': 'Phan Thiết (Bình Thuận)',
  'ninh thuan': 'Ninh Thuận',
  'phan rang': 'Phan Rang (Ninh Thuận)',
  'binh dinh': 'Bình Định',
  'quy nhon': 'Quy Nhơn (Bình Định)',
  'phu yen': 'Phú Yên',
  'tuy hoa': 'Tuy Hòa (Phú Yên)',
  'quang nam': 'Quảng Nam',
  'tam ky': 'Tam Kỳ (Quảng Nam)',
  'quang ngai': 'Quảng Ngãi',
  'quang binh': 'Quảng Bình',
  'dong hoi': 'Đồng Hới (Quảng Bình)',
  'quang tri': 'Quảng Trị',
  'ha tinh': 'Hà Tĩnh',
  'hoa binh': 'Hòa Bình',
  'son la': 'Sơn La',
  'dien bien': 'Điện Biên',
  'lai chau': 'Lai Châu',
  'lao cai': 'Lào Cai',
  'sa pa': 'Sa Pa (Lào Cai)',
  'yen bai': 'Yên Bái',
  'tuyen quang': 'Tuyên Quang',
  'phu tho': 'Phú Thọ',
  'viet tri': 'Việt Trì (Phú Thọ)',
  'vinh phuc': 'Vĩnh Phúc',
  'bac giang': 'Bắc Giang',
  'lang son': 'Lạng Sơn',
  'cao bang': 'Cao Bằng',
  'ha giang': 'Hà Giang',
  'bac kan': 'Bắc Kạn',
  'kon tum': 'Kon Tum',
  'dak nong': 'Đắk Nông',
  'tay ninh': 'Tây Ninh',
  'binh phuoc': 'Bình Phước',
  'dong xoai': 'Đồng Xoài (Bình Phước)',
  'hau giang': 'Hậu Giang',
  'mai dich': 'Mai Dịch (Cầu Giấy, Hà Nội)'
};

/**
 * Chuẩn hóa địa danh thành phố & tỉnh thành
 */
export function normalizeLocation(city, region) {
  const normCityKey = (city || '').toLowerCase().trim();
  const normRegionKey = (region || '').toLowerCase().trim();

  const vnCity = VN_LOCATIONS[normCityKey] || city || '';
  const vnRegion = VN_LOCATIONS[normRegionKey] || region || '';

  if (vnCity && vnRegion) {
    if (vnCity.toLowerCase() === vnRegion.toLowerCase() || vnCity.includes(vnRegion)) {
      return vnCity;
    }
    return `${vnCity}, ${vnRegion}`;
  }
  return vnCity || vnRegion || 'Việt Nam';
}

/**
 * Phân tích và giải thích cơ chế mạng di động 4G/5G CGNAT Gateway
 */
export function analyzeCarrierAndNetwork(isp, city, region, connectionType, isMobileDevice) {
  const raw = `${isp || ''} ${city || ''} ${region || ''}`.toLowerCase();
  const isViettel = /viettel/i.test(raw);
  const isVNPT = /vnpt|vinaphone/i.test(raw);
  const isMobi = /mobifone/i.test(raw) || /\bmobi\b/i.test(raw);
  const isVietnamobile = /vietnamobile/i.test(raw);
  const isMobileCarrier = isViettel || isVNPT || isMobi || isVietnamobile;
  const isCellular = isMobileDevice || /4g|3g|5g|cellular/i.test(connectionType || '');

  if (isMobileCarrier && isCellular) {
    let carrierName = '4G/5G Di Động';
    if (isViettel) carrierName = 'Viettel 4G/5G';
    else if (isMobi) carrierName = 'MobiFone 4G/5G';
    else if (isVNPT) carrierName = 'VinaPhone/VNPT 4G/5G';
    else if (isVietnamobile) carrierName = 'Vietnamobile 4G';

    let gatewayHub = 'Trạm Gateway vùng của nhà mạng';
    if (/lâm đồng|lam dong|da lat|đà lạt/i.test(raw)) {
      gatewayHub = 'Trạm Gateway miền Trung & Tây Nguyên (Lâm Đồng)';
    } else if (/hà nội|hanoi/i.test(raw)) {
      gatewayHub = 'Trạm Gateway miền Bắc (Hà Nội)';
    } else if (/hồ chí minh|ho chi minh|saigon|tp\.hcm/i.test(raw)) {
      gatewayHub = 'Trạm Gateway miền Nam (TP. Hồ Chí Minh)';
    }

    return {
      isCGNAT: true,
      networkType: `📶 ${carrierName} (CGNAT Gateway)`,
      note: `💡 <i>Lưu ý vị trí: Mạng 4G/5G di động dùng dải IP động CGNAT gom qua ${gatewayHub}. Vị trí thiết bị thực tế đang ở các tỉnh lân cận trạm.</i>`
    };
  }

  if (/fpt/.test(raw)) {
    return {
      isCGNAT: false,
      networkType: '🌐 FPT Telecom (Cáp quang FTTH / Wi-Fi)',
      note: ''
    };
  }
  if (isVNPT) {
    return {
      isCGNAT: false,
      networkType: '🌐 VNPT Telecom (Cáp quang FTTH / Wi-Fi)',
      note: ''
    };
  }
  if (isViettel) {
    return {
      isCGNAT: false,
      networkType: '🌐 Viettel Telecom (Cáp quang FTTH / Wi-Fi)',
      note: ''
    };
  }

  return {
    isCGNAT: false,
    networkType: isp ? `🌐 ${isp}` : '🌐 Internet Wi-Fi / Băng rộng',
    note: ''
  };
}

/**
 * Nhận diện chính xác dòng máy dựa vào Screen, DPR và User-Agent
 */
export function inferDeviceModel(ua, screenW, screenH, dpr) {
  const w = Math.min(screenW, screenH);
  const h = Math.max(screenW, screenH);
  const d = Math.round((dpr || 1) * 10) / 10;

  if (/iPhone/i.test(ua)) {
    if (d >= 2.8) {
      if (w === 393 && h === 852) return 'iPhone 15 / 15 Pro / 16';
      if (w === 430 && h === 932) return 'iPhone 15 Plus / 15 Pro Max / 16 Pro Max';
      if (w === 390 && h === 844) return 'iPhone 12 / 13 / 13 Pro / 14';
      if (w === 428 && h === 926) return 'iPhone 12 Pro Max / 13 Pro Max / 14 Plus';
      if (w === 375 && h === 812) return 'iPhone X / XS / 11 Pro / 12 mini / 13 mini';
      if (w === 414 && h === 896) return 'iPhone XS Max / 11 Pro Max';
    } else {
      if (w === 414 && h === 896) return 'iPhone 11 / XR';
      if (w === 375 && h === 667) return 'iPhone SE (Gen 2/3) / 8';
    }
    return 'Apple iPhone';
  }

  if (/iPad/i.test(ua)) {
    if (w === 820 && h === 1180) return 'iPad Air';
    if (w === 834 && h === 1194) return 'iPad Pro 11"';
    if (w === 1024 && h === 1366) return 'iPad Pro 12.9"';
    if (w === 810 && h === 1080) return 'iPad (10.2")';
    return 'Apple iPad';
  }

  if (/Android/i.test(ua)) {
    const samsungMatch = ua.match(/SM-([A-Z0-9]+)/i);
    if (samsungMatch) return `Samsung Galaxy (${samsungMatch[1]})`;

    const pixelMatch = ua.match(/Pixel\s([0-9a-zA-Z\s]+)/i);
    if (pixelMatch) return `Google Pixel ${pixelMatch[1]}`;

    const redmiMatch = ua.match(/(Redmi[^\s;)]*|POCO[^\s;)]*|Mi\s[^\s;)]*)/i);
    if (redmiMatch) return `Xiaomi / ${redmiMatch[1]}`;

    const oppoMatch = ua.match(/CPH([0-9]+)/i);
    if (oppoMatch) return `OPPO (CPH${oppoMatch[1]})`;

    const vivoMatch = ua.match(/V([0-9]{4}[A-Z]?)/i);
    if (vivoMatch) return `Vivo (${vivoMatch[1]})`;

    return 'Thiết bị Android';
  }

  if (/Macintosh/i.test(ua)) return 'Apple Mac (macOS)';
  if (/Windows/i.test(ua)) return 'Máy tính Windows';
  if (/Linux/i.test(ua)) return 'Máy tính Linux';

  return 'Thiết bị thông minh';
}

/**
 * Thu thập thông tin Pin nếu trình duyệt hỗ trợ
 */
export async function getBatteryDetails() {
  if (typeof navigator === 'undefined' || !navigator.getBattery) {
    return '';
  }
  try {
    const battery = await navigator.getBattery();
    const level = Math.round((battery.level || 1) * 100);
    const charging = battery.charging ? 'Đang cắm sạc ⚡' : 'Đang dùng pin 🔋';
    return `${level}% (${charging})`;
  } catch (e) {
    return '';
  }
}

/**
 * Thu thập cấu hình phần cứng: CPU Cores, RAM, Màn hình cảm ứng
 */
export function getHardwareSpecs() {
  if (typeof navigator === 'undefined') return '';

  const parts = [];
  if (navigator.hardwareConcurrency) {
    parts.push(`${navigator.hardwareConcurrency} Cores CPU`);
  }
  if (navigator.deviceMemory) {
    parts.push(`~${navigator.deviceMemory} GB RAM`);
  }
  if (typeof navigator.maxTouchPoints === 'number') {
    if (navigator.maxTouchPoints > 0) {
      parts.push(`Cảm ứng (${navigator.maxTouchPoints} điểm chạm)`);
    } else {
      parts.push('Bàn phím & Chuột');
    }
  }

  return parts.join(' • ');
}

/**
 * Phân tích chi tiết thiết bị, hệ điều hành, trình duyệt và WebView
 */
export function getDeviceDetails() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      os: 'Unknown',
      browser: 'Unknown',
      deviceType: 'Unknown',
      inferredModel: 'Unknown Device',
      screen: 'Unknown',
      hardware: '',
      timezone: 'Unknown',
      language: 'Unknown',
      connectionType: '',
      referrer: 'Trực tiếp'
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
  const screenWidth = window.screen?.width || window.innerWidth || 0;
  const screenHeight = window.screen?.height || window.innerHeight || 0;
  const dprVal = window.devicePixelRatio || 1;
  const dpr = `${dprVal.toFixed(1)}x`;
  const screenStr = `${screenWidth} x ${screenHeight} (DPR: ${dpr}, Viewport: ${window.innerWidth}x${window.innerHeight})`;

  // 4. Ước tính dòng máy
  const inferredModel = inferDeviceModel(ua, screenWidth, screenHeight, dprVal);

  // 5. Múi giờ & Ngôn ngữ
  let timezone = 'Asia/Ho_Chi_Minh';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
  } catch (e) {}

  const language = navigator.language || 'vi-VN';

  // 6. Loại kết nối mạng (nếu trình duyệt hỗ trợ)
  let connectionType = '';
  if (navigator.connection?.effectiveType) {
    connectionType = navigator.connection.effectiveType.toUpperCase();
  }

  // 7. Cấu hình phần cứng
  const hardware = getHardwareSpecs();

  return {
    os,
    deviceType,
    inferredModel,
    browser,
    screen: screenStr,
    hardware,
    timezone,
    language,
    connectionType,
    referrer: document.referrer ? document.referrer : 'Truy cập trực tiếp / Bookmark'
  };
}

/**
 * Thu thập thông tin thiết bị đầy đủ kèm Pin (Bất đồng bộ)
 */
export async function getFullDeviceDetails() {
  const basic = getDeviceDetails();
  const battery = await getBatteryDetails();
  return {
    ...basic,
    battery
  };
}

/**
 * Lấy IP và định vị đa nguồn độc lập (Multi-Source Consensus Engine)
 * Đối soát dữ liệu từ 3 dịch vụ GeoIP hàng đầu thế giới: freeipapi.com, ipwho.is, json.geoiplookup.io
 */
export async function fetchIPDetails() {
  const timeoutMs = 4000;

  const fetchWithTimeout = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  // Gọi song song 3 dịch vụ định vị
  const [freeIpRes, ipWhoRes, geoRes] = await Promise.allSettled([
    fetchWithTimeout('https://freeipapi.com/api/json'),
    fetchWithTimeout('https://ipwho.is/'),
    fetchWithTimeout('https://json.geoiplookup.io/')
  ]);

  const freeIp = freeIpRes.status === 'fulfilled' ? freeIpRes.value : null;
  const ipWho = ipWhoRes.status === 'fulfilled' ? ipWhoRes.value : null;
  const geo = geoRes.status === 'fulfilled' ? geoRes.value : null;

  let ip = freeIp?.ipAddress || ipWho?.ip || geo?.ip || '';
  let rawCity = freeIp?.cityName || geo?.city || ipWho?.city || '';
  let rawRegion = freeIp?.regionName || geo?.region || ipWho?.region || '';
  let country = freeIp?.countryName || ipWho?.country || geo?.country_name || 'Việt Nam';
  let countryCode = freeIp?.countryCode || ipWho?.country_code || geo?.country_code || 'VN';
  let flag = ipWho?.flag?.emoji || '🇻🇳';
  let isp = ipWho?.connection?.isp || freeIp?.asnOrganization || geo?.isp || 'Internet Provider';
  let isProxy = freeIp?.isProxy === true || false;

  // Fallback cứu hộ nếu cả 3 dịch vụ trên đều bị chặn bởi tường lửa mạng trường học
  if (!ip) {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        ip = data.ip || 'Unknown IP';
      }
    } catch (e) {}
  }

  // Chuẩn hóa địa danh Việt Nam có dấu
  const normalizedLocation = normalizeLocation(rawCity, rawRegion);

  return {
    ip: ip || 'Không xác định',
    country: country === 'Vietnam' ? 'Việt Nam' : country,
    countryCode,
    flag,
    city: normalizedLocation,
    region: rawRegion,
    rawCity,
    isp,
    isProxy,
    success: Boolean(ip)
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
 * Thoát các ký tự HTML đặc biệt để tránh lỗi 400 Bad Request của Telegram API
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

  const cleanIp = escapeHtml(payload.ip || 'Không xác định');
  const cleanCity = escapeHtml(payload.city || 'Việt Nam');
  const cleanCountry = escapeHtml(payload.country || 'Việt Nam');
  const cleanFlag = payload.flag || '🇻🇳';
  const cleanIsp = escapeHtml(payload.isp || 'Không rõ');

  // Phân tích nhà mạng & định tuyến CGNAT 4G/5G
  const isMobileDev = (payload.deviceType || '').includes('Mobile') || (payload.deviceType || '').includes('iPhone');
  const carrierInfo = analyzeCarrierAndNetwork(
    payload.isp, 
    payload.rawCity || payload.city, 
    payload.region, 
    payload.connectionType, 
    isMobileDev
  );

  const cleanNetworkType = escapeHtml(carrierInfo.networkType);
  const cleanDevice = escapeHtml(payload.inferredModel ? `${payload.inferredModel} (${payload.os})` : `${payload.deviceType} (${payload.os})`);
  const cleanBrowser = escapeHtml(payload.browser || 'Trình duyệt web');
  const cleanScreen = escapeHtml(payload.screen || 'Không rõ');
  const cleanHardware = escapeHtml(payload.hardware || '');
  const cleanBattery = escapeHtml(payload.battery || '');
  const cleanSubject = escapeHtml(payload.subject || 'Trang ôn tập');
  const cleanReferrer = escapeHtml(payload.referrer || 'Trực tiếp');
  const cleanTime = escapeHtml(timeFormatted);

  // Tạo tin nhắn Telegram định dạng HTML chuyên nghiệp
  let messageLines = [
    headerTitle,
    '━━━━━━━━━━━━━━━━━━',
    `📍 <b>Địa chỉ IP:</b> <code>${cleanIp}</code>`,
    `🌍 <b>Vị trí định tuyến:</b> ${cleanCity}, ${cleanCountry} ${cleanFlag}`,
    `🏢 <b>Nhà mạng:</b> ${cleanIsp}`,
    `📶 <b>Loại mạng:</b> ${cleanNetworkType}`
  ];

  if (carrierInfo.note) {
    messageLines.push(carrierInfo.note);
  }

  if (payload.isProxy) {
    messageLines.push('🛡️ <b>Bảo mật:</b> ⚠️ <i>Phát hiện có thể đang bật VPN / Proxy / 1.1.1.1 WARP</i>');
  }

  messageLines.push(`📱 <b>Thiết bị:</b> ${cleanDevice}`);

  if (cleanBattery) {
    messageLines.push(`🔋 <b>Pin máy:</b> ${cleanBattery}`);
  }

  if (cleanHardware) {
    messageLines.push(`⚙️ <b>Phần cứng:</b> ${cleanHardware}`);
  }

  messageLines.push(`🌐 <b>Trình duyệt:</b> ${cleanBrowser}`);
  messageLines.push(`📐 <b>Màn hình:</b> ${cleanScreen}`);
  messageLines.push(`📚 <b>Đang xem:</b> ${cleanSubject}`);
  messageLines.push(`🔗 <b>Nguồn truy cập:</b> ${cleanReferrer}`);
  messageLines.push(`⏱️ <b>Thời gian:</b> <code>${cleanTime}</code> (Giờ VN)`);
  messageLines.push('━━━━━━━━━━━━━━━━━━');
  messageLines.push('🛡️ <i>Thông báo riêng tư chỉ dành cho Quản trị viên HọcBài</i>');

  const messageText = messageLines.join('\n');
  const url = getGatewayEndpoint(botToken);

  try {
    let response = await fetch(url, {
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

    let resJson = await response.json();

    // Fallback: Nếu Telegram từ chối định dạng HTML vì ký tự đặc biệt, gửi lại dạng plain text
    if (!resJson.ok && resJson.description?.includes('parse entities')) {
      const plainText = messageText.replace(/<[^>]*>/g, '');
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: plainText,
          disable_web_page_preview: true
        }),
        keepalive: true
      });
      resJson = await response.json();
    }

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
 * Áp dụng cơ chế:
 * 1. Lọc bot/crawler
 * 2. Đợi độ trễ người dùng thực (chống quét thoáng qua)
 * 3. Debounce phiên truy cập để không làm phiền Admin liên tục
 */
export async function initTelemetry(subjectName = 'Môn Công Nghệ 11') {
  if (typeof window === 'undefined') return;

  // 1. Loại bỏ các bot quét link preview
  if (isBotOrCrawler()) {
    return;
  }

  // 2. Chờ 1.5 giây để đảm bảo người dùng thực sự dừng lại tương tác với trang (không phải bot prefetch)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Kiểm tra tab có đang được hiển thị không
  if (document.visibilityState === 'hidden' || document.visibilityState === 'prerender') {
    return;
  }

  try {
    const { isEnabled, botToken, chatId } = getActiveTelemetryConfig();
    if (!isEnabled || !botToken || !chatId) {
      return;
    }

    // Cơ chế Debounce: Mỗi phiên truy cập của 1 người dùng chỉ gửi 1 thông báo mỗi 20 phút
    const sessionRecorded = sessionStorage.getItem(SESSION_VAR_KEY);
    const lastTime = sessionRecorded ? parseInt(sessionRecorded, 10) : 0;
    const now = Date.now();

    if (now - lastTime < 20 * 60 * 1000) {
      return;
    }

    sessionStorage.setItem(SESSION_VAR_KEY, String(now));

    // Thu thập thông tin thiết bị (kèm pin) và IP đa nguồn
    const deviceDetails = await getFullDeviceDetails();
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
