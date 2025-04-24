const express = require('express');
const {
  verifySiswa,
  rejectSiswa,
  getAllVerifiedStudents,
  getAllRejectedStudents, 
  getAllPendingStudents,
} = require('../controllers/verifikasiController');

const {
  verifyToken
} = require('../middleware/auth');

const router = express.Router();

// ✅ Student Verification Routes
router.put('/reject-siswa/:id', verifyToken, rejectSiswa);
router.put('/verify-siswa/:id', verifyToken, verifySiswa);

// ✅ Retrieve Verified & Rejected Students
router.get('/pending-students', verifyToken, getAllPendingStudents);
router.get('/verified-students', verifyToken, getAllVerifiedStudents);
router.get('/rejected-students', verifyToken, getAllRejectedStudents);

module.exports = router;
