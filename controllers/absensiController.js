const { Absensi, Users } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

const createAbsensi = async (req, res) => {
    try {
        console.log("REQ BODY:", req.body);
        console.log("REQ USER:", req.user);

        const siswaId = req.user?.id;
        console.log("ID Siswa yang diterima:", siswaId);

        if (!siswaId) {
            return res.status(400).json({ message: "ID siswa diperlukan" });
        }

        // Cari siswa berdasarkan ID
        const siswa = await Users.findByPk(siswaId);
        if (!siswa) {
            return res.status(404).json({ message: "Siswa tidak ditemukan" });
        }

        // Cek apakah siswa sudah absen masuk hari ini
        const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
        const existingAbsensi = await Absensi.findOne({
            where: {
                idsiswa: siswaId,
                createdAt: { 
                    [Op.gte]: new Date(`${today}T00:00:00`), 
                    [Op.lte]: new Date(`${today}T23:59:59`) 
                }
            },
            order: [['createdAt', 'DESC']] // Ambil data terbaru jika ada
        });

        const jamSekarang = moment().tz('Asia/Jakarta').format('HH:mm:ss');

        // Jika sudah absen masuk tapi belum absen pulang, update jam_pulang
        if (existingAbsensi && !existingAbsensi.jam_pulang) {
            await existingAbsensi.update({
                jam_pulang: jamSekarang
            });
            return res.status(200).json({ message: "Absensi pulang berhasil", absensi: existingAbsensi });
        }

        // Jika belum ada absensi, buat absen masuk baru
        const absensi = await Absensi.create({
            idsiswa: siswaId,
            nama: siswa.name,
            nim: siswa.nim,
            bidang: siswa.jurusan,
            status_kehadiran: req.body.statusKehadiran || 'Hadir',
            position_latitude: req.body.position?.latitude || null,
            position_longitude: req.body.position?.longitude || null,
            jam_mulai: jamSekarang,
            jam_pulang: null // Pulang akan diisi saat update nanti
        });

        res.status(201).json({ message: "Absensi masuk berhasil", absensi });
    } catch (error) {
        console.error("Error saat menambah absensi:", error);
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};

const updateAbsensi = async (req, res) => {
    try {
        // Cari absensi terbaru berdasarkan ID terbesar
        const absensi = await Absensi.findOne({
            order: [['id', 'DESC']]
        });

        if (!absensi) {
            return res.status(404).json({ message: "Tidak ada data absensi yang ditemukan" });
        }

        // Ambil lokasi yang dikirim saat absen pulang
        const { latitude, longitude } = req.body.position || {};

        // Validasi: Lokasi pulang harus sama dengan lokasi absen masuk
        if (latitude !== absensi.position_latitude || longitude !== absensi.position_longitude) {
            return res.status(400).json({ 
                message: "Lokasi absen pulang harus sama dengan lokasi absen masuk.",
                lokasi_masuk: { lat: absensi.position_latitude, lon: absensi.position_longitude },
                lokasi_pulang: { lat: latitude, lon: longitude }
            });
        }

        const jamPulang = moment().tz('Asia/Jakarta').format('HH:mm:ss');

        await absensi.update({
            status_kehadiran: req.body.statusKehadiran || absensi.status_kehadiran,
            jam_pulang: jamPulang
        });

        res.status(200).json({ message: "Absensi terbaru berhasil diperbarui", absensi });
    } catch (error) {
        console.error("Error saat memperbarui absensi:", error);
        res.status(500).json({ message: "Gagal memperbarui absensi", error: error.message });
    }
};

const getAllAbsensi = async (req, res) => {
    try {
        const absensi = await Absensi.findAll({
            include: { model: Users, as: 'siswa', attributes: ['name', 'nim', 'jurusan'] },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(absensi);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data absensi", error: error.message });
    }
};

const getAbsensiBySiswa = async (req, res) => {
    try {
        const siswaId = req.params.id;
        const absensi = await Absensi.findAll({
            where: { idsiswa: siswaId },
            include: { model: Users, as: 'siswa', attributes: ['name', 'nim', 'jurusan'] },
            order: [['createdAt', 'DESC']]
        });

        if (absensi.length === 0) {
            return res.status(404).json({ message: "Tidak ada data absensi untuk siswa ini" });
        }

        res.status(200).json(absensi);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data absensi", error: error.message });
    }
};

const getAbsensiById = async (req, res) => {
    try {
      const { id } = req.params; // Ambil ID laporan
  
      // Cari laporan berdasarkan ID
      const absensi = await Absensi.findByPk(id); // Gunakan findByPk
  
      if (!absensi) {
        return res.status(404).json({ message: "Absensi tidak ditemukan." });
      }
  
      res.json(absensi); // Kirim laporan ke frontend
    } catch (error) {
      console.error("Error:", error); // Tambahkan logging untuk debugging
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  };

module.exports = { createAbsensi, getAbsensiById, getAllAbsensi, getAbsensiBySiswa, updateAbsensi };
