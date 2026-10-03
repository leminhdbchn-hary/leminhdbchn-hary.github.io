# Sổ Thu Chi cho Android

App Android là một **Trusted Web Activity (TWA)**: mở chính trang
https://leminhdbchn-hary.github.io/ bằng Chrome, toàn màn hình, không thanh địa chỉ.
Vì vậy mỗi lần cập nhật web thì app cũng tự có bản mới, đăng nhập Google và dữ liệu
dùng chung với Chrome trên máy.

## Cách build

GitHub Actions (`.github/workflows/android.yml`) tự build mỗi khi `version.json` đổi
trên nhánh `main`, hoặc bấm tay ở tab **Actions → Android APK → Run workflow**.
Kết quả:

- File `.apk` (cài trực tiếp) và `.aab` (đưa lên Google Play) ở trang **Releases**,
  tag `android-v<số phiên bản>`.

## Cài đặt lần đầu (chỉ làm 1 lần)

Thêm 2 secret ở **Settings → Secrets and variables → Actions → New repository secret**:

| Tên | Giá trị |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | nội dung file `android.keystore.base64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | mật khẩu keystore |

Giữ file `android.keystore` và mật khẩu ở nơi an toàn, **không commit vào repo**.
Mất key thì không cập nhật được app đã cài (phải gỡ ra cài lại).

## Liên kết web ↔ app

`/.well-known/assetlinks.json` chứa dấu vân tay SHA-256 của key ký app. Nếu thiếu hoặc
sai, app vẫn chạy nhưng hiện thanh địa chỉ Chrome ở trên cùng.

Khi đưa lên Google Play có bật *Play App Signing*, thêm dấu vân tay
"App signing key certificate" (Play Console → Setup → App integrity) vào mảng
`sha256_cert_fingerprints` trong file đó.

Xem dấu vân tay của key:

```
keytool -list -v -keystore android.keystore -alias sothuchi
```
