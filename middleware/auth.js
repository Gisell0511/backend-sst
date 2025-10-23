// middleware/auth.js - Solo para desarrollo
const auth = (req, res, next) => {
  // Usuario demo para desarrollo
  req.user = { 
    id: 1, 
    name: 'Usuario Demo'
  };
  next();
};

module.exports = auth;