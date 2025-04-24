const { Administrasi, Users } = require("../models");
const path = require("path");
const fs = require("fs");

// 📌 Upload atau Update Sertifikat / Surat Keterangan (Admin)
exports.uploadFile = async (req, res) => {
    try {
        const { id } = req.params; // ID user
        const { type } = req.body; // 'sertifikat' atau 'surat_keterangan'

        // Validasi: hanya menerima "sertifikat" atau "surat_keterangan"
        const allowedTypes = ["sertifikat", "surat_keterangan"];
        if (!req.file || !type || !allowedTypes.includes(type)) {
            return res.status(400).json({ message: "File dan tipe wajib diisi dengan benar (sertifikat atau surat_keterangan)" });
        }

        const filename = req.file.filename;
        const filepath = path.join("uploads", filename);

        // Cek apakah user sudah memiliki file dengan tipe yang sama
        const existingFile = await Administrasi.findOne({ where: { userId: id, type } });

        if (existingFile) {
            // Hapus file lama dari server
            const oldFilePath = path.join(__dirname, "..", existingFile.filepath);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Update data file di database
            await existingFile.update({ filename, filepath });

            console.log(`✅ File ${type} berhasil diperbarui untuk userId: ${id}`);
            return res.status(200).json({ message: `File ${type} berhasil diperbarui`, data: existingFile });
        }

        // Jika belum ada file sebelumnya, buat file baru
        const newFile = await Administrasi.create({
            filename,
            filepath,
            type,
            userId: id,
        });

        console.log(`✅ File ${type} berhasil diupload untuk userId: ${id}`);
        res.status(201).json({ message: `File ${type} berhasil diupload`, data: newFile });

    } catch (error) {
        console.error("❌ Error uploadFile:", error);
        res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
    }
};

exports.getUserFiles = async (req, res) => {
    try {
        console.log("📌 GET FILES Request params:", req.params);
        console.log("📌 GET FILES User ID:", req.params.id);

        const { id } = req.params;
        const files = await Administrasi.findAll({ where: { userId: id } });

        if (!files.length) {
            console.warn("⚠️ Tidak ada file ditemukan untuk userId:", id);
            return res.status(404).json({ message: "Tidak ada file ditemukan" });
        }

        console.log("✅ Berhasil mengambil data file:", files);
        res.status(200).json({ data: files });
    } catch (error) {
        console.error("❌ Error getUserFiles:", error);
        res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        console.log("📌 FULL REQUEST:", req.originalUrl);
        console.log("📌 HEADERS:", req.headers);
        console.log("📌 PARAMS:", req.params);
        console.log("📌 QUERY:", req.query);

        const { fileId } = req.params;
        let userId = req.query.userId || req.headers["x-user-id"];

        console.log("📌 DOWNLOAD REQUEST: fileId =", fileId, "userId =", userId);

        if (!userId) {
            console.error("❌ UserId tidak ditemukan di request!");
            return res.status(400).json({ message: "UserId tidak ditemukan di request" });
        }

        const file = await Administrasi.findOne({ where: { id: fileId, userId } });

        if (!file) {
            console.warn("❌ File tidak ditemukan atau akses ditolak untuk userId:", userId);
            return res.status(403).json({ message: "Akses ditolak atau file tidak ditemukan" });
        }

        const filePath = path.join(__dirname, "..", file.filepath);
        if (!fs.existsSync(filePath)) {
            console.error("❌ File tidak ditemukan di server:", filePath);
            return res.status(404).json({ message: "File tidak ditemukan di server" });
        }

        console.log("✅ File ditemukan, mengirim:", file.filename);
        res.download(filePath, file.filename);
    } catch (error) {
        console.error("❌ Error downloading file:", error);
        res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
    }
};
