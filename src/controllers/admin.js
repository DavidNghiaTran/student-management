import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================== KẾT NỐI DATABASE ======================
const dbPath = path.resolve('data', 'qlsv_node.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Không thể mở database:', err);
  else console.log('✅ Kết nối SQLite thành công.');
});

// ========================= DASHBOARD =========================
export const adminDashboard = (req, res) => {
  db.serialize(() => {
    db.get('SELECT COUNT(*) AS count FROM sinh_vien', (err, sv) => {
      db.get('SELECT COUNT(*) AS count FROM mon_hoc', (err2, mh) => {
        db.get('SELECT COUNT(*) AS count FROM ket_qua', (err3, d) => {
          const stats = {
            sv: sv?.count || 0,
            mh: mh?.count || 0,
            kq: d?.count || 0
          };
          res.render('_layout', {
            view: 'admin_dashboard',
            title: 'Bảng điều khiển',
            user: req.session.user,
            stats
          });
        });
      });
    });
  });
};

// ========================= SINH VIÊN =========================
export const listStudents = (req, res) => {
  db.all('SELECT * FROM sinh_vien', (err, rows) => {
    if (err) console.error(err);
    res.render('_layout', {
      view: 'admin_students',
      title: 'Danh sách sinh viên',
      user: req.session.user,
      students: rows || []
    });
  });
};

export const addStudentForm = (req, res) => {
  res.render('_layout', {
    view: 'admin_add_student',
    title: 'Thêm sinh viên',
    user: req.session.user,
    error: null
  });
};

export const addStudent = (req, res) => {
  const { ma_sv, ho_ten, ngay_sinh, lop, khoa, email, location, password } = req.body;
  const pass = String(password || '12345').trim();
  const hash = bcrypt.hashSync(pass, 10);

  db.serialize(() => {
    db.run(
      'INSERT INTO tai_khoan(username, password, vai_tro) VALUES (?,?,?)',
      [ma_sv, hash, 'SINHVIEN'],
      (e1) => {
        if (e1) {
          console.error(e1);
          return res.render('_layout', {
            view: 'admin_add_student',
            title: 'Th�m sinh vi�n',
            user: req.session.user,
            error: 'Kh�ng th? t?o t�i kho?n: ' + e1.message
          });
        }
        }

        db.run(
          `INSERT INTO sinh_vien(ma_sv, ho_ten, ngay_sinh, lop, khoa, email, location)
           VALUES (?,?,?,?,?,?,?)`,
          [ma_sv, ho_ten, ngay_sinh || null, lop || null, khoa || null, email || null, location || null],
          (e2) => {
            if (e2) {
              console.error(e2);
              return res.render('_layout', {
                view: 'admin_add_student',
                title: 'Thêm sinh viên',
                user: req.session.user,
                error: 'Không thể thêm sinh viên: ' + e2.message
              });
            }
            res.redirect('/admin/students');
          }
        );
      }
    );
  });
};

export const editStudentForm = (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM sinh_vien WHERE ma_sv = ?', [id], (err, row) => {
    if (err || !row) return res.redirect('/admin/students');
    res.render('_layout', {
      view: 'admin_edit_student',
      title: 'Sửa sinh viên',
      user: req.session.user,
      student: row
    });
  });
};

export const editStudent = (req, res) => {
  const { ma_sv, ho_ten, ngay_sinh, lop, khoa, email, location } = req.body;
  db.run(
    `UPDATE sinh_vien SET ho_ten=?, ngay_sinh=?, lop=?, khoa=?, email=?, location=? WHERE ma_sv=?`,
    [ho_ten, ngay_sinh, lop, khoa, email, location, ma_sv],
    (err) => {
      if (err) console.error(err);
      res.redirect('/admin/students');
    }
  );
};

export const deleteStudent = (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM sinh_vien WHERE ma_sv=?', [id], (err) => {
    if (err) console.error(err);
    db.run('DELETE FROM tai_khoan WHERE username=?', [id], () => {
      res.redirect('/admin/students');
    });
  });
};

