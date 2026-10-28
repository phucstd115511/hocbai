import re

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]

def clean_tags(s):
    return re.sub(r'\[/?[^\]]+\]', '', s).strip()

def is_cau_header(line):
    clean = clean_tags(line)
    return re.match(r'^Câu\s*(\d+)\s*[:.]', clean)

p3_idx = 0
for i, l in enumerate(lines):
    if "Phần III" in l:
        p3_idx = i + 1
        break

sa_qs = []
cur_q = None

for l in lines[p3_idx:]:
    if "Phần IV" in l or "HẾT" in l:
        if cur_q: sa_qs.append(cur_q)
        break
        
    m_cau = is_cau_header(l)
    if m_cau:
        if cur_q: sa_qs.append(cur_q)
        q_num = int(m_cau.group(1))
        clean_l = clean_tags(l)
        after_cau = re.sub(r'^Câu\s*\d+\s*[:.]\s*', '', clean_l).strip()
        cur_q = {
            'num': q_num,
            'stem_lines': [after_cau] if after_cau else [],
            'ans': None
        }
        continue
        
    clean_l = clean_tags(l).strip()
    m_ans = re.match(r'^Đáp án\s*:\s*(.*)$', clean_l)
    if m_ans and cur_q is not None:
        cur_q['ans'] = m_ans.group(1).strip()
    else:
        if cur_q is not None and cur_q['ans'] is None:
            if clean_l:
                cur_q['stem_lines'].append(clean_l)

print(f"Total parsed SA questions: {len(sa_qs)}")
for q in sa_qs:
    stem_txt = " ".join(q['stem_lines'])
    print(f"SA {q['num']}: Ans={q['ans']} | Stem='{stem_txt[:60]}...'")
