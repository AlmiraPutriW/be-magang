const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware untuk memverifikasi token dari cookie
const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Akses ditolak: Token tidak tersedia' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token tidak valid' });
  }
};

// Middleware untuk mengecek role pengguna
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak: Role tidak sesuai' });
    }
    next();
  };
};

// Middleware untuk mengecek akses siswa dalam rentang tanggal magang
const checkSiswaAccess = (req, res, next) => {
  if (req.user.role !== 'siswa') return next(); // Admin dan superadmin memiliki akses bebas

  const today = new Date();
  const startDate = new Date(req.user.startDate);
  const endDate = new Date(req.user.endDate);

  if (!req.user.startDate || !req.user.endDate || today < startDate || today > endDate) {
    return res.status(403).json({ message: 'Akses hanya tersedia dalam tanggal magang' });
  }

  next();
};

// Middleware khusus untuk memverifikasi superadmin
const verifySuperadmin = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(403).json({ message: 'Akses ditolak: Token tidak ada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Akses ditolak: Bukan Superadmin atau Admin' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token tidak valid' });
  }
};


const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token tidak tersedia' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid atau telah kadaluarsa' });

    req.user = decoded; // Simpan user yang sudah di-decode ke dalam req
    next();
  });
};



module.exports = { authMiddleware, checkRole, checkSiswaAccess, verifySuperadmin, verifyToken };
