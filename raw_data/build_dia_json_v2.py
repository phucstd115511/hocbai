import re
import json

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]
text = "\n".join(lines)

p1_idx = text.find("PHẦN I")
p2_idx = text.find("PHẦN II")
p3_idx = text.find("Phần III")
p4_idx = text.find("Phần IV")

part1_text = text[p1_idx:p2_idx]
part2_text = text[p2_idx:p3_idx]
part3_text = text[p3_idx:p4_idx if p4_idx != -1 else len(text)]

def clean_tags(s):
    return re.sub(r'\[/?[^\]]+\]', '', s).strip()

def normalize_q_starts(t, prefix):
    pattern = r'\[?[A-Z,()0-9]*\]?Câu\b(?:\[/?[^\]]+\]|\s|\d)*[.:]'
    def repl(m):
        raw = m.group(0)
        nums = re.findall(r'\d+', clean_tags(raw))
        if nums:
            return f"\n<<<{prefix}_{nums[0]}>>>\n"
        return raw
    return re.sub(pattern, repl, t)

# --- 1. MCQ (Câu 1 -> 35) ---
p1_marked = normalize_q_starts(part1_text, "MCQ")
mcq_chunks = re.split(r'\n*<<<MCQ_(\d+)>>>\n*', p1_marked)
mcqs = []
for i in range(1, len(mcq_chunks), 2):
    q_num = int(mcq_chunks[i])
    raw = mcq_chunks[i+1].strip()
    
    corr_m = re.findall(r'\[(?:[^\]]*,)?U(?:,[^\]]*)?\]\s*([ABCD])', raw)
    correct_letter = corr_m[0] if corr_m else None
    
    clean = clean_tags(raw)
    m_A = re.search(r'(?:\n|\s{2,}|^)\s*A[\.:]\s*', clean)
    if not m_A: m_A = re.search(r'A[\.:]\s*', clean)
    stem = clean[:m_A.start()].strip()
    opt_str = clean[m_A.start():].strip()
    
    opt_parts = re.split(r'(?:(?<=\s)|(?<=[^\s]))(?=[ABCD][\.:]\s*)', opt_str)
    opts = []
    for op in opt_parts:
        op = op.strip()
        if not op: continue
        m_op = re.match(r'^([ABCD])[\.:]\s*(.*)$', op, re.DOTALL)
        if m_op:
            opts.append((m_op.group(1), m_op.group(2).strip()))
        else:
            if opts:
                opts[-1] = (opts[-1][0], opts[-1][1] + ' ' + op)
                
    corr_idx = ['A', 'B', 'C', 'D'].index(correct_letter) if correct_letter in ['A', 'B', 'C', 'D'] else -1
    
    # difficulty
    diff = "nhan_biet" if q_num <= 20 else ("thong_hieu" if q_num <= 30 else "van_dung")
    
    q_obj = {
        "id": f"q_dia11_p1_{q_num:02d}",
        "type": "mcq",
        "subjectId": "sub_dia11",
        "chapterId": "chap_dia11_p1" if q_num <= 20 else "chap_dia11_p2",
        "sectionId": "sec_dia11",
        "stem": stem,
        "options": [o[1] for o in opts],
        "correct": corr_idx,
        "explanation": f"Đáp án đúng là {correct_letter}.",
        "difficulty": diff,
        "tags": ["Địa lí 11", "Giữa HKI", "Phần I: Trắc nghiệm"],
        "favorite": False,
        "createdAt": "2026-10-28T09:50:00.000Z",
        "updatedAt": "2026-10-28T09:50:00.000Z"
    }
    mcqs.append(q_obj)

