import json

with open('/home/admin/Projects/hocbai/raw_data/cong_nghe_ghki_full.json', 'r', encoding='utf-8') as f:
    cn_data = json.load(f)

# Old Tin học 12 data
sub_tinhoc12 = {
    "id": "sub_tinhoc12",
    "name": "Tin học 12 - Khoa học máy tính",
    "chapters": [
        {
            "id": "chap_ai",
            "name": "Chương 1: Trí tuệ nhân tạo (AI)",
            "sections": [
                {
                    "id": "sec_ai_concept",
                    "name": "Mục 1.1: Khái niệm và đặc trưng của AI",
                    "content": "Trí tuệ nhân tạo (AI) là khả năng của máy tính thực hiện các nhiệm vụ thông minh như con người.",
                    "points": [
                        "AI thu hẹp (Narrow AI): chỉ giải quyết nhiệm vụ cụ thể.",
                        "AI tổng quát (AGI): có trí tuệ ngang hoặc hơn con người ở mọi lĩnh vực."
                    ]
                }
            ]
        }
    ]
}

exam_cn = cn_data["exam"]
exam_tin = {
    "id": "exam_mau_01",
    "name": "Đề Khảo Sát Năng Lực Giữa Kỳ - Tin Học 12",
    "description": "Đề ôn tập tổng hợp môn Tin học 12.",
    "questionIds": ["q_ai_001", "q_net_001", "q_db_001"],
    "createdAt": "2026-10-25T10:00:00.000Z"
}

sample_attempt_cn = {
    "id": "att_cn_001",
    "examId": "exam_congnghe_ghki",
    "examName": "Công Nghệ GHKI",
    "answers": {
        "q_cn11_chap_b1_01": 0,
        "q_cn11_chap_b1_02": 2,
        "q_cn11_chap_b1_03": 0,
        "q_cn11_chap_b1_18": { "a": True, "b": False, "c": True, "d": False }
    },
    "score": 4.0,
    "totalMaxScore": 4.0,
    "percentage": 100.0,
    "chapterBreakdown": {
        "Bài 1: Khái quát về cơ khí chế tạo": { "correct": 4.0, "total": 4.0, "percent": 100 }
    },
    "wrongQuestionIds": [],
    "date": "2026-10-28T09:00:00.000Z",
    "durationSeconds": 185
}

full_seed = {
    "subjects": [cn_data["subject"], sub_tinhoc12],
    "questions": cn_data["questions"],
    "exams": [exam_cn, exam_tin],
    "attempts": [sample_attempt_cn]
}

out_content = f"""/**
 * Dữ liệu mẫu (Seed Data) chuẩn - Bao gồm Môn Công Nghệ GHKI (93 câu hỏi đầy đủ đáp án)
 */

export const SEED_DATA = {json.dumps(full_seed, ensure_ascii=False, indent=2)};
"""

with open('/home/admin/Projects/hocbai/src/services/seedData.js', 'w', encoding='utf-8') as f:
    f.write(out_content)

print("Updated /home/admin/Projects/hocbai/src/services/seedData.js successfully!")
