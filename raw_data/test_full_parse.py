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

def clean_html(s):
    return re.sub(r'</?u>', '', s).strip()

chapters_meta = [
    {
        "id": "chap_b1",
        "name": "Bài 1: Khái quát về cơ khí chế tạo",
        "desc": "Khái niệm, vai trò, đối tượng lao động, quy trình chế tạo cơ khí"
    },
    {
        "id": "chap_b2",
        "name": "Bài 2: Ngành nghề trong lĩnh vực cơ khí chế tạo",
        "desc": "Thiết kế, gia công, lắp ráp, bảo dưỡng sửa chữa và yêu cầu nghề nghiệp"
    },
    {
        "id": "chap_b3",
        "name": "Bài 3: Tổng quan về vật liệu cơ khí",
        "desc": "Khái niệm, phân loại vật liệu, tính chất cơ học, vật lí, hoá học và công nghệ"
    },
    {
        "id": "chap_b4",
        "name": "Bài 4: Vật liệu kim loại và hợp kim",
        "desc": "Sắt và hợp kim sắt (gang, thép), kim loại và hợp kim màu (đồng, nhôm)"
    },
    {
        "id": "chap_b5",
        "name": "Bài 5: Vật liệu phi kim loại",
        "desc": "Nhựa nhiệt dẻo, nhựa nhiệt rắn, cao su tự nhiên và nhân tạo"
    },
    {
        "id": "chap_b6",
        "name": "Bài 6: Vật liệu mới",
        "desc": "Vật liệu nano, composite, vật liệu có cơ tính biến thiên FGM, hợp kim nhớ hình"
    },
]

all_parsed_questions = []

