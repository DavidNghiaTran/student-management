import { Router } from 'express';
import { student } from '../controllers/student.js';

const r = Router();
r.get('/', student.dashboard);
r.get('/profile', student.profileForm);
r.post('/profile', student.profileSave);
r.get('/grades', student.grades);

export default r;
