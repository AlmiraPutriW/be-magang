const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes= require('./routes/authRoutes');
const reportRoutes = require("./routes/reportRoutes");
const verifikasiRouter = require("./routes/verifikasiRouter")
const absensiRouter = require("./routes/absensiRouter")
const sertifRouter = require("./routes/sertifRouter")
const scheduleRoutes = require("./routes/jadwalRouter")
const holidayRoutes = require("./routes/holidaysRouter")

const db = require('./config/db');
require('dotenv').config();
const path = require('path');
const helmet = require('helmet')


const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};

app.use(cors(corsOptions));


  
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/validasi', verifikasiRouter);
app.use("/api/absensi/", absensiRouter);
app.use('/api/administrasi/', sertifRouter);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/holiday", holidayRoutes);
app.use(bodyParser.json());


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://127.0.0.1:${PORT}`);
});
