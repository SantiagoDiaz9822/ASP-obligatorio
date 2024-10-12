// src/views/Projects.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
} from "@mui/material"; // Importa componentes de MUI
import { toast } from "react-toastify"; // Importa toast

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:3000/projects/", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Error al cargar los proyectos."); // Guardar mensaje de error
      }
    };

    fetchProjects();
  }, []);

  const handleCloseSnackbar = () => {
    setError("");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Proyectos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/create-project"
      >
        Crear Nuevo Proyecto
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>API Key</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>{project.api_key}</TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary">
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <div>{error}</div>
        </Snackbar>
      )}
    </Container>
  );
};

export default Projects;
