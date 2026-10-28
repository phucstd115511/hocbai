import re

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]
text = "\n".join(lines)

p2_idx = text.find("PHẦN II")
p3_idx = text.find("Phần III")
part2_text = text[p2_idx:p3_idx]

def clean_tags(s):
    return re.sub(r'\[/?[^\]]+\]', '', s).strip()

pattern = r'\[?[A-Z,()0-9]*\]?Câu\b(?:\[/?[^\]]+\]|\s|\d)*[.:]'
def repl(m):
    raw = m.group(0)
    nums = re.findall(r'\d+', clean_tags(raw))
    if nums:
        return f"\n<<<TF_{nums[0]}>>>\n"
    return raw

p2_marked = re.sub(pattern, repl, part2_text)
chunks = re.split(r'\n*<<<TF_(\d+)>>>\n*', p2_marked)

for i in range(1, len(chunks), 2):
    q_num = int(chunks[i])
    content = chunks[i+1].strip()
    
    # We want to find the first statement line. The text before that is the stem.
    # A statement starts with something like: [B,U]a)[/B,U] or [B]a)[/B] or [B,U]a) or a)
    first_stmt_m = re.search(r'(?:\[[^\]]+\])?\s*[abcd]\)', content)
    if first_stmt_m:
        stem = clean_tags(content[:first_stmt_m.start()]).strip()
        stmts_content = content[first_stmt_m.start():]
    else:
        stem = ""
        stmts_content = content
        
    # Split stmts_content by each statement marker:
    # (?=(?:\[[^\]]+\])?\s*[abcd]\))
    s_splits = re.split(r'(?=(?:\[[^\]]+\])?\s*[abcd]\))', stmts_content)
    parsed_stmts = []
    for s in s_splits:
        s = s.strip()
        if not s: continue
        # match label [abcd]
        m_lbl = re.search(r'(\[([A-Z0-9,()#]+)\])?\s*([abcd])\)\s*(?:\[/[A-Z0-9,()#]+\])?(.*)$', s, re.DOTALL)
        if m_lbl:
            tag_name = m_lbl.group(2) or ''
            lbl = m_lbl.group(3)
            body = m_lbl.group(4)
            is_u = 'U' in tag_name
            parsed_stmts.append((lbl, is_u, clean_tags(body).strip()))
            
    print(f"TF {q_num}: Stem len={len(stem)}, Stmts={len(parsed_stmts)}")
    for lbl, is_u, b in parsed_stmts:
        print(f"  {lbl}) is_u={is_u}: {b[:40]}")
