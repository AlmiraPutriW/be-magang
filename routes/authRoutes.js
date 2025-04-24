const express = require('express');
const {
  register,
  login,
  logout,
  registerSuperadmin,
  createAdmin,
  getProfilebyId,
  getAllSiswa,
  getSiswaByAdmin
} = require('../controllers/authController');

const {
  verifySiswa,
  rejectSiswa,
  getAllVerifiedStudents,
  getAllRejectedStudents
} = require('../controllers/verifikasiController');

const {
  authMiddleware,
  checkRole,
  checkSiswaAccess,
  verifySuperadmin,
  verifyToken
} = require('../middleware/auth');

const router = express.Router();

// ✅ User Authentication Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);

// ✅ Superadmin Routes (Restricted Access)
router.post('/register-superadmin', registerSuperadmin);
router.post('/create-admin', verifyToken, createAdmin);

// ✅ User Profile Routes
router.get('/profilebyId/:id', verifyToken, getProfilebyId);
router.get('/allUser', verifyToken, getAllSiswa);
router.get('/getbyadmin/:adminId', verifyToken, getSiswaByAdmin);

// ✅ Student Verification Routes
router.put('/reject-siswa/:id', verifyToken, rejectSiswa);
router.put('/verify-siswa/:id', verifyToken, verifySiswa);

// ✅ Retrieve Verified & Rejected Students
router.get('/verified-students', verifyToken, getAllVerifiedStudents);
router.get('/rejected-students', verifyToken, getAllRejectedStudents);

module.exports = router;
