// src/views/AdminPanel.js
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"; // Importa componentes de MUI
import { toast } from "react-toastify"; // Importa toast

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false); // Estado para el diálogo de confirmación
  const [userIdToDelete, setUserIdToDelete] = useState(null); // ID del usuario a eliminar

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          process.env.REACT_APP_BACKEND_URL + "/users",
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Error al cargar los usuarios."); // Guardar mensaje de error
      }
    };

    fetchUsers();
  }, []);

  const handleCloseSnackbar = () => {
    setError("");
  };

  const handleOpenDialog = (userId) => {
    setUserIdToDelete(userId); // Establecer el ID del usuario a eliminar
    setOpenDialog(true); // Abrir el diálogo
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Cerrar el diálogo
    setUserIdToDelete(null); // Limpiar el ID del usuario
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        process.env.REACT_APP_BACKEND_URL + `/users/${userIdToDelete}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setUsers(users.filter((user) => user.id !== userIdToDelete)); // Actualizar la lista de usuarios
      toast.success("Usuario eliminado exitosamente.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Error al eliminar el usuario."); // Mostrar error
    } finally {
      handleCloseDialog(); // Cerrar el diálogo
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/create-user" // Ajusta la ruta según la implementación de tu creación de usuario
      >
        Crear Nuevo Usuario
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOpenDialog(user.id)} // Abrir diálogo al hacer clic
                  >
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
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este usuario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
