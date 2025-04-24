const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      nama: user.name,
      password: user.password, 
      email: user.email, 
      role: user.role,
      startDate: user.startDate,
      endDate: user.endDate
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } 
  );
};

module.exports = { generateToken };
