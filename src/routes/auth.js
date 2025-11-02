import { Router } from 'express';
import { auth } from '../controllers/auth.js';

const r = Router();
r.get('/login', auth.loginForm);
r.post('/login', auth.login);
r.get('/logout', auth.logout);
export default r;
