import re

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]

def clean_tags(s):
    return re.sub(r'\[/?[^\]]+\]', '', s).strip()

def is_cau_header(line):
    # test if line starts with Câu \d+
    clean = clean_tags(line)
    return re.match(r'^Câu\s*(\d+)\s*[:.]', clean)

p2_idx = 0
for i, l in enumerate(lines):
    if "PHẦN II" in l:
        p2_idx = i + 1
        break

tf_qs = []
cur_q = None

for l in lines[p2_idx:]:
    if "Phần III" in l:
        if cur_q: tf_qs.append(cur_q)
        break
        
    m_cau = is_cau_header(l)
    if m_cau:
        if cur_q: tf_qs.append(cur_q)
        q_num = int(m_cau.group(1))
        # remainder of line after Câu X:
        clean_l = clean_tags(l)
        after_cau = re.sub(r'^Câu\s*\d+\s*[:.]\s*', '', clean_l).strip()
        cur_q = {
            'num': q_num,
            'stem_parts': [after_cau] if after_cau else [],
            'stmts': []
        }
        continue
        
    m_stmt = re.search(r'(\[([A-Z0-9,()#]+)\])?\s*([abcd])\)\s*(?:\[/[A-Z0-9,()#]+\])?(.*)$', l)
    if m_stmt and cur_q is not None:
        tag_val = m_stmt.group(2) or ''
        lbl = m_stmt.group(3)
        body = m_stmt.group(4)
        is_u = 'U' in tag_val
        clean_text = clean_tags(body).strip()
        cur_q['stmts'].append({
            'label': lbl,
            'text': clean_text,
            'answer': is_u
        })
    else:
        if cur_q is not None and len(cur_q['stmts']) == 0:
            clean_l = clean_tags(l).strip()
            if clean_l and clean_l != 'Cho thông tin sau:' and clean_l != 'Cho thông tin:':
                cur_q['stem_parts'].append(clean_l)

print(f"Total parsed TF questions: {len(tf_qs)}")
for q in tf_qs:
    stem_txt = " ".join([p for p in q['stem_parts'] if p])
    print(f"TF {q['num']}: {len(q['stmts'])} stmts | Stem='{stem_txt[:60]}...'")
    for s in q['stmts']:
        print(f"   {s['label']}) {'ĐÚNG' if s['answer'] else 'SAI'}: {s['text'][:40]}")
