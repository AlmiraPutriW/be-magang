const express = require("express");
const router = express.Router();
const sertifikatController = require("../controllers/sertifikatController");
const multer = require("multer");
const path = require("path");

// 📌 Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file dengan timestamp
    },
});

const upload = multer({ storage });

router.post("/upload/:id", upload.single("file"), sertifikatController.uploadFile); // Upload file
router.get("/user/:id", sertifikatController.getUserFiles); // Lihat daftar file user
router.get("/download/:fileId", sertifikatController.downloadFile); // Download file

module.exports = router;
