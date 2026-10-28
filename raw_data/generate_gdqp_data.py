import re
import json

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

        opt_A_match = re.search(r'^A\.\s*', options_text)
        rem = options_text[opt_A_match.end():]
        m_B = re.search(r'B\.\s*', rem)
        opt_A = rem[:m_B.start()].strip()
        rem_B = rem[m_B.end():]
        
        m_C = re.search(r'C\.\s*', rem_B)
        opt_B = rem_B[:m_C.start()].strip()
        rem_C = rem_B[m_C.end():]
        
        m_D = re.search(r'D\.\s*', rem_C)
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

# Answers & metadata mapping
# Bài 1: 20 câu
b1_data = {
    1: (1, "Theo Điều 5 Luật Biên giới quốc gia 2003, biên giới quốc gia xác định giới hạn lãnh thổ đất liền, các đảo, quần đảo (gồm Hoàng Sa và Trường Sa), vùng biển, lòng đất và vùng trời của Tổ quốc.", "nhan_biet"),
    2: (1, "Theo Điều 9 Luật Biển Việt Nam 2012, nội thủy là vùng nước tiếp giáp với bờ biển, ở phía trong đường cơ sở và là bộ phận lãnh thổ của Việt Nam.", "nhan_biet"),
    3: (0, "Theo Điều 13 Luật Biển Việt Nam 2012, vùng tiếp giáp lãnh hải có chiều rộng 12 hải lí tính từ ranh giới ngoài của lãnh hải.", "nhan_biet"),
    4: (0, "Theo Điều 14 Luật Biên giới quốc gia 2003, nghiêm cấm hành vi xê dịch, phá hoại mốc quốc giới; làm sai lệch hướng đi của đường biên giới quốc gia.", "nhan_biet"),
    5: (3, "Việt Nam có đường biên giới chung trên đất liền với 3 quốc gia: Trung Quốc, Lào và Campuchia.", "nhan_biet"),
    6: (3, "Theo Điều 15 Luật Biển Việt Nam 2012, vùng đặc quyền kinh tế hợp với lãnh hải thành một vùng biển có chiều rộng 200 hải lí tính từ đường cơ sở.", "nhan_biet"),
    7: (0, "Khu vực biên giới trên không gồm phần không gian dọc theo biên giới quốc gia có chiều rộng 10 km tính từ biên giới quốc gia trở vào (Nghị định 140/2004/NĐ-CP).", "thong_hieu"),
    8: (1, "Quốc hội nước CHXHCN Việt Nam khóa IX, kỳ họp thứ 5 đã thông qua Nghị quyết phê chuẩn Công ước của LHQ về Luật Biển năm 1982 vào ngày 23/06/1994.", "thong_hieu"),
    9: (2, "Theo Điều 17 Luật Biển Việt Nam 2012, ranh giới ngoài của thềm lục địa không được vượt quá 350 hải lí tính từ đường cơ sở hoặc không quá 100 hải lí tính từ đường đẳng sâu 2.500 m.", "thong_hieu"),
    10: (1, "Tự ý qua lại biên giới sang nước láng giềng khi chưa có phép của cơ quan chức năng là hành vi vi phạm pháp luật về biên giới quốc gia.", "nhan_biet"),
    11: (1, "Xâm phạm tài nguyên thiên nhiên, khai thác và đánh bắt trái phép trong vùng biển thuộc chủ quyền và quyền chủ quyền của Việt Nam là hành vi vi phạm nghiêm trọng.", "thong_hieu"),
    12: (1, "Cần ngăn cản bạn ngay lập tức và giải thích rằng hành vi vượt qua mốc quốc giới sang nước bạn khi chưa được phép là vi phạm pháp luật biên giới quốc gia.", "van_dung"),
    13: (1, "Xâm canh, cư trú trái phép hoặc phá hoại công trình biên giới là các hành vi bị nghiêm cấm theo Luật Biên giới quốc gia.", "thong_hieu"),
    14: (0, "Chủ quyền lãnh thổ nước CHXHCN Việt Nam bao gồm: đất liền, hải đảo, vùng biển và vùng trời.", "nhan_biet"),
    15: (1, "Biên giới quốc gia trên đất liền được hoạch định và đánh dấu trên thực địa bằng hệ thống mốc quốc giới.", "nhan_biet"),
    16: (2, "Khu vực biên giới trên không có chiều rộng 10 km tính từ biên giới quốc gia trở vào.", "nhan_biet"),
    17: (2, "Hành vi xê dịch hoặc phá hoại mốc quốc giới thuộc nhóm hành vi bị nghiêm cấm theo Luật Biên giới quốc gia.", "nhan_biet"),
    18: (1, "Theo Luật Biển Việt Nam, lãnh hải có chiều rộng 12 hải lí tính từ đường cơ sở ra phía biển.", "nhan_biet"),
    19: (1, "Mốc quốc giới có ý nghĩa quan trọng vì giúp đánh dấu đường biên giới đã được hoạch định và thỏa thuận trên thực địa.", "thong_hieu"),
    20: (2, "Mọi hoạt động nghiên cứu khoa học của tổ chức, cá nhân nước ngoài trong vùng biển Việt Nam phải có giấy phép của cơ quan nhà nước có thẩm quyền Việt Nam và tuân thủ các quy định liên quan.", "van_dung"),
}

