const { Schedule, Users, Holiday, sequelize } = require("../models");
const { Op } = require("sequelize");

// ✅ Fungsi untuk Mengedit Kategori Jadwal
exports.editSchedule = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { schedule_id } = req.params;
        const { category } = req.body;

        // 🔹 Cek data yang diterima dari request
        console.log("✅ Received Data:", { schedule_id, category });

        if (!schedule_id || !category) {
            await t.rollback();
            return res.status(400).json({ message: "ID jadwal dan kategori wajib diisi." });
        }

        const schedule = await Schedule.findByPk(schedule_id, { transaction: t });
        if (!schedule) {
            await t.rollback();
            return res.status(404).json({ message: "Jadwal tidak ditemukan." });
        }

        // 🔹 Hanya memperbarui kategori tanpa mengubah tanggal
        schedule.category = category;
        await schedule.save({ transaction: t });

        await t.commit();
        res.json({ message: "Kategori jadwal berhasil diperbarui.", schedule });

    } catch (error) {
        await t.rollback();
        console.error("❌ Error saat mengedit kategori jadwal:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};



exports.addSchedule = async (req, res) => {
    const t = await sequelize.transaction(); // 🔹 Mulai transaksi
    try {
        const { student_id } = req.params;
        const { dates, category } = req.body;

        if (!student_id || !dates || !Array.isArray(dates) || dates.length === 0 || !category) {
            await t.rollback();
            return res.status(400).json({ message: "Semua data wajib diisi dan format tanggal harus berupa array." });
        }

        const student = await Users.findByPk(student_id, { transaction: t });
        if (!student) {
            await t.rollback();
            return res.status(404).json({ message: "Siswa tidak ditemukan." });
        }

        // 🔹 Ambil daftar hari libur
        const holidays = await Holiday.findAll({
            where: { date: { [Op.in]: dates } },
            transaction: t,
        });

        const holidayDates = holidays.map(holiday => holiday.date);

        // 🔹 Filter tanggal yang valid (bukan hari libur dan bukan Sabtu/Minggu)
        const validDates = dates.filter(date => {
            const day = new Date(date).getDay();
            return !holidayDates.includes(date) && day !== 0 && day !== 6;
        });

        console.log("✅ Valid dates:", validDates); // Debugging

        if (validDates.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: "Semua tanggal yang dipilih tidak valid (hari libur atau akhir pekan)." });
        }

        // 🔹 Cek apakah ada tanggal yang sudah ada di database
        const existingSchedules = await Schedule.findAll({
            where: {
                student_id,
                date: { [Op.in]: validDates },
            },
            attributes: ["date"],
            transaction: t,
        });

        const existingDates = existingSchedules.map(schedule => schedule.date);
        const newDates = validDates.filter(date => !existingDates.includes(date));

        if (newDates.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: "Semua tanggal sudah ada dalam jadwal." });
        }

        // 🔹 Gunakan bulkCreate untuk memasukkan semua tanggal dalam satu query
        const schedules = await Schedule.bulkCreate(
            newDates.map(date => ({
                student_id: parseInt(student_id, 10), // Pastikan ID berbentuk angka
                date: new Date(date), // Pastikan format tanggal benar
                category,
            })),
            { transaction: t }
        );

        await t.commit(); // ✅ Commit transaksi agar data tersimpan

        res.status(201).json({
            message: `Jadwal berhasil ditambahkan (${schedules.length} tanggal valid).`,
            schedules,
        });

    } catch (error) {
        await t.rollback(); // ❌ Rollback jika ada error
        console.error("❌ Error saat menambah jadwal:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

exports.getSchedules = async (req, res) => {
    try {
        let { student_id } = req.params;

        if (!student_id) {
            console.log("❌ Student ID tidak ditemukan di req.params.");
            return res.status(400).json({ message: "Student ID harus disertakan di URL." });
        }

        student_id = parseInt(student_id, 10); // Konversi ke integer

        if (isNaN(student_id)) {
            console.log(`❌ Student ID bukan angka: ${req.params.student_id}`);
            return res.status(400).json({ message: "Student ID harus berupa angka yang valid." });
        }

        console.log(`✅ Mencari jadwal untuk student_id: ${student_id}`);

        const schedules = await Schedule.findAll({
            where: { student_id },
            include: [
                {
                    model: Users,
                    as: "student",
                    attributes: ["id", "name"],
                },
            ],
            attributes: ["id", "student_id", "date", "category"],
        });

        if (!schedules.length) {
            console.log(`❌ Tidak ada jadwal ditemukan untuk student_id: ${student_id}`);
            return res.status(404).json({ message: "Jadwal tidak ditemukan untuk siswa ini." });
        }

        res.json({
            message: `Daftar jadwal untuk siswa dengan ID ${student_id}`,
            schedules: schedules.map(schedule => ({
                id: schedule.id,
                student_id: schedule.student_id,
                student_name: schedule.student ? schedule.student.name : "Tidak ditemukan",
                date: schedule.date,
                category: schedule.category
            }))
        });

    } catch (error) {
        console.error("❌ Error saat mengambil jadwal:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};
