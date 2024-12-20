// src/views/CreateUser.js
import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material"; 
import MuiAlert from "@mui/material/Alert"; 
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateUser = ({ companyId }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateUser = async (e) => {
    e.preventDefault(); 
    try {
      const token = localStorage.getItem("token"); 
      await axios.post(
        process.env.REACT_APP_BACKEND_URL + `/users/register`,
        {
          company_id: companyId, 
          email,
          password,
          role,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      toast.success("Usuario creado exitosamente", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setSuccess(true);
      navigate("/admin-panel");
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Error al crear el usuario."); 
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError("");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Crear Usuario para la Empresa ID: {companyId}
      </Typography>
      <form onSubmit={handleCreateUser}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-select-label">Rol</InputLabel>
          <Select
            labelId="role-select-label"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <MenuItem value="user">Usuario</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit">
          Crear Usuario
        </Button>
      </form>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
        >
          Usuario creado exitosamente
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
        >
          {error}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default CreateUser;
