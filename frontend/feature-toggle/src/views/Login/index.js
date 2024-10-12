// src/views/Login/index.js
import React, { useState, useEffect } from "react";
import { LogInButton } from "./Wrapper"; // Asegúrate de que esto esté configurado
import { toast } from "react-toastify";
import { FormGroup, Label, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Asegúrate de tener Axios instalado

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  let navigate = useNavigate();

  const handleLogIn = async () => {
    if (username.trim() === "" || password.trim() === "") {
      toast.error("Los campos de usuario y contraseña deben ser completados", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/users/login", {
        email: username,
        password,
      });
      // Almacena el token en el localStorage
      localStorage.setItem("token", response.data.token);
      toast.success("Inicio de sesión exitoso", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate("/"); // Redirigir al usuario a la página principal
    } catch (error) {
      let errorMessage = error.response
        ? error.response.data.message
        : "Error en la conexión";
      toast.error("Error al iniciar sesión: " + errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div>
      <FormGroup>
        <Label for="exampleText1">Email</Label>
        <Input
          id="exampleText1"
          value={username}
          name="text"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label for="exampleText2">Password</Label>
        <Input
          id="exampleText2"
          name="text"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormGroup>
      <LogInButton onClick={handleLogIn}>Log in</LogInButton>
    </div>
  );
};

export default Login;
