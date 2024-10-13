// src/views/Companies.js
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
  Alert,
} from "@mui/material";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [userCompany, setUserCompany] = useState("");

  useEffect(() => {
    const isAdministrator = localStorage.getItem("userRole") === "admin";
    if (!isAdministrator) {
      console.log("No eres administrador");
      if (localStorage.getItem("companyId")) {
        console.log(
          "Tienes una empresa asignada: ",
          localStorage.getItem("companyId")
        );
        const fetchCompanyName = async () => {
          const token = localStorage.getItem("token");
          const companyId = localStorage.getItem("companyId");
          try {
            const response = await axios.get(
              `http://localhost:3000/companies/${companyId}`,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
            );
            console.log(response.data.name);
            setUserCompany(response.data.name);
            console.log(userCompany);
          } catch (error) {
            console.error("Error fetching company:", error);
          }
        };

        fetchCompanyName();
      }
      return;
    }
    const fetchCompanies = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:3000/companies", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Error al cargar las empresas."); // Guardar mensaje de error
      }
    };

    fetchCompanies();
  }, []);

  const handleCloseSnackbar = () => {
    setError("");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Empresas
      </Typography>
      {localStorage.getItem("userRole") === "admin" ? (
        <>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/create-company"
          >
            Crear Nueva Empresa
          </Button>
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Logo</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.address}</TableCell>
                    <TableCell>
                      <img
                        src={company.logo_url}
                        alt="Logo"
                        style={{
                          width: "50px",
                          height: "auto",
                          borderRadius: "4px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        component={Link}
                        to={`/assign-user/${company.id}`}
                      >
                        Agregar Usuario
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography variant="h6" style={{ marginTop: "20px" }}>
          {userCompany
            ? `Tu empresa es: ${userCompany}`
            : "Aún no se te ha asignado una empresa."}
        </Typography>
      )}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          elevation={6}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Companies;
