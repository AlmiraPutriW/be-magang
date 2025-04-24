const { Holiday } = require("../models");

// ✅ Get All Holidays
exports.getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.findAll();

        if (!holidays.length) {
            return res.status(404).json({ message: "Tidak ada hari libur yang tersedia." });
        }

        res.json({ holidays });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ✅ Add New Holiday
exports.addHoliday = async (req, res) => {
    try {
        const { date, description } = req.body;

        if (!date || !description) {
            return res.status(400).json({ message: "Tanggal dan deskripsi wajib diisi." });
        }

        const holiday = await Holiday.create({ date, description });

        res.status(201).json({
            message: "Hari libur berhasil ditambahkan.",
            holiday
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ✅ Delete Holiday
exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Holiday.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ message: "Hari libur tidak ditemukan." });
        }

        res.json({ message: "Hari libur berhasil dihapus." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};
