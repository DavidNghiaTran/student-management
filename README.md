# Student Management (Node.js + Express + SQLite) — Full Spec

Bản triển khai đáp ứng đặc tả: tài khoản/role (SINHVIEN, GIAOVIEN), quản lý sinh viên, môn học, điểm chi tiết (CC, GK, CK, TK, chữ), GPA, báo cáo, thông báo, import/export Excel.

## Chạy
```bash
npm install
npm run seed
npm run dev
# http://localhost:3000
```

Tài khoản mẫu:
- Giáo viên: `gv01 / giaovien123`
- Sinh viên: `SV001 / sv123`

## ENV
- `DB_PATH` (mặc định: `./data/qlsv_node.db`)

## Cấu trúc DB
- `tai_khoan(username PK, password hash, vai_tro IN('SINHVIEN','GIAOVIEN'))`
- `sinh_vien(ma_sv PK -> tai_khoan.username, ho_ten, ngay_sinh, lop, khoa, email, location)`
- `mon_hoc(ma_mh PK, ten_mh, so_tin_chi)`
- `ket_qua((ma_sv,ma_mh) PK, cc,gk,ck, tk, chu)`
- `thong_bao(id, tieu_de, noi_dung, ngay_gui, ma_gv, lop_nhan)`

## Tính năng chính
- Đăng nhập/đăng xuất; phân quyền
- Admin (GIAOVIEN): SV, Môn học, Điểm (xem/nhập/sửa/import), Báo cáo (GPA cao, thiếu điểm, GPA theo lớp), Xuất Excel, Gửi thông báo
- Sinh viên: Trang chủ (TB + biểu đồ TK), Hồ sơ (sửa), Bảng điểm (GPA, biểu đồ)

## Import Excel
- SV: cột linh hoạt `student_id`/`MSSV`/`MaSV`, `full_name`/`Họ tên`, `password`, `role`, `email`, `location`, `class`/`Lớp`, `khoa`, `ngay_sinh`
- Điểm: `ma_sv`/`MSSV`, `diem_chuyen_can`/`cc`, `diem_giua_ky`/`gk`, `diem_cuoi_ky`/`ck`
