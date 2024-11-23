const bcrypt = require("bcryptjs");

const password = "tu_contraseña_de_prueba";
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error("Error al generar el hash de la contraseña:", err);
  } else {
    console.log("Contraseña hasheada:", hash);
  }
});