for s_idx in range(1, 7):
    chap = chapters_meta[s_idx - 1]
    sec_text = sections_raw[s_idx]
    q_blocks = re.split(r'\n(?=Câu\s+\d+[\s\:\.])', sec_text)
    
    for q_idx, block in enumerate(q_blocks[1:], 1):
        block_one_line = block.replace('\n', ' ').strip()
        
        # Check if True/False
        is_tf = bool(re.search(r'(?:^|\s)(?:<u>)?(?:a̲|c̲|[a-d])(?:</u>)?(?:\s*<u>)?[\)\.](?:</u>)?\s+', block_one_line)) and not bool(re.search(r'(?:^|\s)(?:<u>)?[A-D][\.\:](?:</u>)?\s+', block_one_line))
        
        # Special check: Bài 1 Câu 18, 19; Bài 2 Câu 11, 12; Bài 3 Câu 9; Bài 4 Câu 9, 10, 11; Bài 5 Câu 15; Bài 6 Câu 24
        if any(f'Câu {n}' in block_one_line[:15] for n in [18, 19, 11, 12, 9, 10, 15, 24]):
            if 'a)' in block_one_line or 'a.' in block_one_line or 'a̲)' in block_one_line or '<u>a' in block_one_line:
                is_tf = True

        q_id = f"q_cn11_{chap['id']}_{q_idx:02d}"

        if is_tf:
            # Parse True/False
            pattern = r'(?:^|\s)((?:<u>)?(?:a̲|c̲|[a-d])(?:</u>)?(?:\s*<u>)?[\)\.](?:</u>)?)\s*'
            parts = re.split(pattern, block_one_line)
            stem = clean_html(re.sub(r'^Câu\s+\d+[\s\:\.]*', '', parts[0]).strip())
            
            statements = []
            for i in range(1, len(parts), 2):
                lbl_raw = parts[i]
                stmt_txt = clean_html(parts[i+1].strip())
                # letter
                m_ltr = re.search(r'[a-d]', lbl_raw)
                if not m_ltr:
                    continue
                lbl_letter = m_ltr.group(0).lower()
                is_true = ('<u>' in lbl_raw) or ('̲' in lbl_raw)
                statements.append({
                    'id': lbl_letter,
                    'label': lbl_letter,
                    'text': stmt_txt,
                    'answer': is_true
                })
            
            # Ensure 4 statements a, b, c, d
            if len(statements) < 4:
                print(f"Warning: {q_id} has {len(statements)} statements.")

            # Explanation
            true_labels = [s['label'] for s in statements if s['answer']]
            false_labels = [s['label'] for s in statements if not s['answer']]
            expl = f"Ý ({', '.join(true_labels)}) Đúng. Ý ({', '.join(false_labels)}) Sai theo nội dung đề cương ôn tập Công nghệ 11 - {chap['name']}."

            all_parsed_questions.append({
                'id': q_id,
                'type': 'truefalse',
                'subjectId': 'sub_congnghe_ghki',
                'chapterId': chap['id'],
                'sectionId': f"{chap['id']}_sec",
                'stem': stem,
                'statements': statements,
                'explanation': expl,
                'difficulty': 'thong_hieu' if q_idx % 2 == 0 else 'van_dung',
                'tags': ['Công Nghệ GHKI', chap['name'].split(':')[0], 'Đúng sai'],
                'favorite': False,
                'createdAt': '2026-10-28T08:00:00.000Z',
                'updatedAt': '2026-10-28T08:00:00.000Z'
            })
        else:
            # Parse MCQ
            # Option pattern: A., B., C., D. with possible <u> tag
            pattern = r'(?:^|\s)(<u>[A-D][\.\:]?</u>|[A-D][\.\:])\s*'
            parts = re.split(pattern, block_one_line)
            stem = clean_html(re.sub(r'^Câu\s+\d+[\s\:\.]*', '', parts[0]).strip())
            
            options_dict = {}
            for i in range(1, len(parts), 2):
                lbl_raw = parts[i]
                opt_txt = clean_html(parts[i+1].strip())
                m_letter = re.search(r'[A-D]', lbl_raw)
                if m_letter:
                    letter = m_letter.group(0).upper()
                    is_correct = '<u>' in lbl_raw
                    options_dict[letter] = {
                        'text': opt_txt,
                        'is_correct': is_correct
                    }
            
            options = []
            correct_idx = 0
            for idx, letter in enumerate(['A', 'B', 'C', 'D']):
                item = options_dict.get(letter, {'text': f'Phương án {letter}', 'is_correct': False})
                options.append(item['text'])
                if item['is_correct']:
                    correct_idx = idx

            # Special case: Bài 1 Câu 17 (Vòng bi) -> B is correct
            if 'vòng bi' in stem.lower():
                correct_idx = 1

            correct_letter = ['A', 'B', 'C', 'D'][correct_idx]
            expl = f"Đáp án {correct_letter} đúng: {options[correct_idx]}"

            diff = 'nhan_biet'
            if q_idx > 8:
                diff = 'thong_hieu' if q_idx <= 14 else 'van_dung'

            all_parsed_questions.append({
                'id': q_id,
                'type': 'mcq',
                'subjectId': 'sub_congnghe_ghki',
                'chapterId': chap['id'],
                'sectionId': f"{chap['id']}_sec",
                'stem': stem,
                'options': options,
                'correct': correct_idx,
                'explanation': expl,
                'difficulty': diff,
                'tags': ['Công Nghệ GHKI', chap['name'].split(':')[0], 'Trắc nghiệm'],
                'favorite': False,
                'createdAt': '2026-10-28T08:00:00.000Z',
                'updatedAt': '2026-10-28T08:00:00.000Z'
            })

print(f"Total parsed questions: {len(all_parsed_questions)}")
mcq_cnt = len([q for q in all_parsed_questions if q['type'] == 'mcq'])
tf_cnt = len([q for q in all_parsed_questions if q['type'] == 'truefalse'])
print(f"MCQ: {mcq_cnt}, True/False: {tf_cnt}")

# Check for any anomalies
anomalies = 0
for i, q in enumerate(all_parsed_questions):
    qid = q['id']
    if q['type'] == 'mcq':
        if len(q['options']) != 4:
            print(f"WARNING MCQ {qid} options count = {len(q['options'])}")
            anomalies += 1
        if any(not opt for opt in q['options']):
            print(f"WARNING MCQ {qid} has empty option: {q['options']}")
            anomalies += 1
    else:
        if len(q['statements']) != 4:
            print(f"WARNING TF {qid} statements count = {len(q['statements'])}")
            anomalies += 1

print(f"Total anomalies: {anomalies}")

with open('/home/admin/Projects/hocbai/raw_data/cong_nghe_ghki.json', 'w', encoding='utf-8') as f:
    json.dump(all_parsed_questions, f, ensure_ascii=False, indent=2)

print("Saved clean cong_nghe_ghki.json!")
