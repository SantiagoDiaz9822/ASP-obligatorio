const authorize = (roles = []) => {
  // Si roles es un string, lo convertimos a un array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // Si no hay roles definidos, simplemente permite el acceso
    if (roles.length && !roles.includes(req.userRole)) {
      // Si el rol del usuario no está en la lista de roles permitidos, devuelve un error
      return res.status(403).json({ message: "Acceso denegado." });
    }
    next(); // Permite el acceso si el rol es válido
  };
};

module.exports = authorize;
