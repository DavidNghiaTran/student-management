import { db } from '../db.js';

export const student = {
  dashboard(req, res) {
    const ma_sv = req.session.user.username;
    db.get('SELECT * FROM sinh_vien WHERE ma_sv=?', [ma_sv], (e1, sv)=>{
      db.all('SELECT * FROM thong_bao WHERE lop_nhan IS NULL OR lop_nhan = ? ORDER BY ngay_gui DESC LIMIT 10', [sv?.lop || ''], (e2, tb)=>{
        db.all('SELECT kq.ma_mh, IFNULL(kq.diem_tong_ket, NULL) as tk FROM ket_qua kq WHERE kq.ma_sv=? ORDER BY kq.ma_mh', [ma_sv], (e3, series)=>{
          const labels = (series||[]).map(r => r.ma_mh);
          const data = (series||[]).map(r => r.tk ?? null);
          res.render('_layout', { view: 'student_dashboard', title: 'Trang chủ sinh viên', user: req.session.user, sv, tb: tb||[], labels: JSON.stringify(labels), data: JSON.stringify(data) });
        });
      });
    });
  },

  profileForm(req, res) {
    const ma_sv = req.session.user.username;
    db.get('SELECT * FROM sinh_vien WHERE ma_sv=?', [ma_sv], (e, sv)=>{
      res.render('_layout', { view: 'student_profile', title: 'Hồ sơ', user: req.session.user, sv, msg: null, err: null });
    });
  },

  profileSave(req, res) {
    const ma_sv = req.session.user.username;
    const { ho_ten, ngay_sinh, email, location } = req.body;
    db.run('UPDATE sinh_vien SET ho_ten=?, ngay_sinh=?, email=?, location=? WHERE ma_sv=?', [ho_ten, ngay_sinh || null, email || null, location || null, ma_sv], (err)=>{
      db.get('SELECT * FROM sinh_vien WHERE ma_sv=?', [ma_sv], (e, sv)=>{
        res.render('_layout', { view: 'student_profile', title: 'Hồ sơ', user: req.session.user, sv, msg: err?null:'Cập nhật thành công', err: err? 'Không thể cập nhật (có thể trùng email).' : null });
      });
    });
  },

  grades(req, res) {
    const ma_sv = req.session.user.username;
    const sql = `SELECT mh.ma_mh, mh.ten_mh, mh.so_tin_chi, kq.diem_chuyen_can, kq.diem_giua_ky, kq.diem_cuoi_ky, kq.diem_tong_ket, kq.diem_chu
                 FROM mon_hoc mh LEFT JOIN ket_qua kq ON kq.ma_mh = mh.ma_mh AND kq.ma_sv=? ORDER BY mh.ma_mh`;
    db.all(sql, [ma_sv], (err, rows)=>{
      // GPA 10
      const valid = (rows||[]).filter(r => r.diem_tong_ket != null);
      const totalTC = valid.reduce((a,b)=> a + (b.so_tin_chi||0), 0);
      const sum = valid.reduce((a,b)=> a + (b.diem_tong_ket||0) * (b.so_tin_chi||0), 0);
      const gpa10 = totalTC ? Math.round((sum/totalTC)*100)/100 : null;
      // GPA 4
      const to4 = (tk)=> tk==null?null: (tk>=8.5?4.0: tk>=8.0?3.5: tk>=7.0?3.0: tk>=6.5?2.5: tk>=5.5?2.0: tk>=5.0?1.5: tk>=4.0?1.0:0.0);
      const gpa4 = totalTC ? Math.round((valid.reduce((a,b)=> a + to4(b.diem_tong_ket) * (b.so_tin_chi||0), 0)/totalTC)*100)/100 : null;

      const labels = (rows||[]).map(r => r.ma_mh);
      const data = (rows||[]).map(r => r.diem_tong_ket ?? null);
      res.render('_layout', { view: 'student_grades', title: 'Bảng điểm', user: req.session.user, rows: rows||[], gpa10, gpa4, labels: JSON.stringify(labels), data: JSON.stringify(data) });
    });
  }
};
