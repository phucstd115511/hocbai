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

def clean_tags(s):
    return re.sub(r'\[/?[^\]]+\]', '', s).strip()

# --- 1. Parse Part 1 (MCQ: Câu 1 -> 35) ---
# Replace any pattern of "Câu ... [.:]" with marker
def normalize_q_starts(t):
    # Matches: Câu with optional tags and numbers up to : or .
    pattern = r'\[?[A-Z,()0-9]*\]?Câu\b(?:\[/?[^\]]+\]|\s|\d)*[.:]'
    def repl(m):
        raw = m.group(0)
        nums = re.findall(r'\d+', clean_tags(raw))
        if nums:
            return f"\n<<<MCQ_{nums[0]}>>>\n"
        return raw
    return re.sub(pattern, repl, t)

p1_marked = normalize_q_starts(part1_text)
mcq_chunks = re.split(r'\n*<<<MCQ_(\d+)>>>\n*', p1_marked)

mcqs = []
for i in range(1, len(mcq_chunks), 2):
    q_num = int(mcq_chunks[i])
    raw = mcq_chunks[i+1].strip()
    
    # Correct letter: look for [...,U,...]A or [B,U]A or [B,U]A.
    corr_m = re.findall(r'\[(?:[^\]]*,)?U(?:,[^\]]*)?\]\s*([ABCD])', raw)
    correct_letter = corr_m[0] if corr_m else None
    
    clean = clean_tags(raw)
    
    # Split stem and options A, B, C, D
    m_A = re.search(r'(?:\n|\s{2,}|^)\s*A[\.:]\s*', clean)
    if not m_A: m_A = re.search(r'A[\.:]\s*', clean)
    stem = clean[:m_A.start()].strip()
    opt_str = clean[m_A.start():].strip()
    
    # Split options A, B, C, D
    # Use regex lookahead
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
                
    mcqs.append({
        'num': q_num,
        'stem': stem,
        'options': [o[1] for o in opts],
        'opts_dict': {o[0]: o[1] for o in opts},
        'correct': ['A', 'B', 'C', 'D'].index(correct_letter) if correct_letter in ['A', 'B', 'C', 'D'] else -1,
        'correct_letter': correct_letter
    })

print(f"Total MCQs parsed: {len(mcqs)} (expected 35)")
for q in mcqs:
    if len(q['options']) != 4 or q['correct'] == -1:
        print(f"ERR MCQ {q['num']}: opts={len(q['options'])}, corr={q['correct_letter']}")
        print(f"Stem: {q['stem']}")
        print(f"Opts: {q['opts_dict']}")

# --- 2. Parse Part 2 (True / False: Câu 1 -> 8) ---
def normalize_tf_starts(t):
    pattern = r'\[?[A-Z,()0-9]*\]?Câu\b(?:\[/?[^\]]+\]|\s|\d)*[.:]'
    def repl(m):
        raw = m.group(0)
        nums = re.findall(r'\d+', clean_tags(raw))
        if nums:
            return f"\n<<<TF_{nums[0]}>>>\n"
        return raw
    return re.sub(pattern, repl, t)

p2_marked = normalize_tf_starts(part2_text)
tf_chunks = re.split(r'\n*<<<TF_(\d+)>>>\n*', p2_marked)

tfs = []
for i in range(1, len(tf_chunks), 2):
    q_num = int(tf_chunks[i])
    raw = tf_chunks[i+1].strip()
    
    # Underlined a), b), c), d) means TRUE. Non-underlined means FALSE!
    # Let's inspect each line or statement
    # Find statements marked by a), b), c), d)
    # We can split by pattern for statements: (?:\[[^\]]*\])?([abcd])\)(?:\[/[^\]]*\])?
    # Let's see how each statement is formatted in raw
    stmt_splits = re.split(r'(?=\[?[^\]]*\]?[abcd]\)(?:\[/[^\]]*\])?)', raw)
    stem_part = clean_tags(stmt_splits[0]).strip()
    # clean stem if starts with "Cho thông tin sau:" or similar
    
    statements = []
    for s_chunk in stmt_splits[1:]:
        s_chunk = s_chunk.strip()
        if not s_chunk: continue
        # match label
        m_lbl = re.match(r'^(\[?[^\]]*\]?)([abcd])\)(.*)$', s_chunk, re.DOTALL)
        if m_lbl:
            tag_before = m_lbl.group(1)
            lbl = m_lbl.group(2)
            content = m_lbl.group(3)
            # Check if label has underline [...,U,...] or if content has it at start
            is_true = 'U' in tag_before or '[B,U]' in s_chunk[:20] or '[U]' in s_chunk[:20] or '[B,U,C' in s_chunk[:20]
            clean_text = clean_tags(content).strip()
            statements.append({
                'label': lbl,
                'text': clean_text,
                'answer': is_true
            })
    tfs.append({
        'num': q_num,
        'stem': stem_part,
        'statements': statements
    })

print(f"Total True/False parsed: {len(tfs)} (expected 8)")
for tf in tfs:
    print(f"TF Q{tf['num']}: {len(tf['statements'])} stmts -> {[s['label'] + ':' + str(s['answer']) for s in tf['statements']]}")

# --- 3. Parse Part 3 (Short Answer / Calculation: Câu 1 -> 8) ---
def normalize_sa_starts(t):
    pattern = r'\[?[A-Z,()0-9]*\]?Câu\b(?:\[/?[^\]]+\]|\s|\d)*[.:]'
    def repl(m):
        raw = m.group(0)
        nums = re.findall(r'\d+', clean_tags(raw))
        if nums:
            return f"\n<<<SA_{nums[0]}>>>\n"
        return raw
    return re.sub(pattern, repl, t)

p3_marked = normalize_sa_starts(part3_text)
sa_chunks = re.split(r'\n*<<<SA_(\d+)>>>\n*', p3_marked)

sas = []
for i in range(1, len(sa_chunks), 2):
    q_num = int(sa_chunks[i])
    raw = sa_chunks[i+1].strip()
    clean = clean_tags(raw)
    
    # Find answer
    m_ans = re.search(r'Đáp án\s*:\s*([0-9.,\-]+)', clean)
    ans = m_ans.group(1).strip() if m_ans else None
    
    stem = clean[:m_ans.start()].strip() if m_ans else clean
    sas.append({
        'num': q_num,
        'stem': stem,
        'answer': ans
    })

print(f"Total Short Answer parsed: {len(sas)} (expected 8)")
for sa in sas:
    print(f"SA Q{sa['num']}: ans={sa['answer']}")
