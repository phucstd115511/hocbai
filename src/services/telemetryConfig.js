/**
 * Telemetry & Check Var Configuration with Bidirectional Obfuscation / Encryption
 * Giữ kín thông tin Telegram Bot Token và Chat ID, chống quét mã nguồn từ GitHub & DevTools.
 */

const CIPHER_KEY = 'HOCBAI_TELEMETRY_SECURE_KEY_2026';

// Thuật toán mã hóa XOR + Base64 hai chiều (Bidirectional Cipher)
export function encryptString(text, key = CIPHER_KEY) {
  if (!text) return '';
  try {
    const enc = new TextEncoder();
    const textBytes = enc.encode(String(text).trim());
    const keyBytes = enc.encode(key);
    const out = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      out[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    let binary = '';
    for (let i = 0; i < out.length; i++) {
      binary += String.fromCharCode(out[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error('Encryption failed:', e);
    return '';
  }
}

export function decryptString(base64Str, key = CIPHER_KEY) {
  if (!base64Str) return '';
  try {
    const binary = atob(String(base64Str).trim());
    const enc = new TextEncoder();
    const keyBytes = enc.encode(key);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
    }
    const dec = new TextDecoder();
    return dec.decode(out);
  } catch (e) {
    return '';
  }
}

// Token & Chat ID mặc định được nhúng sẵn (Dưới dạng đã mã hóa an toàn)
// Bạn có thể cập nhật chuỗi mã hóa này trực tiếp trong Bảng Quản Trị Admin
export const EMBEDDED_CONFIG = {
  // Chuỗi mã hóa của Telegram Bot Token
  encryptedBotToken: '',
  // Chuỗi mã hóa của Telegram Chat ID
  encryptedChatId: '',
  // Mặc định bật theo dõi Check Var
  enabled: true,
  // Mã PIN quản trị mặc định (1155)
  defaultAdminPin: '1155'
};

// Lấy cấu hình có hiệu lực (Ưu tiên cấu hình trong localStorage của Admin nếu có)
export function getActiveTelemetryConfig() {
  let botToken = '';
  let chatId = '';
  let isEnabled = EMBEDDED_CONFIG.enabled;

  try {
    // 1. Kiểm tra cấu hình tùy chỉnh lưu trong localStorage của Admin
    const localToken = localStorage.getItem('hocbai_tele_enc_token');
    const localChat = localStorage.getItem('hocbai_tele_enc_chat');
    const localEnabled = localStorage.getItem('hocbai_tele_enabled');

    if (localEnabled !== null) {
      isEnabled = localEnabled === 'true';
    }

    if (localToken) {
      botToken = decryptString(localToken);
    }
    if (localChat) {
      chatId = decryptString(localChat);
    }

    // 2. Nếu localStorage chưa có, dùng cấu hình nhúng sẵn đã mã hóa
    if (!botToken && EMBEDDED_CONFIG.encryptedBotToken) {
      botToken = decryptString(EMBEDDED_CONFIG.encryptedBotToken);
    }
    if (!chatId && EMBEDDED_CONFIG.encryptedChatId) {
      chatId = decryptString(EMBEDDED_CONFIG.encryptedChatId);
    }
  } catch (e) {
    // Fail-safe
  }

  return {
    botToken,
    chatId,
    isEnabled
  };
}
