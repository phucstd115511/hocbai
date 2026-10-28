import json

with open("src/services/seedData.js", "r", encoding="utf-8") as f:
    content = f.read()

prefix = "export const SEED_DATA = "
idx = content.find(prefix)
header_comment = content[:idx]
json_str = content[idx+len(prefix):].rstrip().rstrip(';')

seed_data = json.loads(json_str)

# Filter out Tin học 12 from subjects
seed_data["subjects"] = [s for s in seed_data["subjects"] if s["id"] != "sub_tinhoc12"]

# Filter out Tin học questions
seed_data["questions"] = [q for q in seed_data["questions"] if q.get("subjectId") != "sub_tinhoc12"]

# Filter out exam_mau_01
seed_data["exams"] = [e for e in seed_data["exams"] if e["id"] != "exam_mau_01"]

print(f"Subjects remaining: {[s['name'] for s in seed_data['subjects']]}")
print(f"Total questions remaining: {len(seed_data['questions'])}")
print(f"Exams remaining: {[e['name'] for e in seed_data['exams']]}")

new_content = header_comment + prefix + json.dumps(seed_data, ensure_ascii=False, indent=2) + ";\n"

with open("src/services/seedData.js", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated seedData.js successfully!")
