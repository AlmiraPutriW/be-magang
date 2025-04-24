const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {generateToken} = require('../utils/jwt');
const { Users, RejectedUsers, Verifikasi } = require('../models');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Validasi Email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.register = async (req, res) => {
  try {
    const { name, nim, jurusan, universitas, email, password, startDate, endDate } = req.body;

    // 🔥 Validasi jika ada field yang kosong
    if (!name || !nim || !jurusan || !universitas || !email || !password || !startDate || !endDate) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    if (!isValidEmail(email)) return res.status(400).json({ message: 'Format email tidak valid' });
    if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter' });

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' });
    }

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      name, nim, jurusan, universitas, email,
      password: hashedPassword,
      role: 'siswa',
      isVerified: false,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.status(201).json({ message: 'Registrasi berhasil, tunggu verifikasi oleh admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};


// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari akun di semua tabel
    let user = await Users.findOne({ where: { email } }) ||
               await Verifikasi.findOne({ where: { email } });

    // Jika tidak ditemukan di Users atau Verifikasi, cek di RejectedUsers
    if (!user) {
      const rejectedUser = await RejectedUsers.findOne({ where: { email } });
      if (rejectedUser) {
        return res.status(403).json({ message: 'Akun Anda telah ditolak. Silakan hubungi admin.' });
      }
    }

    // Jika tetap tidak ditemukan, kirim error
    if (!user) return res.status(400).json({ message: 'Pengguna tidak ditemukan' });

    // 🔥 Jika role admin, langsung lanjut (tidak perlu verifikasi)
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      // Jika bukan admin/superadmin, cek apakah sudah diverifikasi
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Akun Anda belum diverifikasi oleh admin.' });
      }
    }

    // 🔥 Cek apakah user memiliki password (hindari error bcrypt)
    if (!user.password) {
      return res.status(500).json({ message: 'Terjadi kesalahan, password tidak ditemukan.' });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password salah' });

    // Buat token
    const accessToken = jwt.sign(
      { id: user.id,
        nama: user.name,
        password: user.password, 
        email: user.email, 
        role: user.role,
        startDate: user.startDate,
        endDate: user.endDate },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie token
    res.cookie('accessToken', accessToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    res.json({
      message: 'Login berhasil',
      accessToken,
      role: user.role,
      id: user.id,
      email: user.email,
      nama:user.name,
      jabatan:user.jabatan,
      bidang: user.bidang,
      nip: user.nip
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};



// ✅ Register Superadmin (bisa lebih dari satu)
exports.registerSuperadmin = async (req, res) => {
  try {
    const { name, nip, bidang, jabatan, email, password } = req.body;

    if (!isValidEmail(email)) return res.status(400).json({ message: 'Format email tidak valid' });
    if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter' });

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      name, nip, bidang, jabatan, email,
      password: hashedPassword,
      role: 'superadmin',  // Bisa ada banyak superadmin
      isVerified: true,
    });

    res.status(201).json({ message: 'Superadmin berhasil dibuat' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat registrasi Superadmin' });
  }
};


// ✅ Tambah Admin oleh Superadmin
exports.createAdmin = async (req, res) => {
  try {
    const { name, nip, bidang, jabatan, email, password } = req.body;

    if (!isValidEmail(email)) return res.status(400).json({ message: 'Format email tidak valid' });
    if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter' });

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      name, nip, bidang, jabatan, email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });

    res.status(201).json({ message: 'Admin berhasil ditambahkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan admin' });
  }
};

// ✅ Refresh Token (Gunakan cookies untuk mengambil refresh token)
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Token tidak tersedia' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Token tidak valid' });

      const user = await Users.findByPk(decoded.id);
      if (!user) return res.status(403).json({ message: 'Pengguna tidak ditemukan' });

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getProfilebyId = async (req, res) => {
  try {
    // Default to logged-in user's ID
    let userId = req.user.id;

    // Check if the logged-in user is an admin or superadmin, so they can get other users' profiles
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      userId = req.params.id;  // Use the ID from the URL parameter for admins and superadmins
    }

    // Try to fetch the user from the Users table first
    let user = await Users.findByPk(userId);
    console.log('User from Users table:', user); // Log untuk memeriksa apakah user ditemukan

    // If not found in Users, check in Verifikasi table (for verified students)
    if (!user) {
      user = await Verifikasi.findByPk(userId);
      console.log('User from Verifikasi table:', user); // Log untuk Verifikasi
    }

    // If not found in Verifikasi, check in RejectedUsers table (for rejected students)
    if (!user) {
      user = await RejectedUsers.findByPk(userId);
      console.log('User from RejectedUsers table:', user); // Log untuk RejectedUsers
    }

    // If user is still not found, return a not found response
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    // Base profile information
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // If the user is admin or superadmin, include additional information like nip, bidang, jabatan
    if (user.role === 'admin' || user.role === 'superadmin') {
      profile.nip = user.nip;
      profile.bidang = user.bidang;
      profile.jabatan = user.jabatan;
    }

    // If the user is a siswa (student), include additional information for students
    if (user.role === 'siswa') {
      profile.startDate = user.startDate;
      profile.endDate = user.endDate;
      profile.isVerified = user.isVerified;
      profile.nim = user.nim;
      profile.jurusan = user.jurusan;
      profile.universitas = user.universitas;

      if (user.rejectionReason) {
        profile.rejectionReason = user.rejectionReason;
      }

      if (user.verificationReason) {
        profile.verificationReason = user.verificationReason;
      }
    }

    // Send the profile response
    res.json(profile);
  } catch (error) {
    console.error('Error occurred:', error);  // Log the error to help with debugging
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getSiswaByAdmin = async (req, res) => {
  try {
    const ampuanAdminId = parseInt(req.params.adminId, 10);

    if (isNaN(ampuanAdminId)) {
      return res.status(400).json({ message: 'Admin ID tidak valid' });
    }

    // Cari siswa berdasarkan ampuanAdminId di tabel Users
    const siswaList = await Users.findAll({
      where: { ampuanAdminId }, // Gunakan kolom ampuanAdminId
      attributes: ['id', 'name', 'nim', 'jurusan', 'universitas', 'email', 'isVerified'], // Pilih atribut yang relevan
    });

    if (!siswaList.length) {
      return res.status(404).json({ message: 'Tidak ada siswa yang diampu oleh admin ini' });
    }

    res.json({
      message: `Daftar siswa yang diampu oleh admin ${ampuanAdminId}`,
      data: siswaList,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};


// ✅ Get All Students (Siswa)
exports.getAllSiswa = async (req, res) => {
  try {
    const siswaList = await Users.findAll({
      where: { role: 'siswa' },
      attributes: ['id', 'name', 'nim', 'jurusan', 'universitas', 'email', 'startDate', 'endDate', 'isVerified']
    });

    if (siswaList.length === 0) {
      return res.status(404).json({ message: 'Tidak ada siswa yang ditemukan' });
    }

    res.json({ siswa: siswaList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Logout (Hapus cookie refresh token)
exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.json({ message: 'Logout berhasil' });
};