# Bài 2: 16 câu
b2_data = {
    1: (1, "Theo Điều 12 Luật Nghĩa vụ quân sự năm 2015, công dân nam đủ 17 tuổi trở lên phải đăng kí nghĩa vụ quân sự lần đầu.", "nhan_biet"),
    2: (1, "Theo Điều 30 Luật NVQS 2015, độ tuổi gọi nhập ngũ trong thời bình đối với công dân nam từ đủ 18 tuổi đến hết 25 tuổi.", "nhan_biet"),
    3: (2, "Theo Điều 21 Luật NVQS 2015, thời hạn phục vụ tại ngũ trong thời bình của hạ sĩ quan, binh sĩ là 24 tháng.", "nhan_biet"),
    4: (0, "Theo Khoản 2 Điều 8 Luật NVQS 2015, công dân thực hiện nghĩa vụ tham gia CAND được coi là thực hiện nghĩa vụ quân sự tại ngũ.", "thong_hieu"),
    5: (0, "Theo Điều 15 Luật NVQS 2015, Ban Chỉ huy quân sự cấp xã thực hiện đăng kí nghĩa vụ quân sự cho công dân cư trú tại địa phương.", "nhan_biet"),
    6: (1, "Theo Điều 41 Khoản 2 Luật NVQS 2015, con của liệt sĩ, con của thương binh hạng một được miễn gọi nhập ngũ trong thời bình.", "thong_hieu"),
    7: (0, "Theo Điều 41 Khoản 1 Luật NVQS 2015, công dân chưa đủ sức khoẻ phục vụ tại ngũ theo kết luận của Hội đồng khám sức khoẻ được tạm hoãn gọi nhập ngũ.", "thong_hieu"),
    8: (1, "Theo Điều 10 Luật NVQS 2015, nghiêm cấm hành vi trốn tránh thực hiện nghĩa vụ quân sự.", "nhan_biet"),
    9: (2, "Theo Điều 30 Luật NVQS 2015, công dân được đào tạo trình độ CĐ, ĐH đã tạm hoãn gọi nhập ngũ thì độ tuổi gọi nhập ngũ kéo dài đến hết 27 tuổi.", "thong_hieu"),
    10: (0, "Học sinh có trách nhiệm chấp hành nghiêm các quy định về đăng kí NVQS khi đủ 17 tuổi và tích cực học tập, rèn luyện môn GDQP&AN.", "nhan_biet"),
    11: (1, "Anh A đã tốt nghiệp ĐH hệ chính quy và tạm hoãn trong thời gian học, do đó độ tuổi gọi nhập ngũ tối đa của anh A là đến hết 27 tuổi.", "van_dung"),
    12: (0, "Hành vi không có mặt đúng thời gian hoặc địa điểm tập trung sơ tuyển sức khỏe ghi trong lệnh gọi mà không có lí do chính đáng bị xử phạt vi phạm hành chính từ 3.000.000 đến 5.000.000 đồng.", "thong_hieu"),
    13: (2, "Theo Điều 4 Luật NVQS 2015, nghĩa vụ quân sự gồm phục vụ tại ngũ và phục vụ trong ngạch dự bị của Quân đội nhân dân.", "nhan_biet"),
    14: (1, "Tháng tư hằng năm là thời gian Chỉ huy trưởng Ban CHQS cấp huyện ra lệnh gọi công dân nam đủ 17 tuổi đăng kí NVQS lần đầu tại UBND cấp xã.", "nhan_biet"),
    15: (2, "Công dân cần cung cấp hồ sơ, giấy tờ chứng minh hoàn cảnh trung thực cho cơ quan có thẩm quyền để được xem xét điều kiện tạm hoãn theo quy định.", "van_dung"),
    16: (2, "Công dân cần chủ động liên hệ cơ quan có thẩm quyền, trình bày lý do trùng lịch thi và cung cấp giấy xác nhận để được hướng dẫn xếp lịch khám bù.", "van_dung"),
}

