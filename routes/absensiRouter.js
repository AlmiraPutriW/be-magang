const express = require('express');
const { 
    createAbsensi, 
    getAllAbsensi, 
    getAbsensiBySiswa, 
    updateAbsensi, getAbsensiById
} = require('../controllers/absensiController');
const {
    verifyToken
  } = require('../middleware/auth');


const router = express.Router();

// Rute untuk menambahkan absensi baru
router.post('/', verifyToken, createAbsensi);

// Rute untuk mendapatkan semua data absensi
router.get('/', getAllAbsensi);

// Rute untuk mendapatkan absensi berdasarkan ID siswa
router.get('/user/:id', getAbsensiBySiswa);
router.get('/:id', verifyToken, getAbsensiById);
// Rute untuk memperbarui absensi terakhir
router.put('/update/:id', updateAbsensi);

module.exports = router;
