import re
import json

with open('raw_data/dia_raw_text.txt', 'r', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f.readlines()]

# Remove line number prefix (e.g., "000: ")
lines = []
for l in raw_lines:
    m = re.match(r'^\d+:\s*(.*)$', l)
    if m:
        lines.append(m.group(1))
    else:
        lines.append(l)

full_text = "\n".join(lines)

# Split into Phần I, II, III, IV
p1_idx = full_text.find("PHẦN I")
p2_idx = full_text.find("PHẦN II")
p3_idx = full_text.find("Phần III")
p4_idx = full_text.find("Phần IV")

part1_text = full_text[p1_idx:p2_idx]
part2_text = full_text[p2_idx:p3_idx]
part3_text = full_text[p3_idx:p4_idx if p4_idx != -1 else len(full_text)]

print(f"Part 1 len: {len(part1_text)}")
print(f"Part 2 len: {len(part2_text)}")
print(f"Part 3 len: {len(part3_text)}")
