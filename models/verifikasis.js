'use strict';
// models/verifikasi.js
module.exports = (sequelize, DataTypes) => {
  const Verifikasi = sequelize.define('Verifikasi', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nim: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jurusan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    universitas: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Bisa `true` kalau ada kemungkinan user belum memiliki password
    },
    verificationReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'verifikasi',  // Nama tabel sesuai dengan yang diinginkan
    timestamps: true, // Menambahkan kolom createdAt dan updatedAt secara otomatis
  });

  // Example of defining associations (if needed)
  Verifikasi.associate = function(models) {
    // Example: If there's a Users model, associate it with Verifikasi
    Verifikasi.belongsTo(models.Users, { foreignKey: 'adminId', as: 'admin' });
    // If there's another model like RejectedUsers, you can add that as well
  };

  return Verifikasi;
};
