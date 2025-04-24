const { Report, Users } = require("../models");

exports.createReport = async (req, res) => {
  try {
    const { name, university, title, description, startDate, endDate } = req.body;
    const userId = req.user.id;

    // 🔥 Cek apakah user dengan userId ini ada di database
    const userExists = await Users.findByPk(userId);
    if (!userExists) {
      return res.status(400).json({ message: "User tidak ditemukan, pastikan sudah terdaftar" });
    }

    const report = await Report.create({
      name,
      university,
      title,
      description,
      startDate,
      endDate,
      status: "pending",
      userId,
    });

    res.status(201).json({
      message: "Laporan berhasil dibuat",
      report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ✅ Ambil semua laporan (hanya yang sesuai dengan user pengampu)
exports.getAllReports = async (req, res) => {
  try {
    const userId = req.user.id; // 🔥 Ambil ID user dari request
    const reports = await Report.findAll({
      where: { userId }, // 🔥 Filter laporan hanya untuk user tertentu
      order: [["createdAt", "DESC"]],
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID laporan

    // Cari laporan berdasarkan ID
    const report = await Report.findByPk(id); // Gunakan findByPk

    if (!report) {
      return res.status(404).json({ message: "Laporan tidak ditemukan." });
    }

    res.json(report); // Kirim laporan ke frontend
  } catch (error) {
    console.error("Error:", error); // Tambahkan logging untuk debugging
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};




// ✅ Ambil semua laporan yang dibuat oleh user tertentu
exports.getReportsByUser = async (req, res) => {
  try {
    const userId = req.params.id; // Ambil ID user yang sedang login

    const reports = await Report.findAll({ where: { userId } });
    
    if (!reports.length) {
      return res.status(404).json({ message: "Tidak ada laporan yang ditemukan untuk user ini" });
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ✅ Update laporan (hanya jika milik user)
exports.updateReport = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.id;
    const report = await Report.findOne({ where: { id: req.params.id, userId } });

    if (!report) return res.status(404).json({ message: "Laporan tidak ditemukan atau tidak memiliki akses" });

    await report.update({ title, description, startDate, endDate });

    res.json({ message: "Laporan berhasil diperbarui", report });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ✅ Hapus laporan (hanya jika milik user)
exports.deleteReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const report = await Report.findOne({ where: { id: req.params.id, userId } });

    if (!report) return res.status(404).json({ message: "Laporan tidak ditemukan atau tidak memiliki akses" });

    await report.destroy();
    res.json({ message: "Laporan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ✅ Persetujuan laporan (Admin atau pengampu bisa approve)
exports.approveReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: "Laporan tidak ditemukan" });

    if (report.status !== "pending") {
      return res.status(400).json({ message: "Laporan sudah diproses" });
    }

    await report.update({ status: "approved" });

    res.json({ message: "Laporan disetujui", report });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ✅ Tolak laporan (Admin atau pengampu bisa reject)
exports.rejectReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: "Laporan tidak ditemukan" });

    if (report.status !== "pending") {
      return res.status(400).json({ message: "Laporan sudah diproses" });
    }

    await report.update({ status: "rejected" });

    res.json({ message: "Laporan ditolak", report });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
