# Học Bài - Ngân Hàng Câu Hỏi & Ôn Luyện Thông Minh

Ứng dụng web học tập, quản lý ngân hàng câu hỏi, tạo đề thi, ôn luyện và xuất bản in A4.
Bao gồm bộ đề cương ôn tập Giữa Học Kì I môn **Công Nghệ 11 (Công Nghệ GHKI)** với 93 câu hỏi trắc nghiệm & đúng sai chuẩn đáp án chính thức.

## Chức năng chính
- **Bài làm Công Nghệ GHKI**: Luyện tập trực tiếp không lộ đáp án, tự chọn phương án, bấm giờ, nộp bài chấm điểm tự động.
- **Ngân hàng câu hỏi**: Lọc theo môn, bài học, độ khó, loại câu, tìm kiếm, kiểm tra trùng lặp.
- **Nhập đề cương**: Nhận diện cấu trúc Chương -> Mục -> Ý từ văn bản, tệp .txt, .docx, .pdf và sinh câu hỏi tự động.
- **Tạo & Xáo đề**: Sinh ma trận ngẫu nhiên, xáo trộn thứ tự câu và đáp án mà không làm thay đổi tính đúng của đáp án.
- **In ấn A4**: Xuất bản in cho học sinh (kèm phiếu trả lời trắc nghiệm) hoặc bản giáo viên (kèm đáp án & lời giải).
- **Lưu trữ & Sao lưu**: Lưu dữ liệu trên trình duyệt, xuất/nhập file JSON toàn diện.

## Công nghệ sử dụng
- React 18, Vite, Tailwind CSS, Lucide React, KaTeX.
- Đọc file Word và PDF client-side bằng mammoth.js và pdfjs-dist.
