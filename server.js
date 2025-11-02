import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';
import studentRoutes from './src/routes/student.js';
import { requireRole } from './src/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'replace-with-strong-secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/login'));

app.use('/', authRoutes);
app.use('/admin', requireRole('GIAOVIEN'), adminRoutes);
app.use('/student', requireRole('SINHVIEN'), studentRoutes);

// 404
app.use((req, res) => res.status(404).render('_layout', { view: '403', title: 'Không tồn tại', user: req.session.user }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
