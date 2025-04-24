'use strict';

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    'Users', // Nama model harus sama dengan yang digunakan di db.index.js
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('siswa', 'admin', 'superadmin'),
        allowNull: false,
        defaultValue: 'siswa',
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jabatan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bidang: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nim: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jurusan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      universitas: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Menambahkan kolom ampuanAdminId
      ampuanAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      tableName: 'Users', // Pastikan ini sesuai dengan nama tabel di database
      timestamps: true,
    }
  );

  return Users;
};
