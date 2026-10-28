import json

with open("raw_data/dia_questions.json", "r", encoding="utf-8") as f:
    dia_questions = json.load(f)

print(f"Loaded {len(dia_questions)} Dia questions.")

dia_subject = {
  "id": "sub_dia11",
  "name": "Địa Lí 11",
  "chapters": [
    {
      "id": "chap_dia11_c1",
      "name": "Một số vấn đề về kinh tế - xã hội thế giới",
      "sections": [
        {
          "id": "chap_dia11_c1_s1",
          "name": "Toàn cầu hóa, khu vực hóa kinh tế & Các vấn đề an ninh toàn cầu",
          "content": "Khái quát về các nhóm nước, toàn cầu hóa, khu vực hóa kinh tế, an ninh lương thực, năng lượng, nguồn nước và an ninh mạng.",
          "points": [
            "Tiêu chí phân chia các nhóm nước: GNI/người, cơ cấu ngành kinh tế và HDI.",
            "Toàn cầu hóa: dòng hàng hóa, dịch vụ, vốn và lao động di chuyển tự do.",
            "Khu vực hóa: liên kết dựa trên tương đồng địa lí, văn hóa, mục tiêu phát triển.",
            "An ninh phi truyền thống: an ninh năng lượng, lương thực, nguồn nước, an ninh mạng."
          ]
        }
      ]
    },
    {
      "id": "chap_dia11_c2",
      "name": "Địa lí khu vực Mỹ La-tinh",
      "sections": [
        {
          "id": "chap_dia11_c2_s1",
          "name": "Điều kiện tự nhiên, dân cư, xã hội và kinh tế Mỹ La-tinh",
          "content": "Vị trí địa lí, đặc điểm tự nhiên, tài nguyên thiên nhiên, quá trình đô thị hóa và phát triển kinh tế khu vực Mỹ La-tinh.",
          "points": [
            "Vị trí: nằm giữa Đại Tây Dương và Thái Bình Dương.",
            "Tự nhiên: giàu tài nguyên khoáng sản, thủy điện ở phía Tây.",
            "Dân cư - xã hội: đa dạng chủng tộc, nhiều người lai, đô thị hóa sớm gắn với nhập cư.",
            "Kinh tế: dịch chuyển tăng tỉ trọng dịch vụ, chênh lệch giàu nghèo lớn, nợ nước ngoài cao."
          ]
        }
      ]
    }
  ]
}

dia_exam = {
  "id": "exam_dia11_ghki",
  "name": "Địa Lí 11 - Đề Cương Ôn Tập Giữa HKI",
  "description": "Đề cương ôn tập kiểm tra giữa HKI môn Địa lí 11 (35 câu trắc nghiệm nhiều lựa chọn + 8 câu đúng sai 4 ý + 8 câu trả lời ngắn).",
  "questionIds": [q["id"] for q in dia_questions],
  "createdAt": "2026-10-28T09:50:00.000Z"
}

with open("src/services/seedData.js", "r", encoding="utf-8") as f:
    content = f.read()

prefix = "export const SEED_DATA = "
idx = content.find(prefix)
header_comment = content[:idx]
json_str = content[idx+len(prefix):].rstrip().rstrip(';')

seed_data = json.loads(json_str)

# 1. Add subject
existing_sub_ids = [s["id"] for s in seed_data["subjects"]]
if "sub_dia11" not in existing_sub_ids:
    seed_data["subjects"].append(dia_subject)
    print("Added sub_dia11 to subjects.")

# 2. Add questions
existing_q_ids = set(q["id"] for q in seed_data["questions"])
new_qs = [q for q in dia_questions if q["id"] not in existing_q_ids]
seed_data["questions"].extend(new_qs)
print(f"Added {len(new_qs)} new Dia questions. Total questions now: {len(seed_data['questions'])}")

# 3. Add exam
existing_exam_ids = [e["id"] for e in seed_data["exams"]]
if "exam_dia11_ghki" not in existing_exam_ids:
    seed_data["exams"].append(dia_exam)
    print("Added exam_dia11_ghki to exams.")

new_content = header_comment + prefix + json.dumps(seed_data, ensure_ascii=False, indent=2) + ";\n"

with open("src/services/seedData.js", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated seedData.js with Dia 11 successfully!")
