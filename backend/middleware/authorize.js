const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (roles.length && !roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Acceso denegado." });
    }
    next();
  };
};

module.exports = authorize;