# Bài 3: 16 câu
b3_data = {
    1: (0, "Theo Điều 8 BLHS 2015, tội phạm là hành vi nguy hiểm cho xã hội xâm phạm độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ, chế độ XHCN, quyền và lợi ích hợp pháp của tổ chức, cá nhân.", "nhan_biet"),
    2: (0, "Tệ nạn xã hội là hiện tượng xã hội tiêu cực, biểu hiện bằng những hành vi sai lệch chuẩn mực xã hội, vi phạm đạo đức, pháp luật và gây nguy hiểm cho xã hội.", "nhan_biet"),
    3: (0, "Tội phạm sử dụng công nghệ cao thực hiện hành vi nguy hiểm bằng cách tác động trái phép vào thông tin số được lưu trữ, xử lí, truyền tải trong hệ thống máy tính, viễn thông.", "thong_hieu"),
    4: (0, "Lừa đảo chiếm đoạt tài sản trên không gian mạng, phát tán virus, mã độc gián điệp là biểu hiện vi phạm pháp luật về sử dụng công nghệ cao.", "nhan_biet"),
    5: (1, "Theo Điều 321 BLHS 2015, hành vi đánh bạc trái phép dưới bất kì hình thức nào có thể bị phạt tiền, phạt cải tạo không giam giữ hoặc phạt tù.", "thong_hieu"),
    6: (0, "Học sinh có trách nhiệm không tham gia các tệ nạn xã hội, không chia sẻ thông tin thất thiệt chưa được kiểm chứng trên không gian mạng.", "nhan_biet"),
    7: (1, "Hành vi đúng đắn là báo cáo (report) vi phạm với quản trị viên, không xem, không chia sẻ và báo ngay cho thầy cô, cha mẹ hoặc cơ quan chức năng.", "van_dung"),
    8: (1, "Cần dứt khoát từ chối, không cung cấp thông tin cá nhân hay chuyển tiền vì đây là thủ đoạn lừa đảo 'trúng thưởng' phổ biến trên mạng.", "van_dung"),
    9: (2, "Học sinh cần chấp hành nghiêm túc pháp luật, không tham gia tệ nạn và chủ động nâng cao nhận thức, kỹ năng phòng vệ.", "nhan_biet"),
    10: (1, "Chia sẻ bài đăng chưa kiểm chứng có thể gây hiểu lầm, hoang mang dư luận, xâm phạm uy tín người khác và vi phạm Luật An ninh mạng.", "thong_hieu"),
    11: (2, "Yêu cầu cài đặt phần mềm không rõ nguồn gốc tiềm ẩn rủi ro rất cao về việc bị cài mã độc đánh cắp tài khoản cá nhân hoặc dữ liệu riêng tư.", "thong_hieu"),
    12: (2, "Cần khuyên nhủ bạn dừng lại, đồng thời tìm kiếm sự hỗ trợ kịp thời từ người lớn đáng tin cậy hoặc thầy cô, nhà trường.", "van_dung"),
    13: (2, "Hành động có trách nhiệm số là không phát tán video chưa kiểm chứng, xác minh từ nguồn chính thống và báo cho cơ quan có trách nhiệm.", "van_dung"),
    14: (1, "Học sinh cần dứt khoát từ chối, rời khỏi nhóm, lưu thông tin bằng chứng an toàn và báo cho người lớn hoặc cơ quan chức năng xử lý.", "van_dung"),
    15: (1, "Một trong những cách thức hoạt động phổ biến của tội phạm là thường câu kết thành các băng nhóm, tổ chức chặt chẽ.", "nhan_biet"),
    16: (1, "Phần thứ hai của Bộ luật Hình sự 2015 quy định về Các tội phạm bao gồm 13 chương (từ Chương XIV đến Chương XXVI).", "thong_hieu"),
}

all_questions = []

lessons = [
    ("Bài 1", b1, b1_data, "gdqp11_b1", "gdqp11_b1_s1", "Bài 1: Bảo vệ chủ quyền lãnh thổ"),
    ("Bài 2", b2, b2_data, "gdqp11_b2", "gdqp11_b2_s1", "Bài 2: Luật Nghĩa vụ quân sự"),
    ("Bài 3", b3, b3_data, "gdqp11_b3", "gdqp11_b3_s1", "Bài 3: Phòng chống tệ nạn xã hội"),
]

for b_name, b_qs, b_map, ch_id, sec_id, tag_sub in lessons:
    for q_num, stem, opts in b_qs:
        corr_idx, expl, diff = b_map[q_num]
        q_id = f"{ch_id}_c{q_num:02d}"
        q_obj = {
            "id": q_id,
            "type": "mcq",
            "subjectId": "sub_gdqp11",
            "chapterId": ch_id,
            "sectionId": sec_id,
            "stem": stem,
            "options": opts,
            "correct": corr_idx,
            "explanation": expl,
            "difficulty": diff,
            "tags": ["GDQP 11", "Giữa HKI", tag_sub],
            "favorite": False,
            "createdAt": "2026-10-28T06:00:00.000Z",
            "updatedAt": "2026-10-28T06:00:00.000Z"
        }
        all_questions.append(q_obj)

print(f"Total questions generated: {len(all_questions)}")

with open("raw_data/gdqp_questions.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print("Saved raw_data/gdqp_questions.json")
