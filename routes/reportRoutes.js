const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const {
    verifyToken
  } = require('../middleware/auth');

router.post("/", verifyToken, reportController.createReport);
router.get("/getall", verifyToken, reportController.getAllReports);
router.get("/:id", reportController.getReportById);
router.get("/user/:id", verifyToken, reportController.getReportsByUser);
router.put("/:id", verifyToken, reportController.updateReport);
router.delete("/:id", verifyToken, reportController.deleteReport);
router.patch("/:id/approve",verifyToken, reportController.approveReport);
router.patch("/:id/reject",verifyToken, reportController.rejectReport);

module.exports = router;
