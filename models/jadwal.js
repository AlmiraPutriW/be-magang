"use strict";

module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define("Schedule", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM("Masuk", "Magang Dari Rumah", "Masuk Pagi", "Masuk Siang", "Masuk Pagi Singkat", "Masuk Siang Singkat", "Libur"),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
    }, {
        tableName: "schedules",
        timestamps: true,
    });

    Schedule.associate = (models) => {
        Schedule.belongsTo(models.Users, { foreignKey: "student_id", as: "student" });
    };

    return Schedule;
};
