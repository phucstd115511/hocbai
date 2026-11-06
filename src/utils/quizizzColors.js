/**
 * Quizizz Vibrant Color Palette & Randomization Engine
 * Mô phỏng chính xác bảng màu rực rỡ và cơ chế màu ngẫu nhiên cho từng câu hỏi theo chuẩn UI/UX Quizizz.
 * Bảng 4 màu chủ đạo:
 * 1. Xanh cốm (Lime / Chartreuse): #878C00 (Viền 3D: #5C6000)
 * 2. Tím hoa cà (Purple / Orchid): #9B65C3 (Viền 3D: #734199)
 * 3. Cam rực rỡ (Vivid Orange):    #EC6219 (Viền 3D: #B44309)
 * 4. Xanh ngọc (Ocean Teal):       #12A18F (Viền 3D: #0B6F63)
 */

export const QUIZIZZ_CARD_PALETTES = [
  {
    id: 'lime',
    name: 'Xanh Cốm',
    bg: '#878C00',
    hoverBg: '#969B00',
    border: '#5C6000',
    activeBg: '#767A00',
    ring: 'rgba(135, 140, 0, 0.75)',
    shadow: 'rgba(135, 140, 0, 0.45)',
    text: '#ffffff',
  },
  {
    id: 'purple',
    name: 'Tím Hoa Cà',
    bg: '#9B65C3',
    hoverBg: '#AA74D3',
    border: '#734199',
    activeBg: '#8A53B0',
    ring: 'rgba(155, 101, 195, 0.75)',
    shadow: 'rgba(155, 101, 195, 0.45)',
    text: '#ffffff',
  },
  {
    id: 'orange',
    name: 'Cam Rực Rỡ',
    bg: '#EC6219',
    hoverBg: '#F86D26',
    border: '#B44309',
    activeBg: '#D65411',
    ring: 'rgba(236, 98, 25, 0.75)',
    shadow: 'rgba(236, 98, 25, 0.45)',
    text: '#ffffff',
  },
  {
    id: 'teal',
    name: 'Xanh Ngọc',
    bg: '#12A18F',
    hoverBg: '#15B5A2',
    border: '#0B6F63',
    activeBg: '#0F8D7D',
    ring: 'rgba(18, 161, 143, 0.75)',
    shadow: 'rgba(18, 161, 143, 0.45)',
    text: '#ffffff',
  },
];

// Tất cả 24 hoán vị khả dĩ của 4 màu để đảm bảo mỗi câu hỏi có sự sắp xếp màu sắc ngẫu nhiên, không cố định
const PERMUTATIONS_4 = [
  [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1], [0, 3, 1, 2], [0, 3, 2, 1],
  [1, 0, 2, 3], [1, 0, 3, 2], [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
  [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0], [2, 3, 0, 1], [2, 3, 1, 0],
  [3, 0, 1, 2], [3, 0, 2, 1], [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0],
];

/**
 * Trả về bộ màu ngẫu nhiên cho từng câu hỏi (xoay quanh 4 màu Quizizz trong ảnh)
 * - Mỗi câu hỏi nhận một hoán vị màu khác biệt (không cố định)
 * - Trong suốt quá trình người dùng chọn / re-render câu hỏi đó, màu giữ nguyên không bị chớp giật
 * - Khi đổi seed (ví dụ bấm "Trộn lại đề"), màu sẽ được xáo trộn ngẫu nhiên lượt mới
 */
export function getQuestionQuizizzColors(questionId, seed = 0) {
  let hash = 0;
  const key = `q_${String(questionId || 'q')}_seed_${String(seed)}`;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  const permIdx = Math.abs(hash) % PERMUTATIONS_4.length;
  const perm = PERMUTATIONS_4[permIdx];
  return perm.map(idx => QUIZIZZ_CARD_PALETTES[idx]);
}
