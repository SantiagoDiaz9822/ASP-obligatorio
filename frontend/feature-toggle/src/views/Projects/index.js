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
} from "@mui/material";
import { toast } from "react-toastify";

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          process.env.REACT_APP_BACKEND_URL + "/projects",
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Error al cargar los proyectos.");
      }
    };

    fetchProjects();
  }, []);

  const deleteProject = async (projectId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/projects/${projectId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      // Eliminar proyecto del estado después de la eliminación exitosa
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
      toast.success("Proyecto eliminado correctamente.");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error al eliminar el proyecto.");
    }
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
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/projects/${project.id}/features`}
                  >
                    Ver Features
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    style={{ marginLeft: "10px" }}
                    onClick={() => deleteProject(project.id)}
                  >
                    Eliminar Proyecto
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Projects;
