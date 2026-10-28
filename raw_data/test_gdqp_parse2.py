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
    q_splits = re.split(r'\n*(?=Câu\s+\d+\s*[:.])', lesson_text)
    questions = []
    for chunk in q_splits:
        chunk = chunk.strip()
        m = re.match(r'^Câu\s+(\d+)\s*[:.]([\s\S]+)$', chunk)
        if not m:
            continue
        q_num = int(m.group(1))
        content = m.group(2).strip()
        
        # We can find options by looking for lines starting with A. or \n\s*A\.
        # Or look for pattern where A., B., C., D. are in order
        # Let's search for \n\s*A\.
        m_A = re.search(r'\n\s*A\.\s*', content)
        if m_A:
            stem = content[:m_A.start()].strip()
            options_text = content[m_A.start():].strip()
        else:
            # Fallback: search for A. followed later by B.
            m_AB = re.search(r'(?:\n|\s{2,})A\.\s*', content)
            if m_AB:
                stem = content[:m_AB.start()].strip()
                options_text = content[m_AB.start():].strip()
            else:
                print(f"FAILED A for {lesson_name} Q{q_num}")
                continue

        # Split options A, B, C, D in options_text
        # We know options_text starts with A.
        # Find positions of B., C., D.
        # Note: B., C., D. can be preceded by whitespace or period or newline
        m_B = re.search(r'(?:^|[\n\s.]|\.|\s)B\.\s*', options_text)
        # To be safe, find matches of ([ABCD])\.\s*
        # But only 1 of each A, B, C, D
        pos_A = re.search(r'^A\.\s*', options_text)
        pos_B = re.search(r'(?:\n|\.|\s{2,}|\s)B\.\s*', options_text)
        pos_C = re.search(r'(?:\n|\.|\s{2,}|\s)C\.\s*', options_text)
        pos_D = re.search(r'(?:\n|\.|\s{2,}|\s)D\.\s*', options_text)
        
        if not (pos_A and pos_B and pos_C and pos_D):
            print(f"MISSING ABCD in {lesson_name} Q{q_num}")
            continue
            
        opt_A = options_text[pos_A.end():pos_B.start()].strip()
        # Clean trailing dot if it was matched
        if opt_A.endswith('.'):
            # Keep the period in text if it belongs to option
            pass
        opt_B = options_text[pos_B.end():pos_C.start()].strip()
        opt_C = options_text[pos_C.end():pos_D.start()].strip()
        opt_D = options_text[pos_D.end():].strip()
        
        # Strip trailing punctuation if needed or keep clean
        opts = [opt_A, opt_B, opt_C, opt_D]
        questions.append((q_num, stem, opts))
    return questions

b1_idx = text.find("BÀI 1:")
b2_idx = text.find("BÀI 2:")
b3_idx = text.find("BÀI 3:")

b1 = parse_lesson("Bài 1", text[b1_idx:b2_idx])
b2 = parse_lesson("Bài 2", text[b2_idx:b3_idx])
b3 = parse_lesson("Bài 3", text[b3_idx:])

print(f"Bài 1: {len(b1)}/20")
print(f"Bài 2: {len(b2)}/16")
print(f"Bài 3: {len(b3)}/16")

for b_name, b_qs in [("Bài 1", b1), ("Bài 2", b2), ("Bài 3", b3)]:
    for q_num, stem, opts in b_qs:
        for i, opt in enumerate(opts):
            letter = ['A', 'B', 'C', 'D'][i]
            if not opt:
                print(f"EMPTY OPT {letter} in {b_name} Q{q_num}")
print("ALL CHECKED!")
