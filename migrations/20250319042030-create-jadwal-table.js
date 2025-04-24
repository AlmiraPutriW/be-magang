// migrations/schedules.js (Sequelize Migration Jadwal)
"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("schedules", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            student_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users", 
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            category: {
                type: Sequelize.ENUM("Masuk", "Magang Dari Rumah", "Masuk Pagi", "Masuk Siang", "Masuk Pagi Singkat", "Masuk Siang Singkat", "Libur"),
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
                onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("schedules");
    },
};
