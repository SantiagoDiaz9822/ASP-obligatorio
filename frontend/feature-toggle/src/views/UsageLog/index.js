import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";

const UsageReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);

  const handleFetchReport = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/usage-logs/report",
        {
          params: {
            startDate,
            endDate,
          },
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setReportData(response.data);
      toast.success("Reporte obtenido correctamente");
    } catch (error) {
      toast.error("Error al obtener el reporte.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Reporte de Uso
      </Typography>

      <TextField
        label="Fecha y Hora de Inicio"
        type="datetime-local"
        fullWidth
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        margin="normal"
      />

      <TextField
        label="Fecha y Hora de Fin"
        type="datetime-local"
        fullWidth
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchReport}
        style={{ marginTop: "20px" }}
      >
        Obtener Reporte
      </Button>

      {reportData.length > 0 && (
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre del Proyecto</TableCell>
                <TableCell>Feature Key</TableCell>
                <TableCell>Conteo de Uso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.project_name}</TableCell>
                  <TableCell>{row.feature_key}</TableCell>
                  <TableCell>{row.usage_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default UsageReport;
