#!/usr/bin/env python3
"""Tạo trang Ngôi sao ĐTN cho một chi đoàn mới từ trang mẫu NgoisaoDTN_PTSPBL.
Dùng: python3 tools/new-chidoan.py <thu_muc> "<Tên chi đoàn>"
VD:   python3 tools/new-chidoan.py NgoisaoDTN_CD2 "Chi đoàn 2"
Mọi chi đoàn dùng chung MỘT tài khoản quản trị (Minhlv.ho) và khóa ở NgoisaoDTN_PTSPBL/vault.json.
"""
import json, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
folder, name = sys.argv[1:3]
src = (root / "NgoisaoDTN_PTSPBL" / "index.html").read_text(encoding="utf-8")
s = src.replace("NgoisaoDTN_PTSPBL", folder).replace("/NgoisaoDTN_PTSPBL/vault.json".replace("NgoisaoDTN_PTSPBL", folder), "/NgoisaoDTN_PTSPBL/vault.json")
s = s.replace("Chi đoàn 6 · Phân đoàn Phòng Phát triển sản phẩm bán lẻ", name).replace("Chi đoàn 6 · Chi bộ 20", name)
empty = json.dumps({"at": "2026-01-01T00:00:00.000Z", "settings": {"targetStars": 3}, "members": [], "activities": []})
s, n = re.subn(r"window\.__SNAPSHOT__=\{.*?\};</script>", lambda m: "window.__SNAPSHOT__=" + empty + ";</script>", s, count=1, flags=re.S)
assert n == 1
out = root / folder
out.mkdir(exist_ok=True)
(out / "index.html").write_text(s, encoding="utf-8")
if not (out / "data.json").exists():
    (out / "data.json").write_text(json.dumps({"members": [], "activities": []}, indent=1), encoding="utf-8")
print("Đã tạo", out)
