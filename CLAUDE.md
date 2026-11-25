# Sổ Thu Chi – hướng dẫn cho Claude

App web tĩnh (GitHub Pages), không có bước build. Nhánh chính: `main` – đẩy lên `main` là app cập nhật sau 1–2 phút.

## Sau MỖI thay đổi
1. Tăng số phiên bản (ví dụ 70 → 71) ở TẤT CẢ các chỗ:
   - `version.json` → `{"v":"71"}`
   - `app.js` → `const APP_VERSION='71'`
   - `sw.js` → `const CACHE='stc-v71'` và mọi `?v=70` → `?v=71`
   - `index.html` → mọi `?v=70` → `?v=71`
2. Chạy kiểm thử nếu có Node + Playwright: `python -m http.server 8765` rồi `node tests/run.js` – phải đạt hết.
3. `git add -A`, commit với lời nhắn tiếng Việt bắt đầu bằng `vXX: ...`, rồi `git push origin main`.
4. Trả lời người dùng bằng tiếng Việt, ngắn gọn.

## Cấu trúc
- `index.html` – giao diện; `app.js` – logic chính; `features.js` – tính năng mở rộng (Nhập nhanh `qeParse`: v104 nhận ra ví theo tên/mã ngân hàng/loại – `QE_BANK_ALIAS` vcb, tcb, vikki…, "thẻ td", "tm"; bấm Xong khi đủ số tiền + hạng mục là lưu luôn, có Hoàn tác; `tests/qewallet.js`)
- `skin.js` – giao diện màu (gold, sky, red, mono = Tối giản); `app.css` – style
- `more.js` – mẫu ghi nhanh, gợi ý hạng mục, tạm ứng chờ thu, lọc báo cáo theo ví, tỷ lệ tiết kiệm, nhắc vay, nhắc sao lưu, tìm kiếm giao dịch
- `ux2.js` – màn Thêm gọn (số tiền lên đầu, gợi ý số tiền, Lưu & ghi tiếp, giữ nháp), vuốt để xoá, thanh ngân sách tháng
- `ux3.js` – báo cáo bấm được + ▲▼ kỳ trước, ví dạng danh sách + xem nhanh, cài đặt chia nhóm, chọn nhiều giao dịch, dòng "Hôm nay"
- `icons.js` + `icons3d/` – bộ biểu tượng (Fluent Emoji phẳng & 3D – MIT, Solar – CC BY 4.0), xem ICONS-LICENSE.md; Cài đặt › Kiểu biểu tượng hạng mục: Emoji của máy (mặc định) / Phẳng / 3D; icon giao diện luôn là Solar
- `pro.js` – hộp thông báo/xác nhận của app, màn chào người mới, kéo xuống làm mới, màn trống có hướng dẫn, số tiền "chạy", tự khoá, Giới thiệu & Bảo mật, màn khởi động
- Giao diện màu thêm `apple` (phong cách iOS) trong `skin.js`; `tests/contrast.js [skin...]` quét độ rõ chữ ở mọi màn hình
- v102: đã BỎ chế độ Tu tiên (isTuTien() luôn false, gỡ công tắc ở Cài đặt; mã linh thú/nhân vật còn nằm im, ẩn bằng class `tt-only`)
- v101: đã BỎ hẳn tính năng tin ngân hàng (bank.js, sms.js, hộp thư tự động Firebase, nút Dán SMS) theo yêu cầu người dùng – không thêm lại nếu không được yêu cầu
- `mascot.js` + `mascot/*.webp` – linh vật Mèo Xu (ảnh người dùng gửi đã tách nền: coin, hug, wave, bag, hold): v103 `coin` (mèo ôm đồng xu) là linh vật chính – trang trí góc thẻ chào ở Tổng quan (không chữ) và làm icon app (icon-*.png, apple-touch-icon, favicon); màn trống dùng các tư thế còn lại.; `tests/mascot.js`
- `cloud.js` – đăng nhập Google / Firestore; `store.js` – IndexedDB; `sw.js` – chạy offline
