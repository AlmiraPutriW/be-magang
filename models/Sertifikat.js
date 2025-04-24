"use strict";

module.exports = (sequelize, DataTypes) => {
    const Administrasi = sequelize.define(
        "Administrasi",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users", // Sesuai dengan nama tabel Users
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            filename: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            filepath: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM("sertifikat", "nilai"),
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
                onUpdate: sequelize.literal("CURRENT_TIMESTAMP"),
            },
        },
        {
            tableName: "Administrasi",
            timestamps: true,
        }
    );

    Administrasi.associate = function (models) {
        Administrasi.belongsTo(models.Users, {
            foreignKey: "userId",
            as: "user",
        });
    };

    return Administrasi;
};