// ========================= IMPORT EXCEL =========================
export const importStudents = (req, res) => {
  if (!req.file) return res.redirect('/admin/students');
  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  db.serialize(() => {
    const stmtAcc = db.prepare('INSERT INTO tai_khoan(username, password, vai_tro) VALUES (?,?,?)');
    const stmtStu = db.prepare(
      `INSERT INTO sinh_vien(ma_sv, ho_ten, ngay_sinh, lop, khoa, email, location)
       VALUES (?,?,?,?,?,?,?)`
    );

    for (const r of rows) {
      const normalized = {};
      for (const key in r) {
        normalized[key.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '')] = r[key];
      }

      const ma_sv = normalized.masv || normalized.student_id || normalized.mssv || normalized.id || '';
      const ho_ten =
        normalized.hoten || normalized.fullname || normalized['full name'] || '';
      const lop = normalized.lop || normalized.class || '';
      const khoa = normalized.khoa || normalized.department || '';
      const email = normalized.email || '';
      const location = normalized.location || '';
      const ngay_sinh = normalized.ngaysinh || normalized.ngay_sinh || '';
      const rawPassword = String(normalized.password || '12345').trim();
      const hash = bcrypt.hashSync(rawPassword, 10);

      if (ma_sv && ho_ten) {
        stmtAcc.run([ma_sv, hash, 'SINHVIEN']);
        stmtStu.run([ma_sv, ho_ten, ngay_sinh, lop, khoa, email, location]);
      }
    }

    stmtAcc.finalize();
    stmtStu.finalize();
    res.redirect('/admin/students');
  });
};

// ========================= MÔN HỌC =========================
export const listCourses = (req, res) => {
  db.all('SELECT * FROM mon_hoc ORDER BY ma_mh', (err, rows) => {
    if (err) console.error(err);
    res.render('_layout', {
      view: 'admin_courses',
      title: 'Danh sách môn học',
      user: req.session.user,
      courses: rows || [],
      error: null
    });
  });
};

export const addCourse = (req, res) => {
  const { ma_mh, ten_mh, so_tin_chi } = req.body;

  if (!ma_mh || !ten_mh) {
    return db.all('SELECT * FROM mon_hoc ORDER BY ma_mh', (err, rows) => {
      res.render('_layout', {
        view: 'admin_courses',
        title: 'Danh sách môn học',
        user: req.session.user,
        courses: rows || [],
        error: 'Thiếu thông tin bắt buộc!'
      });
    });
  }

  db.get('SELECT ma_mh FROM mon_hoc WHERE ma_mh = ?', [ma_mh], (err, row) => {
    if (row) {
      return db.all('SELECT * FROM mon_hoc ORDER BY ma_mh', (err2, rows) => {
        res.render('_layout', {
          view: 'admin_courses',
          title: 'Danh sách môn học',
          user: req.session.user,
          courses: rows || [],
          error: '❌ Mã môn học đã tồn tại!'
        });
      });
    }

    db.run(
      'INSERT INTO mon_hoc(ma_mh, ten_mh, so_tin_chi) VALUES (?, ?, ?)',
      [ma_mh, ten_mh, parseInt(so_tin_chi) || 3],
      (e2) => {
        if (e2) {
          console.error(e2);
          return db.all('SELECT * FROM mon_hoc ORDER BY ma_mh', (err3, rows) => {
            res.render('_layout', {
              view: 'admin_courses',
              title: 'Danh sách môn học',
              user: req.session.user,
              courses: rows || [],
              error: '❌ Lỗi khi thêm môn học: ' + e2.message
            });
          });
        }
        res.redirect('/admin/courses');
      }
    );
  });
};

export const deleteCourse = (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM mon_hoc WHERE ma_mh=?', [id], (err) => {
    if (err) console.error(err);
    res.redirect('/admin/courses');
  });
};

// ========================= ĐIỂM & BÁO CÁO =========================
export const listGrades = (req, res) => {
  db.all(
    `SELECT d.*, s.ho_ten, m.ten_mh
     FROM ket_qua d
     JOIN sinh_vien s ON d.ma_sv = s.ma_sv
     JOIN mon_hoc m ON d.ma_mh = m.ma_mh`,
    (err, rows) => {
      if (err) console.error(err);
      res.render('_layout', {
        view: 'admin_grades',
        title: 'Bảng điểm',
        user: req.session.user,
        grades: rows || []
      });
    }
  );
};

export const reportHighGPA = (req, res) => {
  db.all(
    `SELECT s.ma_sv, s.ho_ten, ROUND(AVG(d.diem),2) AS gpa
     FROM ket_qua d
     JOIN sinh_vien s ON d.ma_sv = s.ma_sv
     GROUP BY s.ma_sv, s.ho_ten
     HAVING gpa >= 8`,
    (err, rows) => {
      res.render('_layout', {
        view: 'admin_report_gpa',
        title: 'Báo cáo sinh viên điểm cao',
        user: req.session.user,
        report: rows || []
      });
    }
  );
};
