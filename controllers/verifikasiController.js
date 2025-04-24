const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users, RejectedUsers, Verifikasi } = require('../models');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Fungsi untuk mengirim email
const sendVerificationEmail = async (siswaEmail) => {
    try {
      // Buat transporter untuk nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Bisa menggunakan layanan lain seperti Yahoo, Outlook, dll.
        auth: {
          user: process.env.EMAIL, // Email pengirim
          pass: process.env.PASSWORD_APP_EMAIL, // Password atau aplikasi password
        },
      });
  
      // Setup email yang akan dikirim
      const mailOptions = {
        from: process.env.EMAIL, // Alamat email pengirim
        to: siswaEmail, // Alamat email penerima (siswa yang baru diverifikasi)
        subject: 'Verifikasi Siswa Berhasil',
        text: 'Selamat! Status verifikasi Anda telah berhasil diperbarui. Anda kini terdaftar sebagai siswa yang terverifikasi.',
      };
  
      // Kirim email
      await transporter.sendMail(mailOptions);
      console.log('Email verifikasi berhasil dikirim');
    } catch (error) {
      console.error('Gagal mengirim email verifikasi:', error);
    }
  };
  
// Verify Siswa
exports.verifySiswa = async (req, res) => {
  try {
    // Cek apakah pengguna sudah login
    if (!req.user) {
      return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    const { id } = req.params;
    const siswa = await Users.findByPk(id);

    if (!siswa) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }

    // Pastikan hanya admin atau superadmin yang bisa verifikasi
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Hanya admin atau superadmin yang dapat memverifikasi' });
    }

    // Tandai siswa sebagai terverifikasi dan tambahkan ID pengampu
    siswa.isVerified = true;
    siswa.verificationReason = req.body.reason || 'Tidak ada alasan diberikan';
    siswa.ampuanAdminId = req.user.id; // Tambahkan ID admin yang melakukan verifikasi
    await siswa.save();

    // Kirim email verifikasi ke siswa
    await sendVerificationEmail(siswa.email, siswa.verificationReason);

    res.json({
      message: 'Siswa berhasil diverifikasi, data tetap di tabel Users, dan email verifikasi telah dikirim',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};


  
  // Fungsi untuk mengirim email penolakan
  const sendRejectionEmail = async (siswaEmail, reason) => {
    try {
      // Buat transporter untuk nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Bisa menggunakan layanan lain seperti Yahoo, Outlook, dll.
        auth: {
          user: process.env.EMAIL, // Email pengirim
          pass: process.env.PASSWORD_APP_EMAIL, // Password atau aplikasi password
        },
      });
  
      // Setup email penolakan
      const mailOptions = {
        from: process.env.EMAIL, // Alamat email pengirim
        to: siswaEmail, // Alamat email penerima (siswa yang ditolak)
        subject: 'Pendaftaran Siswa Ditolak',
        text: `Kami mohon maaf, pendaftaran Anda sebagai siswa telah ditolak.\n\nAlasan Penolakan: ${reason}`,
      };
  
      // Kirim email
      await transporter.sendMail(mailOptions);
      console.log('Email penolakan berhasil dikirim');
    } catch (error) {
      console.error('Gagal mengirim email penolakan:', error);
    }
  };
  
  // Reject Siswa by Admin
  // Reject Siswa by Admin
  exports.rejectSiswa = async (req, res) => {
    try {
      const { id } = req.params;
      const siswa = await Users.findByPk(id);  // Pastikan id sesuai dengan yang ada di model Users
  
      if (!siswa) {
        return res.status(404).json({ message: 'Siswa tidak ditemukan' });
      }
  
      // Pastikan hanya admin yang bisa menolak siswa
      if (siswa.role !== 'siswa') {
        return res.status(400).json({ message: 'Hanya siswa yang dapat ditolak' });
      }
  
      // Tandai siswa sebagai ditolak
      siswa.isVerified = false;
      siswa.rejectionReason = req.body.reason || 'Tidak ada alasan diberikan';  // Menggunakan alasan dari body
      await siswa.save();
  
      // Check if nim is present before moving to RejectedUsers table
      if (!siswa.nim) {
        return res.status(400).json({ message: 'NIM siswa tidak ditemukan' });
      }
  
      await RejectedUsers.create({
        id: siswa.id,  // Keep the same ID
        name: siswa.name,
        nim: siswa.nim,
        jurusan: siswa.jurusan,
        universitas: siswa.universitas,
        email: siswa.email,
        password: siswa.password,
        rejectionReason: siswa.rejectionReason,
        isVerified: siswa.isVerified
      });
  
      // Hapus data siswa dari tabel Users
      await siswa.destroy();
  
      // Kirim email penolakan ke siswa
      await sendRejectionEmail(siswa.email, siswa.rejectionReason);
  
      res.json({
        message: 'Siswa berhasil ditolak, data telah dipindahkan ke tabel RejectedUsers, dan email penolakan telah dikirim',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  };

// ✅ Get All Verified Students (Verifikasi)
exports.getAllVerifiedStudents = async (req, res) => {
    try {
        const verifiedStudents = await Users.findAll({
            where: {
                role: 'siswa',
                isVerified: true
            }
        });

        if (verifiedStudents.length === 0) {
            return res.status(404).json({ message: 'Tidak ada siswa yang terverifikasi' });
        }

        res.json({ verifiedStudents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// ✅ Get All Pending Students (Siswa yang belum diverifikasi)
exports.getAllPendingStudents = async (req, res) => {
  try {
      const pendingStudents = await Users.findAll({
          where: {
              role: 'siswa',
              isVerified: false
          }
      });

      if (pendingStudents.length === 0) {
          return res.status(404).json({ message: 'Tidak ada siswa yang masih pending verifikasi' });
      }

      res.json({ pendingStudents });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

  // ✅ Get All Rejected Students (RejectedUsers)
  exports.getAllRejectedStudents = async (req, res) => {
    try {
      const rejectedStudents = await RejectedUsers.findAll();
  
      if (rejectedStudents.length === 0) {
        return res.status(202).json({ message: 'Tidak ada siswa yang ditolak' });
      }
  
      res.json({ rejectedStudents });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  };