const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers["authorization"]
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido o expirado." });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    req.companyId = decoded.company_id;
    next();
  });
};

module.exports = auth;
