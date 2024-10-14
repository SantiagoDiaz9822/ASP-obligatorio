import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

const ChangeHistory = () => {
  const [changes, setChanges] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [featureKey, setFeatureKey] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/change-history",
        {
          headers: {
            Authorization: `${token}`,
          },
          params: {
            startDate,
            endDate,
            feature_key: featureKey,
            user_id: userId,
          },
        }
      );
      setChanges(response.data);
    } catch (error) {
      toast.error("Error al obtener el historial de cambios.");
    }
  };

  const handleFilter = () => {
    fetchChanges();
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFeatureKey("");
    setUserId("");
    fetchChanges(); 
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Historial de Cambios
      </Typography>

      <Grid container spacing={2} marginBottom={2}>
        <Grid item xs={3}>
          <TextField
            label="Fecha de Inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Fecha de Fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Key de Feature"
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="ID de Usuario"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Button variant="contained" color="primary" onClick={handleFilter}>
        Filtrar
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleClearFilters}
        style={{ marginLeft: "10px" }}
      >
        Limpiar Filtros
      </Button>

      <TableContainer style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Feature ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Cambios</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changes.map((change) => (
              <TableRow key={change.id}>
                <TableCell>{change.feature_id}</TableCell>
                <TableCell>{change.user_id}</TableCell>
                <TableCell>{change.action}</TableCell>
                <TableCell>{JSON.stringify(change.changed_fields)}</TableCell>
                <TableCell>
                  {new Date(change.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ChangeHistory;
