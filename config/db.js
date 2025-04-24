const mysql = require('mysql2/promise');
require('dotenv').config();

async function connectDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('✅ Koneksi database berhasil!');
        return connection;
    } catch (err) {
        console.error('❌ Koneksi database gagal:', err.message);
        console.error('Error Detail:', err);
        process.exit(1); // Keluar dari aplikasi jika koneksi gagal
    }
}

connectDB();
