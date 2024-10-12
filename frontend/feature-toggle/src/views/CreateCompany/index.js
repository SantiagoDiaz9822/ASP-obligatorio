// src/views/CreateCompany.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { TextField, Button, Typography, Container, Paper } from "@mui/material";
import { toast } from "react-toastify"; 

const CreateCompany = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/companies/new",
        { name, address, logo_url: logoUrl },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      // Mostrar el mensaje de éxito
      toast.success("Empresa creada exitosamente!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Redirigir a la página de empresas
      navigate("/companies");
    } catch (error) {
      console.error("Error creating company:", error);
      // Mostrar el mensaje de error
      toast.error("Error al crear la empresa.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Crear Empresa
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Dirección"
            variant="outlined"
            fullWidth
            margin="normal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <TextField
            label="URL del Logo"
            variant="outlined"
            fullWidth
            margin="normal"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Crear Empresa
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateCompany;
