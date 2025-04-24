'use strict';

module.exports = (sequelize, DataTypes) => {
    const RejectedUsers = sequelize.define('RejectedUsers', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nim: {
        type: DataTypes.STRING,
        allowNull: false
      },
      jurusan: {
        type: DataTypes.STRING,
        allowNull: false
      },
      universitas: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true // Bisa `true` kalau ada kemungkinan user belum memiliki password
      },
      rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {});
  
    return RejectedUsers;
  };
  