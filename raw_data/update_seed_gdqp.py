import json
import re

with open("raw_data/gdqp_questions.json", "r", encoding="utf-8") as f:
    gdqp_questions = json.load(f)

print(f"Loaded {len(gdqp_questions)} GDQP questions.")

gdqp_subject = {
  "id": "sub_gdqp11",
  "name": "GDQP&AN 11",
  "chapters": [
    {
      "id": "gdqp11_b1",
      "name": "Bài 1: Bảo vệ chủ quyền lãnh thổ, biên giới quốc gia nước CHXHCN Việt Nam",
      "sections": [
        {
          "id": "gdqp11_b1_s1",
          "name": "Chủ quyền lãnh thổ và biên giới quốc gia",
          "content": "Theo Luật Biên giới quốc gia năm 2003 và Luật Biển Việt Nam năm 2012.",
          "points": [
            "Biên giới quốc gia xác định giới hạn lãnh thổ đất liền, các đảo, quần đảo, vùng biển, lòng đất và vùng trời.",
            "Nội thủy: vùng nước phía trong đường cơ sở, là bộ phận lãnh thổ của Việt Nam.",
            "Lãnh hải: rộng 12 hải lí tính từ đường cơ sở.",
            "Tiếp giáp lãnh hải: rộng 12 hải lí tính từ ranh giới ngoài của lãnh hải.",
            "Vùng đặc quyền kinh tế: rộng 200 hải lí tính từ đường cơ sở.",
            "Thềm lục địa: ranh giới ngoài không vượt quá 350 hải lí tính từ đường cơ sở."
          ]
        }
      ]
    },
    {
      "id": "gdqp11_b2",
      "name": "Bài 2: Luật Nghĩa vụ quân sự và trách nhiệm của học sinh",
      "sections": [
        {
          "id": "gdqp11_b2_s1",
          "name": "Luật Nghĩa vụ quân sự 2015",
          "content": "Quy định về độ tuổi, thời hạn phục vụ, tạm hoãn và miễn nghĩa vụ quân sự.",
          "points": [
            "Đăng kí NVQS lần đầu: công dân nam đủ 17 tuổi trở lên vào tháng 4 hằng năm.",
            "Độ tuổi gọi nhập ngũ: đủ 18 đến hết 25 tuổi; học CĐ, ĐH kéo dài đến hết 27 tuổi.",
            "Thời hạn phục vụ tại ngũ trong thời bình: 24 tháng.",
            "Thực hiện nghĩa vụ tham gia CAND là thực hiện NVQS tại ngũ.",
            "Tạm hoãn: chưa đủ sức khỏe, học sinh THPT, sinh viên ĐH chính quy...",
            "Miễn: con liệt sĩ, con thương binh hạng một..."
          ]
        }
      ]
    },
    {
      "id": "gdqp11_b3",
      "name": "Bài 3: Phòng chống tệ nạn xã hội ở Việt Nam trong thời kì hội nhập quốc tế",
      "sections": [
        {
          "id": "gdqp11_b3_s1",
          "name": "Phòng chống tệ nạn xã hội và tội phạm công nghệ cao",
          "content": "Quy định về tội phạm, tệ nạn xã hội, an toàn không gian mạng và trách nhiệm của học sinh.",
          "points": [
            "Tội phạm: hành vi nguy hiểm cho xã hội được quy định trong Bộ luật Hình sự (gồm 13 chương quy định về các tội phạm).",
            "Tội phạm công nghệ cao: tác động trái phép vào thông tin số, mạng máy tính, viễn thông để lừa đảo, phát tán mã độc...",
            "Đánh bạc trái phép dưới mọi hình thức (lô đề, cá độ trực tuyến) đều bị xử lý nghiêm minh.",
            "Trách nhiệm của học sinh: không tham gia tệ nạn, không chia sẻ tin giả, bảo vệ dữ liệu cá nhân, báo cáo vi phạm kịp thời."
          ]
        }
      ]
    }
  ]
}

gdqp_exam = {
  "id": "exam_gdqp11_ghki",
  "name": "GDQP&AN GHKI (52 câu trắc nghiệm)",
  "description": "Đề cương ôn tập kiểm tra giữa HKI môn GDQP&AN 11 năm học 2026-2027 (Bài 1, Bài 2, Bài 3 đầy đủ 52 câu).",
  "questionIds": [q["id"] for q in gdqp_questions],
  "createdAt": "2026-10-28T06:00:00.000Z"
}

# Read current seedData.js
with open("src/services/seedData.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract json inside export const SEED_DATA = ... ;
prefix = "export const SEED_DATA = "
if not content.startswith(prefix):
    # Find prefix
    idx = content.find(prefix)
    header_comment = content[:idx]
    json_str = content[idx+len(prefix):].rstrip().rstrip(';')
else:
    header_comment = "/**\n * Dữ liệu mẫu (Seed Data) chuẩn - Môn Công Nghệ GHKI & GDQP&AN 11 & Tin học 12\n */\n\n"
    json_str = content[len(prefix):].rstrip().rstrip(';')

seed_data = json.loads(json_str)

# 1. Add subject if not present
existing_sub_ids = [s["id"] for s in seed_data["subjects"]]
if "sub_gdqp11" not in existing_sub_ids:
    # Insert right after sub_congnghe_ghki
    seed_data["subjects"].insert(1, gdqp_subject)
    print("Added sub_gdqp11 to subjects.")

# 2. Add questions if not present
existing_q_ids = set(q["id"] for q in seed_data["questions"])
new_qs = [q for q in gdqp_questions if q["id"] not in existing_q_ids]
seed_data["questions"].extend(new_qs)
print(f"Added {len(new_qs)} new questions to seedData. Total questions now: {len(seed_data['questions'])}")

# 3. Add exam if not present
existing_exam_ids = [e["id"] for e in seed_data["exams"]]
if "exam_gdqp11_ghki" not in existing_exam_ids:
    seed_data["exams"].insert(1, gdqp_exam)
    print("Added exam_gdqp11_ghki to exams.")

# Re-write src/services/seedData.js
new_content = header_comment + "export const SEED_DATA = " + json.dumps(seed_data, ensure_ascii=False, indent=2) + ";\n"

with open("src/services/seedData.js", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated src/services/seedData.js successfully!")
