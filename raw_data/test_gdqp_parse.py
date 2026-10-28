import re

with open("raw_data/gdqp_raw_text.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f.readlines()]

clean_lines = []
for l in lines:
    m = re.match(r'^\d+:\s*(.*)$', l)
    if m:
        clean_lines.append(m.group(1))
    else:
        clean_lines.append(l)

text = "\n".join(clean_lines)

def parse_lesson(lesson_name, lesson_text):
    # Regex to split questions: "Câu 1:", "Câu 1.", "Câu 1 :", etc.
    # Pattern: \n*(?:Câu\s+(\d+)\s*[:.])
    q_splits = re.split(r'\n*(?=Câu\s+\d+\s*[:.])', lesson_text)
    questions = []
    for chunk in q_splits:
        chunk = chunk.strip()
        m = re.match(r'^Câu\s+(\d+)\s*[:.]([\s\S]+)$', chunk)
        if not m:
            continue
        q_num = int(m.group(1))
        content = m.group(2).strip()
        
        # Now find options A., B., C., D.
        # Options might appear like: A. text B. text or \nA. text
        # Let's find positions of A., B., C., D.
        # We can use regex to find where A. starts
        opt_match = re.search(r'(?:^|\s)A\.\s*', content)
        if not opt_match:
            print(f"FAILED TO FIND A. in {lesson_name} Câu {q_num}: {content[:100]}")
            continue
        
        stem = content[:opt_match.start()].strip()
        options_text = content[opt_match.start():].strip()
        
        # Split options
        # We search for: (?<=\s|^)[ABCD]\.\s*
        # or (?:\.|\s|^)([ABCD])\.\s*
        tokens = re.split(r'(?:^|\s+|(?<=[^\s]))(?=[ABCD]\.\s*)', options_text)
        # clean tokens
        opts = []
        cur_opt = None
        for tok in tokens:
            tok = tok.strip()
            if not tok:
                continue
            m_opt = re.match(r'^([ABCD])\.\s*(.*)$', tok, re.DOTALL)
            if m_opt:
                opts.append((m_opt.group(1), m_opt.group(2).strip()))
            else:
                if opts:
                    # append to last
                    letter, prev_t = opts[-1]
                    opts[-1] = (letter, (prev_t + " " + tok).strip())
        
        questions.append((q_num, stem, opts))
    return questions

b1_idx = text.find("BÀI 1:")
b2_idx = text.find("BÀI 2:")
b3_idx = text.find("BÀI 3:")

b1 = parse_lesson("Bài 1", text[b1_idx:b2_idx])
b2 = parse_lesson("Bài 2", text[b2_idx:b3_idx])
b3 = parse_lesson("Bài 3", text[b3_idx:])

print(f"Parsed Bài 1: {len(b1)} questions")
print(f"Parsed Bài 2: {len(b2)} questions")
print(f"Parsed Bài 3: {len(b3)} questions")

for b_name, b_qs in [("Bài 1", b1), ("Bài 2", b2), ("Bài 3", b3)]:
    for q_num, stem, opts in b_qs:
        if len(opts) != 4:
            print(f"ERR in {b_name} Q{q_num}: opts count = {len(opts)} -> {[o[0] for o in opts]}")
            print(f"Stem: {stem}")
            print(f"Opts: {opts}")
