/**
 * Dịch vụ kiểm tra và cảnh báo trùng lặp câu hỏi
 */

function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tạo tập hợp n-gram hoặc từ
 */
function getWords(str) {
  const norm = normalizeText(str);
  return norm ? norm.split(' ').filter(w => w.length > 0) : [];
}

/**
 * Tính toán độ tương đồng Dice Coefficient giữa 2 chuỗi (0 -> 1)
 */
export function calculateSimilarity(str1, str2) {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  const words1 = getWords(norm1);
  const words2 = getWords(norm2);

  if (words1.length === 0 || words2.length === 0) return 0;

  // Đếm từ xuất hiện chung
  const freqMap1 = {};
  for (const w of words1) {
    freqMap1[w] = (freqMap1[w] || 0) + 1;
  }

  let intersection = 0;
  for (const w of words2) {
    if (freqMap1[w] && freqMap1[w] > 0) {
      intersection++;
      freqMap1[w]--;
    }
  }

  return (2.0 * intersection) / (words1.length + words2.length);
}

/**
 * Kiểm tra xem câu hỏi có bị trùng lặp với danh sách câu hỏi hiện có không
 * @param {Object} newQuestion Câu hỏi cần kiểm tra
 * @param {Array} existingQuestions Danh sách câu hỏi hiện có
 * @param {number} threshold Ngưỡng cảnh báo trùng (mặc định 0.75 tức 75%)
 * @returns {Object|null} Thông tin câu trùng nếu vượt ngưỡng, hoặc null
 */
export function findDuplicateQuestion(newQuestion, existingQuestions = [], threshold = 0.75) {
  if (!newQuestion || !newQuestion.stem || !existingQuestions.length) return null;

  let bestMatch = null;
  let highestSim = 0;

  for (const q of existingQuestions) {
    // Bỏ qua chính nó nếu đang cập nhật
    if (q.id === newQuestion.id) continue;

    // Ưu tiên so sánh trong cùng môn học (nếu có)
    const isSameSubject = !newQuestion.subjectId || !q.subjectId || newQuestion.subjectId === q.subjectId;
    if (!isSameSubject) continue;

    const sim = calculateSimilarity(newQuestion.stem, q.stem);
    if (sim > highestSim) {
      highestSim = sim;
      bestMatch = q;
    }
  }

  if (highestSim >= threshold && bestMatch) {
    return {
      similarity: Math.round(highestSim * 100),
      question: bestMatch
    };
  }

  return null;
}