# --- 2. True / False (Câu 1 -> 8) ---
p2_marked = normalize_q_starts(part2_text, "TF")
tf_chunks = re.split(r'\n*<<<TF_(\d+)>>>\n*', p2_marked)
tfs = []
for i in range(1, len(tf_chunks), 2):
    q_num = int(tf_chunks[i])
    content = tf_chunks[i+1].strip()
    
    # Split stem and statements
    first_stmt_m = re.search(r'(?:\[[^\]]+\])?\s*[abcd]\)', content)
    if first_stmt_m:
        stem = clean_tags(content[:first_stmt_m.start()]).strip()
        stmts_content = content[first_stmt_m.start():]
    else:
        stem = ""
        stmts_content = content
        
    s_splits = re.split(r'(?=(?:\[[^\]]+\])?\s*[abcd]\))', stmts_content)
    parsed_stmts = []
    for s in s_splits:
        s = s.strip()
        if not s: continue
        # match label [abcd]
        # s begins with [B,U]a)... or [B]a)... or [B,U,C(303030)]a)...
        m_lbl = re.search(r'^\[([^\]]+)\]\s*([abcd])\)\s*(?:\[/[^\]]+\])?(.*)$', s, re.DOTALL)
        if m_lbl:
            tag_name = m_lbl.group(1)
            lbl = m_lbl.group(2)
            body = m_lbl.group(3)
            is_u = 'U' in tag_name
        else:
            m_simple = re.search(r'^([abcd])\)\s*(.*)$', s, re.DOTALL)
            lbl = m_simple.group(1) if m_simple else "a"
            body = m_simple.group(2) if m_simple else s
            is_u = False
            
        parsed_stmts.append({
            "label": lbl,
            "text": clean_tags(body).strip(),
            "answer": is_u
        })
        
    q_obj = {
        "id": f"q_dia11_p2_{q_num:02d}",
        "type": "truefalse",
        "subjectId": "sub_dia11",
        "chapterId": "chap_dia11_p2_tf",
        "sectionId": "sec_dia11",
        "stem": stem,
        "statements": parsed_stmts,
        "explanation": f"Đáp án các ý: " + ", ".join([f"{s['label']}) {'ĐÚNG' if s['answer'] else 'SAI'}" for s in parsed_stmts]),
        "difficulty": "thong_hieu" if q_num <= 4 else "van_dung",
        "tags": ["Địa lí 11", "Giữa HKI", "Phần II: Đúng / Sai"],
        "favorite": False,
        "createdAt": "2026-10-28T09:50:00.000Z",
        "updatedAt": "2026-10-28T09:50:00.000Z"
    }
    tfs.append(q_obj)

# --- 3. Short Answer (Câu 1 -> 8) ---
p3_marked = normalize_q_starts(part3_text, "SA")
sa_chunks = re.split(r'\n*<<<SA_(\d+)>>>\n*', p3_marked)
sas = []
for i in range(1, len(sa_chunks), 2):
    q_num = int(sa_chunks[i])
    raw = sa_chunks[i+1].strip()
    clean = clean_tags(raw)
    
    m_ans = re.search(r'Đáp án\s*:\s*([0-9.,\-]+)', clean)
    ans = m_ans.group(1).strip() if m_ans else ""
    stem = clean[:m_ans.start()].strip() if m_ans else clean
    
    q_obj = {
        "id": f"q_dia11_p3_{q_num:02d}",
        "type": "short_answer",
        "subjectId": "sub_dia11",
        "chapterId": "chap_dia11_p3_sa",
        "sectionId": "sec_dia11",
        "stem": stem,
        "answer": ans,
        "explanation": f"Đáp án chính xác: {ans}",
        "difficulty": "van_dung",
        "tags": ["Địa lí 11", "Giữa HKI", "Phần III: Trả lời ngắn"],
        "favorite": False,
        "createdAt": "2026-10-28T09:50:00.000Z",
        "updatedAt": "2026-10-28T09:50:00.000Z"
    }
    sas.append(q_obj)

all_dia_questions = mcqs + tfs + sas
print(f"Total Dia questions: {len(all_dia_questions)}")
print(f"MCQ: {len(mcqs)}, TF: {len(tfs)}, SA: {len(sas)}")

with open('raw_data/dia_questions.json', 'w', encoding='utf-8') as f:
    json.dump(all_dia_questions, f, ensure_ascii=False, indent=2)

print("Saved raw_data/dia_questions.json successfully!")
