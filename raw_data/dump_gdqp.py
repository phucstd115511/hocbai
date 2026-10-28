import zipfile, xml.etree.ElementTree as ET, re, json

path = '/home/admin/Projects/hocbai/raw_data/ĐỀ CƯƠNG ÔN TẬP KIỂM TRA GIỮA HKI MÔN GDQP&AN 11 NĂM HỌC 2026-2027.docx'
with zipfile.ZipFile(path) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for p in tree.findall('.//w:p', ns):
        txt = ''.join(c.text for c in p.findall('.//w:t', ns) if c.text).strip()
        if txt:
            paragraphs.append(txt)

with open('/home/admin/Projects/hocbai/raw_data/gdqp_raw_text.txt', 'w', encoding='utf-8') as f:
    for idx, p in enumerate(paragraphs):
        f.write(f'{idx:03d}: {p}\n')

print(f'Wrote {len(paragraphs)} paragraphs to gdqp_raw_text.txt')
