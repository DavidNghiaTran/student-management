import { Router } from 'express';
import multer from 'multer';
import {
  adminDashboard,
  listStudents,
  addStudentForm,
  addStudent,
  editStudentForm,
  editStudent,
  deleteStudent,
  importStudents,
  listCourses,
  addCourse,
  deleteCourse,
  listGrades,
  reportHighGPA
} from '../controllers/admin.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Dashboard
router.get('/', adminDashboard);

// Students
router.get('/students', listStudents);
router.get('/students/add', addStudentForm);
router.post('/students/add', addStudent);
router.get('/students/edit/:id', editStudentForm);
router.post('/students/edit', editStudent);
router.post('/students/delete/:id', deleteStudent);
router.post('/students/import', upload.single('file'), importStudents);

// Courses
router.get('/courses', listCourses);
router.post('/courses/add', addCourse);
router.post('/courses/delete/:id', deleteCourse);

// Grades
router.get('/grades', listGrades);

// Reports
router.get('/reports/high_gpa', reportHighGPA);

export default router;
