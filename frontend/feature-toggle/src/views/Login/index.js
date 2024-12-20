import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Container, Paper } from "@mui/material";
import { toast } from "react-toastify";

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
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/users/login",
        {
          email: username,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userEmail", username.split("@")[0]); 
      localStorage.setItem("userRole", response.data.role); 
      localStorage.setItem("companyId", response.data.company_id); 

      toast.success("Inicio de sesión exitoso", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      navigate("/companies"); 
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
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Iniciar Sesión
        </Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogIn();
          }}
        >
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Iniciar Sesión
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
