import re
import json

with open("raw_data/gdqp_raw_text.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f.readlines()]

# Remove line number prefixes like "000: "
clean_lines = []
for l in lines:
    m = re.match(r'^\d+:\s*(.*)$', l)
    if m:
        clean_lines.append(m.group(1))
    else:
        clean_lines.append(l)

text = "\n".join(clean_lines)

# Split into Bai 1, Bai 2, Bai 3
b1_idx = text.find("BÀI 1:")
b2_idx = text.find("BÀI 2:")
b3_idx = text.find("BÀI 3:")

b1_text = text[b1_idx:b2_idx]
b2_text = text[b2_idx:b3_idx]
b3_text = text[b3_idx:]

print(f"B1 length: {len(b1_text)}, B2: {len(b2_text)}, B3: {len(b3_text)}")
