'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('absensi', {  // Pastikan nama tabel sesuai
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      idsiswa: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nim: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bidang: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status_kehadiran: {
        type: Sequelize.ENUM('Hadir', 'Izin', 'Sakit', 'Alfa'),
        allowNull: false,
        defaultValue: 'Alfa'
      },
      position_latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      position_longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      jam_mulai: {
        type: Sequelize.TIME,
        allowNull: false
      },
      jam_pulang: {
        type: Sequelize.TIME,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('absensi');
  }
};
