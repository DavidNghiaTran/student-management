import { db } from '../db.js';
import bcrypt from 'bcryptjs';

export function requireRole(role) {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user) return res.status(403).render('_layout', { view: '403', title: 'Không có quyền', user: null });
    if (role && user.vai_tro !== role) return res.status(403).render('_layout', { view: '403', title: 'Không có quyền', user });
    next();
  };
}

export function login(username, password) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM tai_khoan WHERE username=?', [username], async (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      const ok = await bcrypt.compare(password, row.password);
      if (!ok) return resolve(null);
      resolve({ username: row.username, vai_tro: row.vai_tro });
    });
  });
}
