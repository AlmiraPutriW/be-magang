const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');  // Tambahkan DataTypes
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;


if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 🔹 Baca semua file model di folder ini (models)
fs.readdirSync(__dirname)
  .filter((file) => 
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);  // Gunakan DataTypes
    db[model.name] = model;
  });

// 🔹 Hubungkan relasi antar model jika ada
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 🔹 Tambahkan Sequelize ke dalam objek `db`
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;  // Ekspor objek `db`
