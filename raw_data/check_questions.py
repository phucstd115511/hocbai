import re, json

with open('/home/admin/Projects/hocbai/raw_data/parsed_ans.txt', 'r', encoding='utf-8') as f:
    raw_lines = [line.strip() for line in f.readlines()]

clean_lines = []
for line in raw_lines:
    m = re.match(r'^\d{3}:\s*(.*)$', line)
    txt = m.group(1).strip() if m else line.strip()
    if txt:
        clean_lines.append(txt)

full_text = '\n'.join(clean_lines)

sections_raw = re.split(r'\n(?=BÀI \d+[:\.] )', full_text)

for s_idx in range(1, 7):
    sec = sections_raw[s_idx]
    title = sec.split('\n')[0]
    # Find all Câu
    q_matches = re.split(r'\n(?=Câu\s+\d+[\s\:\.])', sec)
    print(f'=== {title} ===')
    print(f'Total questions found: {len(q_matches) - 1}')
    for q_i, q_text in enumerate(q_matches[1:], 1):
        q_first = q_text.split('\n')[0]
        # check if true false
        has_tf = bool(re.search(r'(\b[a-d][\)\.]|<u>[a-d][\)\.]</u>)', q_text))
        has_mcq = bool(re.search(r'(\b[A-D][\)\.]|<u>[A-D][\)\.]</u>)', q_text))
        print(f'  Q{q_i:02d}: {q_first[:50]}... [MCQ={has_mcq}, TF={has_tf}]')
