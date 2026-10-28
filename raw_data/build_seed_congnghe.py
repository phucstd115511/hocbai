import json, re

with open('/home/admin/Projects/hocbai/raw_data/cong_nghe_ghki.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Add the 4 applied questions
applied_questions = [
    {
        "id": "q_cn11_chap_b5_16",
        "type": "mcq",
        "subjectId": "sub_congnghe_ghki",
        "chapterId": "chap_b5",
        "sectionId": "chap_b5_sec",
        "stem": "Khi so sánh giữa nhựa nhiệt dẻo và nhựa nhiệt rắn, điểm khác biệt cơ bản nhất về tính chất công nghệ là gì?",
        "options": [
            "Nhựa nhiệt dẻo có nhiệt độ nóng chảy thấp và có thể tái chế, trong khi nhựa nhiệt rắn có nhiệt độ nóng chảy cao và không thể tái chế",
            "Nhựa nhiệt dẻo không dẫn điện, nhựa nhiệt rắn dẫn điện tốt",
            "Nhựa nhiệt dẻo có khối lượng riêng lớn hơn nhiều so với nhựa nhiệt rắn",
            "Nhựa nhiệt dẻo cứng và giòn hơn so với nhựa nhiệt rắn"
        ],
        "correct": 0,
        "explanation": "Theo đáp án đề cương: Giống nhau: Đều là vật liệu cao phân tử, cách điện, cách nhiệt, không bị oxy hóa. Khác nhau: Nhựa nhiệt dẻo có nhiệt độ nóng chảy thấp, có thể tái sinh (tái chế); Nhựa nhiệt rắn có nhiệt độ nóng chảy cao, không có khả năng tái sinh.",
        "difficulty": "thong_hieu",
        "tags": ["Công Nghệ GHKI", "Bài 5", "Vận dụng"],
        "favorite": True,
        "createdAt": "2026-10-28T08:00:00.000Z",
        "updatedAt": "2026-10-28T08:00:00.000Z"
    },
    {
        "id": "q_cn11_chap_b5_17",
        "type": "mcq",
        "subjectId": "sub_congnghe_ghki",
        "chapterId": "chap_b5",
        "sectionId": "chap_b5_sec",
        "stem": "Một cơ sở cần lựa chọn vật liệu làm đệm để giảm rung cho máy khi hoạt động trong ba loại vật liệu: cao su, nhựa nhiệt dẻo và nhựa nhiệt rắn. Lựa chọn nào sau đây là tối ưu nhất và có cơ sở khoa học?",
        "options": [
            "Chọn cao su vì có tính đàn hồi cao, biến dạng khi chịu lực, phục hồi hình dạng khi thôi lực và có khả năng tiêu hao năng lượng dao động giúp giảm rung truyền xuống nền",
            "Chọn nhựa nhiệt dẻo vì giá thành rẻ và dễ dàng nóng chảy để tạo hình đệm máy",
            "Chọn nhựa nhiệt rắn vì có độ cứng tối đa giúp máy đứng cố định tuyệt đối không dịch chuyển",
            "Chọn kết hợp nhựa nhiệt dẻo và nhựa nhiệt rắn để tăng độ giòn cho đệm máy"
        ],
        "correct": 0,
        "explanation": "Theo đáp án đề cương: Chọn cao su vì cao su có tính đàn hồi cao, có thể biến dạng khi chịu lực và phục hồi hình dạng khi thôi tác dụng lực. Ngoài ra, cao su còn có khả năng hấp thụ và tiêu hao một phần năng lượng dao động, giúp giảm rung truyền từ máy xuống nền.",
        "difficulty": "van_dung",
        "tags": ["Công Nghệ GHKI", "Bài 5", "Vận dụng thực tế"],
        "favorite": True,
        "createdAt": "2026-10-28T08:00:00.000Z",
        "updatedAt": "2026-10-28T08:00:00.000Z"
    },
    {
        "id": "q_cn11_chap_b6_24_mcq",
        "type": "mcq",
        "subjectId": "sub_congnghe_ghki",
        "chapterId": "chap_b6",
        "sectionId": "chap_b6_sec",
        "stem": "Giải thích nào sau đây là chính xác về tính 'nhớ hình' của hợp kim nhớ hình và ứng dụng tiêu biểu của nó?",
        "options": [
            "Khả năng khôi phục hình dạng đã được định trước khi được nung nóng đến nhiệt độ thích hợp (sau khi bị biến dạng trong giới hạn cho phép); ứng dụng chế tạo bộ phận chấp hành điều khiển bằng nhiệt",
            "Khả năng tự động thay đổi màu sắc và kích thước theo cường độ ánh sáng môi trường; ứng dụng làm kính râm",
            "Khả năng ghi nhớ và lưu trữ dữ liệu thông tin số như một con chip bán dẫn trong máy tính",
            "Khả năng tự hàn gắn các vết nứt mà không cần gia nhiệt hay cung cấp năng lượng từ bên ngoài"
        ],
        "correct": 0,
        "explanation": "Theo đáp án đề cương: Tính 'nhớ hình' là khả năng khôi phục hình dạng đã được định trước khi được nung nóng đến nhiệt độ thích hợp, sau khi bị biến dạng trong giới hạn cho phép. Ứng dụng: Chế tạo bộ phận chấp hành điều khiển bằng nhiệt. Khi được nung nóng, bộ phận bằng hợp kim nhớ hình khôi phục hình dạng định trước, tạo chuyển động cho cơ cấu.",
        "difficulty": "thong_hieu",
        "tags": ["Công Nghệ GHKI", "Bài 6", "Hợp kim nhớ hình"],
        "favorite": True,
        "createdAt": "2026-10-28T08:00:00.000Z",
        "updatedAt": "2026-10-28T08:00:00.000Z"
    },
    {
        "id": "q_cn11_chap_b6_25",
        "type": "mcq",
        "subjectId": "sub_congnghe_ghki",
        "chapterId": "chap_b6",
        "sectionId": "chap_b6_sec",
        "stem": "Một chi tiết máy cần có bề mặt chịu nhiệt tốt, bên trong có độ bền cơ học cao và thành phần vật liệu thay đổi dần từ ngoài vào trong. Loại vật liệu mới nào phù hợp nhất với yêu cầu trên?",
        "options": [
            "Vật liệu có cơ tính biến thiên (vật liệu phân lớp chức năng - FGM)",
            "Vật liệu nano đơn lớp phủ bề mặt",
            "Hợp kim nhớ hình Nitinol",
            "Vật liệu nhựa nhiệt rắn phenolic"
        ],
        "correct": 0,
        "explanation": "Theo đáp án đề cương: Chọn vật liệu có cơ tính biến thiên (FGM). Vật liệu này gồm hai hoặc nhiều thành phần, có tỉ lệ thành phần thay đổi dần theo vị trí, giúp tạo ra tính chất phù hợp tại từng vùng của chi tiết (bề mặt chịu nhiệt chiếm ưu thế ở ngoài, độ bền cơ học cao chiếm ưu thế ở bên trong).",
        "difficulty": "van_dung",
        "tags": ["Công Nghệ GHKI", "Bài 6", "FGM", "Vận dụng"],
        "favorite": True,
        "createdAt": "2026-10-28T08:00:00.000Z",
        "updatedAt": "2026-10-28T08:00:00.000Z"
    }
]

total_questions = questions + applied_questions

subject_congnghe = {
    "id": "sub_congnghe_ghki",
    "name": "Công Nghệ GHKI",
    "chapters": [
        {
            "id": "chap_b1",
            "name": "Bài 1: Khái quát về cơ khí chế tạo",
            "sections": [
                {
                    "id": "chap_b1_sec",
                    "name": "Khái quát và quy trình chế tạo cơ khí",
                    "content": "Khái niệm, vai trò của cơ khí chế tạo trong sản xuất và đời sống; đối tượng lao động, công cụ lao động; các bước trong quy trình chế tạo cơ khí.",
                    "points": [
                        "Cơ khí chế tạo nghiên cứu và thực hiện quá trình thiết kế, chế tạo, vận hành, bảo dưỡng, sửa chữa máy móc thiết bị.",
                        "Ứng dụng toán học, nguyên lí vật lí và công nghệ vật liệu.",
                        "Đối tượng lao động: các vật liệu cơ khí (kim loại, hợp kim, phi kim loại, vật liệu mới).",
                        "Quy trình chế tạo: Đọc bản vẽ → Chế tạo phôi → Gia công chi tiết → Xử lí bảo vệ bề mặt → Lắp ráp kiểm tra."
                    ]
                }
            ]
        },
        {
            "id": "chap_b2",
            "name": "Bài 2: Ngành nghề trong lĩnh vực cơ khí chế tạo",
            "sections": [
                {
                    "id": "chap_b2_sec",
                    "name": "Các ngành nghề và yêu cầu công việc",
                    "content": "Thiết kế sản phẩm cơ khí, gia công cơ khí, lắp ráp sản phẩm, bảo dưỡng sửa chữa thiết bị cơ khí và yêu cầu đối với người lao động.",
                    "points": [
                        "Thiết kế: ứng dụng toán học, khoa học kĩ thuật để chọn vật liệu và thiết kế chi tiết máy.",
                        "Gia công cơ khí: biến đổi vật liệu ban đầu thành sản phẩm qua máy móc, công cụ (cắt gọt, hàn, rèn dập).",
                        "Lắp ráp: ghép các chi tiết thành thiết bị hoàn chỉnh theo bản vẽ lắp.",
                        "Bảo dưỡng, sửa chữa: kiểm tra, chẩn đoán, xử lí sự cố nhằm duy trì hoạt động ổn định và an toàn.",
                        "Yêu cầu: sức khỏe tốt, cẩn thận, kiên trì, phản ứng nhanh nhạy, tuân thủ nghiêm an toàn lao động."
                    ]
                }
            ]
        },
        {
            "id": "chap_b3",
            "name": "Bài 3: Tổng quan về vật liệu cơ khí",
            "sections": [
                {
                    "id": "chap_b3_sec",
                    "name": "Phân loại và tính chất vật liệu cơ khí",
                    "content": "Vật liệu kim loại và hợp kim, vật liệu phi kim loại, vật liệu mới. Các tính chất cơ học, vật lí, hoá học và tính công nghệ.",
                    "points": [
                        "Yêu cầu đối với vật liệu cơ khí: tính sử dụng, tính công nghệ và tính kinh tế.",
                        "Tính chất cơ học: độ bền, độ dẻo, độ cứng, khả năng chịu ngoại lực không bị phá hủy.",
                        "Tính công nghệ: khả năng gia công đúc, hàn, rèn, cắt gọt, nhiệt luyện."
                    ]
                }
            ]
        },
        {
            "id": "chap_b4",
            "name": "Bài 4: Vật liệu kim loại và hợp kim",
            "sections": [
                {
                    "id": "chap_b4_sec",
                    "name": "Sắt, hợp kim sắt và kim loại màu",
                    "content": "Phân loại kim loại đen (gang, thép carbon, thép hợp kim) và kim loại màu (đồng, nhôm và hợp kim của chúng).",
                    "points": [
                        "Gang: hàm lượng carbon từ 2,14% đến 4,3%, tính đúc tốt, dùng đúc vỏ máy, bệ máy.",
                        "Thép carbon: hàm lượng carbon ≤ 2,14%, độ dai tốt, chịu va đập.",
                        "Thép hợp kim: tính nhiệt luyện tốt hơn, giữ độ bền cao ở nhiệt độ cao.",
                        "Kim loại màu: đồng (dẫn điện tốt), nhôm (nhẹ, chống ăn mòn tốt làm khung cửa, vỏ máy bay)."
                    ]
                }
            ]
        },
        {
            "id": "chap_b5",
            "name": "Bài 5: Vật liệu phi kim loại",
            "sections": [
                {
                    "id": "chap_b5_sec",
                    "name": "Nhựa nhiệt dẻo, nhựa nhiệt rắn và cao su",
                    "content": "Tính chất cách điện, cách nhiệt, nhẹ, chống ăn mòn. So sánh nhựa nhiệt dẻo và nhiệt rắn; ứng dụng của cao su.",
                    "points": [
                        "Nhựa nhiệt dẻo: nhẹ, nóng chảy ở nhiệt độ thấp, có thể tái chế (cốc nhựa, đồ gia dụng).",
                        "Nhựa nhiệt rắn: khi gia nhiệt sẽ rắn cứng, không nóng chảy lại, không tái chế (vỏ tàu thuyền, ô tô, vỏ công tắc).",
                        "Cao su: đàn hồi cao, giảm rung, chịu mài mòn, dùng làm săm lốp xe, đệm giảm rung."
                    ]
                }
            ]
        },
        {
            "id": "chap_b6",
            "name": "Bài 6: Vật liệu mới",
            "sections": [
                {
                    "id": "chap_b6_sec",
                    "name": "Vật liệu nano, composite, FGM và hợp kim nhớ hình",
                    "content": "Cấu trúc, đặc tính ưu việt và ứng dụng của các loại vật liệu công nghệ cao.",
                    "points": [
                        "Vật liệu nano: kích thước cỡ nanômét, bền, nhẹ, kháng khuẩn, ứng dụng may mặc, điện tử mini.",
                        "Vật liệu composite: tổ hợp vật liệu cốt (tăng độ bền) và vật liệu nền (liên kết), bền nhẹ làm cánh quạt tuabin, cánh tay robot.",
                        "Vật liệu có cơ tính biến thiên (FGM): thay đổi liên tục tính chất trong không gian, tránh nứt gãy và bong tách bề mặt.",
                        "Hợp kim nhớ hình: có khả năng khôi phục hình dạng ban đầu sau khi biến dạng khi được gia nhiệt thích hợp (Nitinol gồm Nickel và Titanium)."
                    ]
                }
            ]
        }
    ]
}

exam_congnghe = {
    "id": "exam_congnghe_ghki",
    "name": "Công Nghệ GHKI",
    "description": "Đề Cương Ôn Tập Giữa Học Kì I - Công Nghệ 11 (Cơ Khí Chế Tạo) - Trường THPT Nguyễn Trãi. Gồm 93 câu hỏi chuẩn đáp án chính thức.",
    "questionIds": [q["id"] for q in total_questions],
    "createdAt": "2026-10-28T08:00:00.000Z"
}

with open('/home/admin/Projects/hocbai/raw_data/cong_nghe_ghki_full.json', 'w', encoding='utf-8') as f:
    json.dump({
        "subject": subject_congnghe,
        "questions": total_questions,
        "exam": exam_congnghe
    }, f, ensure_ascii=False, indent=2)

print(f"Generated {len(total_questions)} total questions for Công Nghệ GHKI!")
