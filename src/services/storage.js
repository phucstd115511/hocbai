import { SEED_DATA } from './seedData.js';

const STORAGE_KEYS = {
  SUBJECTS: 'hocbai_subjects_v1',
  QUESTIONS: 'hocbai_questions_v1',
  EXAMS: 'hocbai_exams_v1',
  ATTEMPTS: 'hocbai_attempts_v1',
  SETTINGS: 'hocbai_settings_v1'
};

const DEFAULT_SETTINGS = {
  theme: 'light',
  geminiApiKey: '',
  scoringMode: 'standard_thpt', // 'standard_thpt' (lũy tiến 0.1-0.25-0.5-1.0) hoặc 'proportional' (chia đều)
  examTimeMinutes: 15
};

/**
 * Đọc dữ liệu từ localStorage, nếu chưa có thì khởi tạo từ SEED_DATA
 */
export function getStoredData() {
  try {
    let subjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS));
    let questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS));
    let exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    let attempts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS));
    let settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));

    // Nếu lần đầu truy cập, nạp dữ liệu mẫu
    if (!subjects || !questions) {
      subjects = SEED_DATA.subjects;
      questions = SEED_DATA.questions;
      exams = SEED_DATA.exams;
      attempts = SEED_DATA.attempts;
      saveAllData({ subjects, questions, exams, attempts });
    } else {
      // Đảm bảo "Công Nghệ GHKI" luôn có mặt trong hệ thống
      let needsResave = false;
      const hasCongNgheSub = subjects.some(s => s.id === 'sub_congnghe_ghki' || s.name === 'Công Nghệ GHKI');
      if (!hasCongNgheSub) {
        const cnSubject = SEED_DATA.subjects.find(s => s.id === 'sub_congnghe_ghki');
        const cnExam = SEED_DATA.exams.find(e => e.id === 'exam_congnghe_ghki');
        const cnQuestions = SEED_DATA.questions.filter(q => q.subjectId === 'sub_congnghe_ghki');

        if (cnSubject) subjects = [cnSubject, ...subjects];
        if (cnExam) exams = [cnExam, ...exams];
        if (cnQuestions.length > 0) {
          const existingIds = new Set(questions.map(q => q.id));
          const newQ = cnQuestions.filter(q => !existingIds.has(q.id));
          questions = [...newQ, ...questions];
        }
        needsResave = true;
      }

      // Đảm bảo "GDQP&AN 11" luôn có mặt trong hệ thống
      const hasGdqpSub = subjects.some(s => s.id === 'sub_gdqp11' || s.name.includes('GDQP'));
      if (!hasGdqpSub) {
        const gdqpSubject = SEED_DATA.subjects.find(s => s.id === 'sub_gdqp11');
        const gdqpExam = SEED_DATA.exams.find(e => e.id === 'exam_gdqp11_ghki');
        const gdqpQuestions = SEED_DATA.questions.filter(q => q.subjectId === 'sub_gdqp11');

        if (gdqpSubject) subjects = [...subjects, gdqpSubject];
        if (gdqpExam && !exams.some(e => e.id === 'exam_gdqp11_ghki')) exams = [...exams, gdqpExam];
        if (gdqpQuestions.length > 0) {
          const existingIds = new Set(questions.map(q => q.id));
          const newQ = gdqpQuestions.filter(q => !existingIds.has(q.id));
          questions = [...questions, ...newQ];
        }
        needsResave = true;
      }

      // Xóa bỏ Tin học 12 nếu còn lưu trong localStorage của trình duyệt
      const hasTinHoc = subjects.some(s => s.id === 'sub_tinhoc12' || s.name?.includes('Tin học 12'));
      if (hasTinHoc) {
        subjects = subjects.filter(s => s.id !== 'sub_tinhoc12' && !s.name?.includes('Tin học 12'));
        questions = questions.filter(q => q.subjectId !== 'sub_tinhoc12');
        exams = exams.filter(e => e.id !== 'exam_mau_01');
        needsResave = true;
      }

      if (needsResave) {
        saveAllData({ subjects, questions, exams, attempts });
      }
    }

    if (!settings) {
      settings = DEFAULT_SETTINGS;
      saveSettings(settings);
    }

    return {
      subjects: subjects || [],
      questions: questions || [],
      exams: exams || [],
      attempts: attempts || [],
      settings: { ...DEFAULT_SETTINGS, ...settings }
    };
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
    return {
      subjects: SEED_DATA.subjects,
      questions: SEED_DATA.questions,
      exams: SEED_DATA.exams,
      attempts: SEED_DATA.attempts,
      settings: DEFAULT_SETTINGS
    };
  }
}

