const express = require("express");
const router = express.Router();
const holidaysController = require("../controllers/holidaysController");

// 🔹 Ambil semua hari libur
router.get("/", holidaysController.getHolidays);

// 🔹 Tambah hari libur baru
router.post("/", holidaysController.addHoliday);

// 🔹 Hapus hari libur berdasarkan ID
router.delete("/:id", holidaysController.deleteHoliday);

module.exports = router;
