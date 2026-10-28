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
        
        # Look for \nA. or start of A.
        m_A = re.search(r'\n\s*A\.\s*', content)
        if m_A:
            stem = content[:m_A.start()].strip()
            options_text = content[m_A.start():].strip()
        else:
            m_AB = re.search(r'(?:\n|\s{2,})A\.\s*', content)
            if m_AB:
                stem = content[:m_AB.start()].strip()
                options_text = content[m_AB.start():].strip()
            else:
                m_direct = re.search(r'(?:\b|\s)A\.\s*', content)
                stem = content[:m_direct.start()].strip()
                options_text = content[m_direct.start():].strip()

        # In options_text, remove leading 'A.'
        opt_A_match = re.search(r'^A\.\s*', options_text)
        if not opt_A_match:
            print(f"Error matching opt_A in {lesson_name} Q{q_num}")
            continue
            
        rem = options_text[opt_A_match.end():]
        m_B = re.search(r'B\.\s*', rem)
        if not m_B:
            print(f"Error B in {lesson_name} Q{q_num}: {rem}")
            continue
        opt_A = rem[:m_B.start()].strip()
        rem_B = rem[m_B.end():]
        
        m_C = re.search(r'C\.\s*', rem_B)
        if not m_C:
            print(f"Error C in {lesson_name} Q{q_num}: {rem_B}")
            continue
        opt_B = rem_B[:m_C.start()].strip()
        rem_C = rem_B[m_C.end():]
        
        m_D = re.search(r'D\.\s*', rem_C)
        if not m_D:
            print(f"Error D in {lesson_name} Q{q_num}: {rem_C}")
            continue
        opt_C = rem_C[:m_D.start()].strip()
        opt_D = rem_C[m_D.end():].strip()
        
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
print("SUCCESS!")
