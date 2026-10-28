import re

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]
text = "\n".join(lines)

p1_idx = text.find("PHẦN I")
p2_idx = text.find("PHẦN II")
p1_text = text[p1_idx:p2_idx]

# Split questions: [B]Câu [/B]... or Câu \d+
q_chunks = re.split(r'\n*(?=(?:\[B\])?Câu\s*(?:\[\/B\])?\s*(?:\[B\])?\d+)', p1_text)

print(f"Total chunks in P1: {len(q_chunks)}")
# Check each question
for idx, c in enumerate(q_chunks):
    if not c.strip() or "PHẦN I" in c:
        continue
    # find question number
    m_num = re.search(r'Câu\s*(?:\[\/B\])?\s*(?:\[B\])?(\d+)', c)
    q_num = m_num.group(1) if m_num else "UNKNOWN"
    
    # check options A, B, C, D and which one has [B,U] or [U]
    # let's see how [B,U]A.[/B,U] looks
    has_u = re.findall(r'\[(?:B,)?U(?:,[^\]]+)?\]([ABCD])\.(?:\[/[^\]]+\])?', c)
    print(f"Q{q_num}: Correct={has_u}")
