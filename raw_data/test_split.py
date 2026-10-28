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

# Split by BÀI
sections_raw = re.split(r'\n(?=BÀI \d+[:\.] )', full_text)
print(f'Total BÀI sections found: {len(sections_raw)}')
for idx, sec in enumerate(sections_raw):
    first_line = sec.split('\n')[0]
    print(f'Sec {idx}: {first_line[:60]} (lines: {len(sec.splitlines())})')