/**
 * Lưu toàn bộ dữ liệu vào localStorage
 */
export function saveAllData({ subjects, questions, exams, attempts }) {
  try {
    if (subjects) localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    if (questions) localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    if (exams) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    if (attempts) localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu vào localStorage:', error);
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Lỗi khi lưu settings:', error);
  }
}

/**
 * Xuất dữ liệu ra file JSON để tải về máy
 */
export function exportDataToJSON() {
  const data = getStoredData();
  const exportPayload = {
    appName: 'Học Bài - Ngân Hàng Câu Hỏi',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: {
      subjects: data.subjects,
      questions: data.questions,
      exams: data.exams,
      attempts: data.attempts
    }
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `hocbai_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Nhập dữ liệu từ file JSON
 * @param {string} jsonString Nội dung file JSON
 * @param {'replace'|'merge'} mode Chế độ: 'replace' (ghi đè toàn bộ) hoặc 'merge' (gộp thêm)
 */
export function importDataFromJSON(jsonString, mode = 'replace') {
  try {
    const parsed = JSON.parse(jsonString);
    const incomingData = parsed.data || parsed;

    if (!incomingData.questions || !Array.isArray(incomingData.questions)) {
      throw new Error('Định dạng tệp JSON không hợp lệ: thiếu danh sách câu hỏi.');
    }

    if (mode === 'replace') {
      const payload = {
        subjects: incomingData.subjects || [],
        questions: incomingData.questions || [],
        exams: incomingData.exams || [],
        attempts: incomingData.attempts || []
      };
      saveAllData(payload);
      return { success: true, count: payload.questions.length };
    } else {
      // Chế độ gộp (merge)
      const current = getStoredData();
      
      // Gộp môn học (tránh trùng id)
      const existingSubIds = new Set(current.subjects.map(s => s.id));
      const mergedSubjects = [...current.subjects];
      for (const sub of (incomingData.subjects || [])) {
        if (!existingSubIds.has(sub.id)) {
          mergedSubjects.push(sub);
          existingSubIds.add(sub.id);
        }
      }

      // Gộp câu hỏi (tránh trùng id)
      const existingQIds = new Set(current.questions.map(q => q.id));
      const mergedQuestions = [...current.questions];
      let addedQCount = 0;
      for (const q of (incomingData.questions || [])) {
        if (!existingQIds.has(q.id)) {
          mergedQuestions.push(q);
          existingQIds.add(q.id);
          addedQCount++;
        }
      }

      // Gộp đề thi
      const existingExamIds = new Set(current.exams.map(e => e.id));
      const mergedExams = [...current.exams];
      for (const ex of (incomingData.exams || [])) {
        if (!existingExamIds.has(ex.id)) {
          mergedExams.push(ex);
          existingExamIds.add(ex.id);
        }
      }

      const payload = {
        subjects: mergedSubjects,
        questions: mergedQuestions,
        exams: mergedExams,
        attempts: current.attempts
      };
      saveAllData(payload);
      return { success: true, count: addedQCount };
    }
  } catch (error) {
    console.error('Lỗi nhập dữ liệu JSON:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Đặt lại dữ liệu về mặc định (Seed Data)
 */
export function resetToSeedData() {
  saveAllData({
    subjects: SEED_DATA.subjects,
    questions: SEED_DATA.questions,
    exams: SEED_DATA.exams,
    attempts: SEED_DATA.attempts
  });
  return SEED_DATA;
}
