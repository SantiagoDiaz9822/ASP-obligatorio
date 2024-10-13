// src/views/CreateCompany.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Container, Paper } from "@mui/material";
import { toast } from "react-toastify";

const CreateCompany = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState(null); // Cambiar a estado para el archivo
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData(); // Crear un objeto FormData para manejar la carga de archivos
    formData.append("name", name);
    formData.append("address", address);
    formData.append("logo", logo); // Agregar el archivo de logo

    try {
      await axios.post("http://localhost:3000/companies/new", formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data", // Especificar el tipo de contenido
        },
      });
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
      console.error("Error creando la empresa:", error);
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
          <input
            type="file" // Cambiar a input de tipo archivo
            accept="image/*" // Aceptar solo imágenes
            onChange={(e) => setLogo(e.target.files[0])} // Guardar el archivo seleccionado
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
