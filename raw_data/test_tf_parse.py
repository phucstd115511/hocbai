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

# Split each question in Part 2
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
    
    # Each statement line starts with something like:
    # [B,U]a)[/B,U] or [B]b)[/B] or [B,U,C(303030)]a)[/B,U,C(303030)]
    # Or in the middle of a line
    # Find all statements: [abcd]\)
    stmt_matches = re.finditer(r'(\[([A-Z0-9,()#]+)\])?\s*([abcd])\)\s*(\[/[A-Z0-9,()#]+\])?', content)
    
    # Collect items
    found_stmts = []
    for m in stmt_matches:
        tag_val = m.group(2) or ''
        label = m.group(3)
        is_u = 'U' in tag_val
        found_stmts.append((label, is_u))
    print(f"TF {q_num}: {found_stmts}")
