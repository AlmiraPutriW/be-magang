'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize; // Pastikan DataTypes dideklarasikan
    
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('siswa', 'admin', 'superadmin'),
        allowNull: false,
        defaultValue: 'siswa'
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // 🔹 Kolom untuk Admin & Superadmin
      nip: {
        type: DataTypes.STRING,
        allowNull: true
      },
      jabatan: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bidang: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // 🔹 Kolom untuk Siswa
      nim: {
        type: DataTypes.STRING,
        allowNull: true
      },
      jurusan: {
        type: DataTypes.STRING,
        allowNull: true
      },
      universitas: {
        type: DataTypes.STRING,
        allowNull: true
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      ampuanAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' }, // Relasi ke admin
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sertifikat: DataTypes.STRING, // Path file sertifikat
    nilai: DataTypes.STRING, // Path file nilai              
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
