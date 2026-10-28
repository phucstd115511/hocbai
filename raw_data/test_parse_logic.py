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

def clean_html_tags(s):
    return re.sub(r'</?u>', '', s).strip()

def parse_mcq(q_raw_text):
    text = q_raw_text.replace('\n', ' ')
    m_stem = re.search(r'^(Câu\s+\d+[\s\:\.]*.*?)(?=(?:<u>)?[A-D][\.\:\s])', text)
    if not m_stem:
        stem = text[:100]
        rest = text[100:]
    else:
        stem = m_stem.group(1).strip()
        rest = text[len(m_stem.group(1)):].strip()
    
    stem_clean = re.sub(r'^Câu\s+\d+[\s\:\.]*', '', stem).strip()
    
    pattern = r'((?:<u>)?[A-D](?:\.)?(?:</u>)?[\.\:\s])'
    parts = re.split(pattern, rest)
    
    options_raw = {}
    current_label = None
    for p in parts:
        p_strip = p.strip()
        label_match = re.match(r'^(?:<u>)?([A-D])(?:\.)?(?:</u>)?[\.\:\s]*$', p_strip)
        if label_match:
            current_label = label_match.group(1).upper()
            options_raw[current_label] = {
                'is_underlined': '<u>' in p,
                'text': ''
            }
        elif current_label:
            options_raw[current_label]['text'] += p
            if '<u>' in p:
                options_raw[current_label]['is_underlined'] = True

    letters = ['A', 'B', 'C', 'D']
    options = []
    correct_idx = 0
    for idx, letter in enumerate(letters):
        info = options_raw.get(letter, {'text': f'Phương án {letter}', 'is_underlined': False})
        opt_text = clean_html_tags(info['text']).strip()
        opt_text = re.sub(r'^[A-D][\.\:]\s*', '', opt_text).strip()
        options.append(opt_text)
        if info['is_underlined']:
            correct_idx = idx

    return stem_clean, options, correct_idx

def parse_truefalse(q_raw_text):
    text = q_raw_text.replace('\n', ' ')
    m_stem = re.search(r'^(Câu\s+\d+[\s\:\.]*.*?)(?=(?:<u>|a̲\))?[a-d][\)\.\:\s])', text)
    if not m_stem:
        stem = text[:100]
        rest = text[100:]
    else:
        stem = m_stem.group(1).strip()
        rest = text[len(m_stem.group(1)):].strip()
    
    stem_clean = re.sub(r'^Câu\s+\d+[\s\:\.]*', '', stem).strip()
    
    pattern = r'((?:<u>|a̲\)|c̲\))?[a-d][\)\.\:\s](?:</u>)?)'
    parts = re.split(pattern, rest)
    
    statements_raw = {}
    current_label = None
    for p in parts:
        p_strip = p.strip()
        label_match = re.search(r'(?:<u>|a̲\)|c̲\))?([a-d])[\)\.\:\s]', p_strip)
        if label_match:
            current_label = label_match.group(1).lower()
            statements_raw[current_label] = {
                'is_underlined': ('<u>' in p) or ('a̲' in p) or ('c̲' in p),
                'text': ''
            }
        elif current_label:
            statements_raw[current_label]['text'] += p
            if '<u>' in p or '̲' in p:
                statements_raw[current_label]['is_underlined'] = True

    statements = []
    for letter in ['a', 'b', 'c', 'd']:
        info = statements_raw.get(letter, {'text': f'Nhận định {letter}', 'is_underlined': False})
        stmt_text = clean_html_tags(info['text']).strip()
        stmt_text = re.sub(r'^[a-d][\)\.\:\s]*', '', stmt_text).strip()
        statements.append({
            'id': letter,
            'label': letter,
            'text': stmt_text,
            'answer': bool(info['is_underlined'])
        })

    return stem_clean, statements

letters = ['A', 'B', 'C', 'D']
sec1 = sections_raw[1]
q_matches = re.split(r'\n(?=Câu\s+\d+[\s\:\.])', sec1)
for i, q in enumerate(q_matches[1:5], 1):
    stem, opts, corr = parse_mcq(q)
    print(f'Q{i}: Stem: {stem[:40]}... Correct={letters[corr]}')
    for o_i, o in enumerate(opts):
        print(f'   {letters[o_i]}. {o[:40]}...')

q18 = q_matches[18]
stem_tf, stmts = parse_truefalse(q18)
print('Q18 TF:', stem_tf)
for s in stmts:
    print(f'   {s["label"]}) [{s["answer"]}] {s["text"][:40]}...')
