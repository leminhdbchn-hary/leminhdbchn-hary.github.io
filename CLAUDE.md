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
- `index.html` – giao diện; `app.js` – logic chính; `features.js` – tính năng mở rộng; `sms.js` – dán SMS ngân hàng
- `skin.js` – giao diện màu (gold, sky, red, mono = Tối giản); `app.css` – style
- `cloud.js` – đăng nhập Google / Firestore; `store.js` – IndexedDB; `sw.js` – chạy offline
