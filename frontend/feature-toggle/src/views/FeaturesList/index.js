// src/views/FeaturesList.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
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

const FeaturesList = () => {
  const { projectId } = useParams(); // Obtener el ID del proyecto desde la URL
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          process.env.REACT_APP_BACKEND_URL + `/projects/${projectId}/features`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        setFeatures(response.data);
      } catch (error) {
        toast.error("Error al obtener los features.");
      }
    };

    fetchFeatures();
  }, [projectId]);

  const handleDelete = async (featureId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        process.env.REACT_APP_BACKEND_URL + `/features/${featureId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      toast.success("Feature eliminado exitosamente.");
      setFeatures(features.filter((feature) => feature.id !== featureId));
    } catch (error) {
      toast.error("Error al eliminar el feature.");
    }
  };

  return (
    <Container>
      <Typography variant="h4">Features del Proyecto</Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/projects/${projectId}/features/new`}
      >
        Crear Nuevo Feature
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell>{feature.feature_key}</TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>{feature.state}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/projects/${projectId}/features/edit/${feature.id}`}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDelete(feature.id)}
                  >
                    Eliminar
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

export default FeaturesList;
