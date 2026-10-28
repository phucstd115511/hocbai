import re
import json

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]

def clean_tags(s):
    return re.sub(r'\[/?[^\]]+\]', '', s).strip()

def is_cau_header(line):
    clean = clean_tags(line)
    return re.match(r'^Câu\s*(\d+)\s*[:.]', clean)

p1_idx = 3
p2_idx = 125
p3_idx = 214
p4_idx = 257

# --- 1. MCQ (Phần I: lines 3 -> 125) ---
p1_text = "\n".join(lines[p1_idx:p2_idx])
def normalize_q_starts(t, prefix):
    pattern = r'\[?[A-Z,()0-9]*\]?Câu\b(?:\[/?[^\]]+\]|\s|\d)*[.:]'
    def repl(m):
        raw = m.group(0)
        nums = re.findall(r'\d+', clean_tags(raw))
        if nums:
            return f"\n<<<{prefix}_{nums[0]}>>>\n"
        return raw
    return re.sub(pattern, repl, t)

p1_marked = normalize_q_starts(p1_text, "MCQ")
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
    diff = "nhan_biet" if q_num <= 20 else ("thong_hieu" if q_num <= 30 else "van_dung")
    chap_id = "chap_dia11_c1" if q_num <= 20 else "chap_dia11_c2"
    
    mcqs.append({
        "id": f"q_dia11_p1_{q_num:02d}",
        "type": "mcq",
        "subjectId": "sub_dia11",
        "chapterId": chap_id,
        "sectionId": f"{chap_id}_s1",
        "stem": stem,
        "options": [o[1] for o in opts],
        "correct": corr_idx,
        "explanation": f"Phương án đúng là {correct_letter}.",
        "difficulty": diff,
        "tags": ["Địa lí 11", "Giữa HKI", "Phần I: Trắc nghiệm"],
        "favorite": False,
        "createdAt": "2026-10-28T09:50:00.000Z",
        "updatedAt": "2026-10-28T09:50:00.000Z"
    })

# --- 2. True / False (Phần II: lines 125 -> 214) ---
tf_qs = []
cur_tf = None
for l in lines[p2_idx:p3_idx]:
    m_cau = is_cau_header(l)
    if m_cau:
        if cur_tf: tf_qs.append(cur_tf)
        q_num = int(m_cau.group(1))
        clean_l = clean_tags(l)
        after_cau = re.sub(r'^Câu\s*\d+\s*[:.]\s*', '', clean_l).strip()
        cur_tf = {
            'num': q_num,
            'stem_parts': [after_cau] if after_cau else [],
            'stmts': []
        }
        continue
    m_stmt = re.search(r'(\[([A-Z0-9,()#]+)\])?\s*([abcd])\)\s*(?:\[/[A-Z0-9,()#]+\])?(.*)$', l)
    if m_stmt and cur_tf is not None:
        tag_val = m_stmt.group(2) or ''
        lbl = m_stmt.group(3)
        body = m_stmt.group(4)
        is_u = 'U' in tag_val
        clean_text = clean_tags(body).strip()
        cur_tf['stmts'].append({
            'label': lbl,
            'text': clean_text,
            'answer': is_u
        })
    else:
        if cur_tf is not None and len(cur_tf['stmts']) == 0:
            clean_l = clean_tags(l).strip()
            if clean_l and clean_l != 'Cho thông tin sau:' and clean_l != 'Cho thông tin:':
                cur_tf['stem_parts'].append(clean_l)

if cur_tf: tf_qs.append(cur_tf)

tfs = []
for q in tf_qs:
    stem_txt = " ".join([p for p in q['stem_parts'] if p])
    diff = "thong_hieu" if q['num'] <= 4 else "van_dung"
    chap_id = "chap_dia11_c1" if q['num'] <= 6 else "chap_dia11_c2"
    expl = "Đáp án các ý: " + ", ".join([f"{s['label']}) {'ĐÚNG' if s['answer'] else 'SAI'}" for s in q['stmts']])
    tfs.append({
        "id": f"q_dia11_p2_{q['num']:02d}",
        "type": "truefalse",
        "subjectId": "sub_dia11",
        "chapterId": chap_id,
        "sectionId": f"{chap_id}_s1",
        "stem": stem_txt,
        "statements": q['stmts'],
        "explanation": expl,
        "difficulty": diff,
        "tags": ["Địa lí 11", "Giữa HKI", "Phần II: Đúng / Sai"],
        "favorite": False,
        "createdAt": "2026-10-28T09:50:00.000Z",
        "updatedAt": "2026-10-28T09:50:00.000Z"
    })

# --- 3. Short Answer (Phần III: lines 214 -> 257) ---
sa_qs = []
cur_sa = None
for l in lines[p3_idx:p4_idx]:
    m_cau = is_cau_header(l)
    if m_cau:
        if cur_sa: sa_qs.append(cur_sa)
        q_num = int(m_cau.group(1))
        clean_l = clean_tags(l)
        after_cau = re.sub(r'^Câu\s*\d+\s*[:.]\s*', '', clean_l).strip()
        cur_sa = {
            'num': q_num,
            'stem_lines': [after_cau] if after_cau else [],
            'ans': None
        }
        continue
    clean_l = clean_tags(l).strip()
    m_ans = re.match(r'^Đáp án\s*:\s*(.*)$', clean_l)
    if m_ans and cur_sa is not None:
        cur_sa['ans'] = m_ans.group(1).strip()
    else:
        if cur_sa is not None and cur_sa['ans'] is None:
            if clean_l:
                cur_sa['stem_lines'].append(clean_l)

if cur_sa: sa_qs.append(cur_sa)

sas = []
for q in sa_qs:
    stem_txt = " ".join(q['stem_lines'])
    chap_id = "chap_dia11_c1" if q['num'] <= 6 else "chap_dia11_c2"
    sas.append({
        "id": f"q_dia11_p3_{q['num']:02d}",
        "type": "short_answer",
        "subjectId": "sub_dia11",
        "chapterId": chap_id,
        "sectionId": f"{chap_id}_s1",
        "stem": stem_txt,
        "answer": q['ans'],
        "explanation": f"Đáp án chính xác: {q['ans']}",
        "difficulty": "van_dung",
        "tags": ["Địa lí 11", "Giữa HKI", "Phần III: Trả lời ngắn"],
        "favorite": False,
        "createdAt": "2026-10-28T09:50:00.000Z",
        "updatedAt": "2026-10-28T09:50:00.000Z"
    })

all_dia = mcqs + tfs + sas
print(f"Generated: MCQs={len(mcqs)}, TFs={len(tfs)}, SAs={len(sas)}. Total={len(all_dia)}")

with open('raw_data/dia_questions.json', 'w', encoding='utf-8') as f:
    json.dump(all_dia, f, ensure_ascii=False, indent=2)

print("Saved raw_data/dia_questions.json!")
