import re

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

lines = [re.sub(r'^\d+:\s*', '', l) for l in raw_lines]
text = "\n".join(lines)

p1_idx = text.find("PHẦN I")
p2_idx = text.find("PHẦN II")
p3_idx = text.find("Phần III")
p4_idx = text.find("Phần IV")

part1_text = text[p1_idx:p2_idx]
part2_text = text[p2_idx:p3_idx]
part3_text = text[p3_idx:p4_idx if p4_idx != -1 else len(text)]

# --- TEST PART 1 (MCQ) ---
# Clean formatting tags for stem / options text
def clean_tags(s):
    return re.sub(r'\[/?[^\]]+\]', '', s).strip()

def parse_mcq(p1_text):
    # Match questions from Câu 1 to Câu 35
    # Replace all tags inside "Câu ... :" with simple "CÂU_START_X:"
    def repl_q(m):
        raw = m.group(0)
        num_m = re.findall(r'\d+', clean_tags(raw))
        if num_m:
            return f"\n===Q_START_{num_m[0]}===\n"
        return raw

    # Pattern for Câu \d+
    marked_text = re.sub(r'(?:\[B\])?Câu\s*(?:\[\/B\])?\s*(?:\[B\])?\d+(?:\[\/B\])?\s*(?:\[B\])?\d*(?:\[\/B\])?\s*[:.]', repl_q, p1_text)
    
    chunks = re.split(r'\n*===Q_START_(\d+)===\n*', marked_text)
    questions = []
    
    # chunks will alternate: [preamble, '1', content1, '2', content2, ...]
    for i in range(1, len(chunks), 2):
        q_num = int(chunks[i])
        raw_content = chunks[i+1].strip()
        
        # Check correct answer by looking for [B,U]A or [U]A or [B,U]A. etc.
        # Find all occurrences of underlined option letters
        # Note: could be [B,U]A.[/B,U] or [B,U]C[/B,U][B].[/B]
        corr_m = re.findall(r'\[(?:[^\]]*,)?U(?:,[^\]]*)?\]\s*([ABCD])', raw_content)
        correct_letter = corr_m[0] if corr_m else None
        
        # Split options A, B, C, D in clean text
        # But wait, options might be:
        # A. text B. text
        # Let's find positions of A., B., C., D.
        # First clean tags except keep option marks
        # Let's mark options with OPT_A, OPT_B, OPT_C, OPT_D
        clean_content = clean_tags(raw_content)
        
        # In clean_content, find:
        # \s*A[\.:]\s* ... \s*B[\.:]\s* ...
        # Regex to split:
        m_opts = re.search(r'(?:\n|\s{2,}|^)\s*A[\.:]\s*', clean_content)
        if not m_opts:
            m_opts = re.search(r'A[\.:]\s*', clean_content)
            
        stem = clean_content[:m_opts.start()].strip()
        opt_str = clean_content[m_opts.start():].strip()
        
        # Split A, B, C, D
        # Pattern: [ABCD][\.:]
        opt_parts = re.split(r'(?:(?<=\s)|(?<=[^\s]))(?=[ABCD][\.:]\s*)', opt_str)
        opts = []
        for op in opt_parts:
            op = op.strip()
            if not op: continue
            m_op = re.match(r'^([ABCD])[\.:]\s*(.*)$', op, re.DOTALL)
            if m_op:
                opts.append((m_op.group(1), m_op.group(2).strip()))
            else:
                if opts:
                    opts[-1] = (opts[-1][0], opts[-1][1] + ' ' + op)
                    
        questions.append({
            'num': q_num,
            'stem': stem,
            'opts': [o[1] for o in opts],
            'correct_letter': correct_letter,
            'opts_dict': {o[0]: o[1] for o in opts}
        })
    return questions

mcqs = parse_mcq(part1_text)
print(f"Parsed MCQ count: {len(mcqs)}")
for q in mcqs:
    opt_keys = list(q['opts_dict'].keys())
    if len(opt_keys) != 4 or not q['correct_letter']:
        print(f"ERR Q{q['num']}: keys={opt_keys}, corr={q['correct_letter']}")
        print(f"Stem: {q['stem']}")
        print(f"Opts: {q['opts_dict']}")
print("MCQ check finished.")
