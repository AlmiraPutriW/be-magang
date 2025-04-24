const express = require("express");
const router = express.Router();
const jadwalController = require("../controllers/jadwalController");

// 🔹 Ambil jadwal berdasarkan ID siswa
router.get("/student/:student_id", jadwalController.getSchedules);
router.put("/update/:schedule_id", jadwalController.editSchedule);
router.post("/:student_id", jadwalController.addSchedule); // ✅ Student ID dari params



module.exports = router;
