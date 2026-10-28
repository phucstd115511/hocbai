import zipfile, xml.etree.ElementTree as ET

path = 'de/ĐỀ-CƯƠNG-ÔN-TẬP-GV-ĐỊA-11.docx'
with zipfile.ZipFile(path) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for p in tree.findall('.//w:p', ns):
        runs_txt = []
        for r in p.findall('.//w:r', ns):
            # check bold / underline / color / highlight
            t_elems = r.findall('.//w:t', ns)
            t = ''.join(e.text for e in t_elems if e.text)
            if not t:
                continue
            rPr = r.find('w:rPr', ns)
            tags = []
            if rPr is not None:
                if rPr.find('w:b', ns) is not None:
                    tags.append('B')
                if rPr.find('w:u', ns) is not None:
                    tags.append('U')
                color = rPr.find('w:color', ns)
                if color is not None:
                    cval = color.get(f'{{{ns["w"]}}}val')
                    if cval and cval != 'auto':
                        tags.append(f'C({cval})')
                highlight = rPr.find('w:highlight', ns)
                if highlight is not None:
                    hval = highlight.get(f'{{{ns["w"]}}}val')
                    if hval:
                        tags.append(f'H({hval})')
            if tags:
                tag_s = ','.join(tags)
                runs_txt.append(f"[{tag_s}]{t}[/{tag_s}]")
            else:
                runs_txt.append(t)
        line = ''.join(runs_txt).strip()
        if line:
            paragraphs.append(line)

with open('raw_data/dia_raw_text.txt', 'w', encoding='utf-8') as f:
    for idx, p in enumerate(paragraphs):
        f.write(f'{idx:03d}: {p}\n')

print(f'Wrote {len(paragraphs)} paragraphs to raw_data/dia_raw_text.txt')
