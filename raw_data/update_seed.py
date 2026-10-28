import json

with open('/home/admin/Projects/hocbai/raw_data/cong_nghe_ghki_full.json', 'r', encoding='utf-8') as f:
    cn_data = json.load(f)

old_tinhoc_questions = [
    {
      "id": "q_ai_001",
      "type": "mcq",
      "subjectId": "sub_tinhoc12",
      "chapterId": "chap_ai",
      "sectionId": "sec_ai_concept",
      "stem": "Hệ thống AI hiện nay phần lớn thuộc loại nào sau đây?",
      "options": [
        "Trí tuệ nhân tạo hẹp (Narrow AI / Weak AI)",
        "Trí tuệ nhân tạo tổng quát (AGI)",
        "Siêu trí tuệ nhân tạo (ASI)",
        "Trí tuệ nhân tạo có cảm xúc và ý thức độc lập"
      ],
      "correct": 0,
      "explanation": "Hiện nay hầu hết các ứng dụng AI như nhận diện khuôn mặt, trợ lý ảo, cờ vua... đều là Narrow AI (AI hẹp), tập trung hoàn thành xuất sắc một nhiệm vụ cụ thể.",
      "difficulty": "nhan_biet",
      "tags": ["AI", "khái niệm", "phân loại"],
      "favorite": False,
      "createdAt": "2026-10-25T08:00:00.000Z",
      "updatedAt": "2026-10-25T08:00:00.000Z"
    },
    {
      "id": "q_net_001",
      "type": "mcq",
      "subjectId": "sub_tinhoc12",
      "chapterId": "chap_network",
      "sectionId": "sec_tcpip",
      "stem": "Địa chỉ IPv4 có độ dài bao nhiêu bit và được chia thành bao nhiêu octet?",
      "options": [
        "$32$ bit, chia thành $4$ octet cách nhau bởi dấu chấm",
        "$64$ bit, chia thành $8$ octet",
        "$128$ bit, chia thành $16$ nhóm hexa",
        "$48$ bit, chia thành $6$ cặp byte"
      ],
      "correct": 0,
      "explanation": "Địa chỉ IPv4 có độ dài $32$ bit, gồm 4 byte (octet), mỗi octet từ $0$ đến $255$ cách nhau bởi dấu chấm (ví dụ: $192.168.1.1$).",
      "difficulty": "nhan_biet",
      "tags": ["mạng", "IPv4", "giao thức"],
      "favorite": False,
      "createdAt": "2026-10-25T08:30:00.000Z",
      "updatedAt": "2026-10-25T08:30:00.000Z"
    },
    {
      "id": "q_db_001",
      "type": "mcq",
      "subjectId": "sub_tinhoc12",
      "chapterId": "chap_db",
      "sectionId": "sec_rdbms",
      "stem": "Trong cơ sở dữ liệu quan hệ, thuộc tính hoặc tập thuộc tính dùng để phân biệt duy nhất mỗi bản ghi trong bảng được gọi là gì?",
      "options": [
        "Khóa chính (Primary Key)",
        "Khóa ngoại (Foreign Key)",
        "Chỉ mục thứ cấp (Secondary Index)",
        "Trường dữ liệu rỗng (NULL Field)"
      ],
      "correct": 0,
      "explanation": "Khóa chính (Primary Key) xác định duy nhất từng hàng/bản ghi trong bảng và không bao giờ được chứa giá trị NULL.",
      "difficulty": "nhan_biet",
      "tags": ["CSDL", "khóa chính", "quan hệ"],
      "favorite": False,
      "createdAt": "2026-10-25T09:00:00.000Z",
      "updatedAt": "2026-10-25T09:00:00.000Z"
    }
]

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
                    "points": ["AI thu hẹp (Narrow AI)", "AI tổng quát (AGI)"]
                }
            ]
        },
        {
            "id": "chap_network",
            "name": "Chương 2: Mạng máy tính và An toàn thông tin",
            "sections": [
                {
                    "id": "sec_tcpip",
                    "name": "Mục 2.1: Giao thức mạng và TCP/IP",
                    "content": "Địa chỉ IPv4 và IPv6.",
                    "points": ["IPv4 32 bit", "IPv6 128 bit"]
                }
            ]
        },
        {
            "id": "chap_db",
            "name": "Chương 3: Cơ sở dữ liệu và SQL",
            "sections": [
                {
                    "id": "sec_rdbms",
                    "name": "Mục 3.1: Mô hình dữ liệu quan hệ",
                    "content": "Khóa chính và khóa ngoại.",
                    "points": ["Khóa chính không NULL"]
                }
            ]
        }
    ]
}

exam_cn = cn_data["exam"]
exam_tin = {
    "id": "exam_mau_01",
    "name": "Đề Khảo Sát Năng Lực Giữa Kỳ - Tin Học 12",
    "description": "Đề ôn tập môn Tin học 12.",
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
    "questions": cn_data["questions"] + old_tinhoc_questions,
    "exams": [exam_cn, exam_tin],
    "attempts": [sample_attempt_cn]
}

out_content = f"""/**
 * Dữ liệu mẫu (Seed Data) chuẩn - Môn Công Nghệ GHKI (93 câu hỏi đầy đủ đáp án) & Tin học 12
 */

export const SEED_DATA = {json.dumps(full_seed, ensure_ascii=False, indent=2)};
"""

with open('/home/admin/Projects/hocbai/src/services/seedData.js', 'w', encoding='utf-8') as f:
    f.write(out_content)

print("Updated seedData.js with both Công Nghệ GHKI and Tin học 12 successfully!")
