'use strict';

module.exports = (sequelize, DataTypes) => {
  const Absensi = sequelize.define('Absensi', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    idsiswa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',  // Pastikan tabel Users ada di database
        key: 'id'
      }
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nim: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    bidang: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status_kehadiran: {
      type: DataTypes.ENUM('Hadir', 'Izin', 'Sakit', 'Alfa'),
      allowNull: false,
      defaultValue: 'Hadir'
    },
    position_latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    position_longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    jam_mulai: {
      type: DataTypes.TIME,
      allowNull: false
    },
    jam_pulang: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    timestamps: true,  // Akan otomatis menambahkan createdAt dan updatedAt
    tableName: 'absensi'  // Pastikan sesuai dengan tabel migrasi
  });

  // Relasi ke model Users (jika ada)
  Absensi.associate = (models) => {
    Absensi.belongsTo(models.Users, {
      foreignKey: 'idsiswa',
      as: 'siswa',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  };

  return Absensi;
};
