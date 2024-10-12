// src/views/AssignUser.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material"; // Importa componentes de MUI
import { toast } from "react-toastify"; // Importa toast
import { useNavigate } from "react-router-dom";

const AssignUser = () => {
  const { companyId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const navigate = useNavigate(); // Hook para redirigir

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:3000/users", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/users/assign-to-company",
        { user_id: selectedUser, company_id: companyId },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      // Mostrar el mensaje de éxito
      toast.success("Usuario asignado a la empresa exitosamente!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/companies");
    } catch (error) {
      console.error("Error assigning user to company:", error);
      // Mostrar el mensaje de error
      toast.error("Error al asignar el usuario a la empresa.", {
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
    <Container>
      <Typography variant="h4" gutterBottom>
        Asignar Usuario a Empresa
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="user-select-label">Selecciona un Usuario</InputLabel>
          <Select
            labelId="user-select-label"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            label="Selecciona un Usuario"
            required
          >
            <MenuItem value="">
              <em>Seleccionar...</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit">
          Asignar Usuario
        </Button>
      </form>
    </Container>
  );
};

export default AssignUser;