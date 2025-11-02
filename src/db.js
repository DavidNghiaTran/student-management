import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/qlsv_node.db');

sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

export function init() {
  // Bật khóa ngoại
  db.exec('PRAGMA foreign_keys = ON');
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tai_khoan(
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      vai_tro TEXT NOT NULL CHECK(vai_tro IN ('SINHVIEN','GIAOVIEN'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sinh_vien(
      ma_sv TEXT PRIMARY KEY,
      ho_ten TEXT NOT NULL,
      ngay_sinh TEXT,
      lop TEXT,
      khoa TEXT,
      email TEXT UNIQUE,
      location TEXT,
      FOREIGN KEY(ma_sv) REFERENCES tai_khoan(username) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS mon_hoc(
      ma_mh TEXT PRIMARY KEY,
      ten_mh TEXT NOT NULL,
      so_tin_chi INTEGER NOT NULL DEFAULT 3
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ket_qua(
      ma_sv TEXT NOT NULL,
      ma_mh TEXT NOT NULL,
      diem_chuyen_can REAL,
      diem_giua_ky REAL,
      diem_cuoi_ky REAL,
      diem_tong_ket REAL,
      diem_chu TEXT,
      PRIMARY KEY (ma_sv, ma_mh),
      FOREIGN KEY(ma_sv) REFERENCES sinh_vien(ma_sv) ON DELETE CASCADE,
      FOREIGN KEY(ma_mh) REFERENCES mon_hoc(ma_mh) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS thong_bao(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tieu_de TEXT NOT NULL,
      noi_dung TEXT NOT NULL,
      ngay_gui DATETIME DEFAULT (datetime('now')),
      ma_gv TEXT,
      lop_nhan TEXT,
      FOREIGN KEY(ma_gv) REFERENCES tai_khoan(username) ON DELETE SET NULL
    )`);
  });
}

export { db };
