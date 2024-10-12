// src/views/CreateProject.js
import React, { useState } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button } from "@mui/material"; // Importa componentes de MUI
import { toast } from "react-toastify"; // Importa toast
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate(); // Hook para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/projects/new",
        {
          name,
          description,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      toast.success("Proyecto creado exitosamente!", {
        position: "bottom-right",
        autoClose: 5000,
      });
      navigate("/projects"); // Redirigir a la lista de proyectos
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error al crear el proyecto.", {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Crear Proyecto
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
          label="Descripción"
          variant="outlined"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Button variant="contained" color="primary" type="submit">
          Crear Proyecto
        </Button>
      </form>
    </Container>
  );
};

export default CreateProject;
