import bcrypt from 'bcryptjs';
import { db, init } from '../db.js';

init();

export const auth = {
  loginForm(req, res) {
    res.render('_layout', { view: 'login', title: 'Đăng nhập', user: null, error: null });
  },
  async login(req, res) {
    const { username, password } = req.body;
    db.get('SELECT * FROM tai_khoan WHERE username = ?', [username], async (err, row) => {
      if (err || !row) {
        return res.render('_layout', { view: 'login', title: 'Đăng nhập', user: null, error: 'Sai tên đăng nhập hoặc mật khẩu' });
      }
      const ok = await bcrypt.compare(password, row.password);
      if (!ok) {
        return res.render('_layout', { view: 'login', title: 'Đăng nhập', user: null, error: 'Sai tên đăng nhập hoặc mật khẩu' });
      }
      req.session.user = { username: row.username, vai_tro: row.vai_tro };
      return res.redirect(row.vai_tro === 'GIAOVIEN' ? '/admin' : '/student');
    });
  },
  logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
  }
};
