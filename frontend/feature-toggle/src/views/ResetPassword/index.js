import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom"; 
import axios from "axios";
import { Container, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState("");
  let navigate = useNavigate();

  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("Token no encontrado.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tokenFromUrl = token;

    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/users/reset-password",
        {
          token: tokenFromUrl,
          new_password: newPassword,
        }
      );

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error("Error al restablecer la contraseña.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Restablecer Contraseña
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nueva Contraseña"
          type="password"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Restablecer Contraseña
        </Button>
      </form>
    </Container>
  );
};

export default ResetPassword;
