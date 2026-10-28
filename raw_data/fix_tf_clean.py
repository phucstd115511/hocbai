import re

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]

# Collect paragraphs for each TF question 1 to 8
# Notice in dia_raw_text.txt, each statement is its own paragraph line!
p2_idx = 0
for i, l in enumerate(lines):
    if "PHẦN II" in l:
        p2_idx = i
        break

tf_qs = []
cur_q = None

for l in lines[p2_idx:]:
    if "Phần III" in l:
        if cur_q: tf_qs.append(cur_q)
        break
    
    # Check if line is Câu \d+:
    m_q = re.match(r'^(?:\[B\])?Câu\s*(\d+)[:.](.*)$', l)
    if not m_q:
        m_q = re.match(r'^\[B[^\]]*\]Câu\s*\[/B[^\]]*\]\s*\[B[^\]]*\](\d+)\[/B[^\]]*\][:.](.*)$', l)
    if not m_q:
        m_q = re.match(r'^\[[^\]]*\]Câu\s*(\d+)[:.](.*)$', l)
        
    if m_q:
        if cur_q: tf_qs.append(cur_q)
        cur_q = {
            'num': int(m_q.group(1)),
            'stem_lines': [m_q.group(2).strip()] if m_q.group(2).strip() else [],
            'stmts': []
        }
        continue
        
    # Check if line is statement a), b), c), d)
    m_stmt = re.search(r'(\[([A-Z0-9,()#]+)\])?\s*([abcd])\)\s*(?:\[/[A-Z0-9,()#]+\])?(.*)$', l)
    if m_stmt and cur_q is not None:
        tag_val = m_stmt.group(2) or ''
        lbl = m_stmt.group(3)
        body = m_stmt.group(4)
        is_u = 'U' in tag_val
        clean_text = re.sub(r'\[/?[^\]]+\]', '', body).strip()
        cur_q['stmts'].append({
            'label': lbl,
            'text': clean_text,
            'answer': is_u
        })
    else:
        if cur_q is not None and not cur_q['stmts']:
            clean_l = re.sub(r'\[/?[^\]]+\]', '', l).strip()
            if clean_l and clean_l != 'Cho thông tin sau:' and clean_l != 'Cho thông tin:':
                cur_q['stem_lines'].append(clean_l)

print(f"Parsed TF questions: {len(tf_qs)}")
for q in tf_qs:
    print(f"Q{q['num']}: Stem='{' '.join(q['stem_lines'])[:60]}...'")
    for s in q['stmts']:
        print(f"  {s['label']}) {s['answer']}: {s['text'][:40]}")
