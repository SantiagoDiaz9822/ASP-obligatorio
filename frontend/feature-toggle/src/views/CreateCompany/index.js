import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Container, Paper } from "@mui/material";
import { toast } from "react-toastify";

const CreateCompany = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState(null); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData(); 
    formData.append("name", name);
    formData.append("address", address);
    formData.append("logo", logo); 

    try {
      await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/companies/new",
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data", 
          },
        }
      );
      toast.success("Empresa creada exitosamente!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/companies");
    } catch (error) {
      console.error("Error creando la empresa:", error);
      toast.error("Error al crear la empresa.", {
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
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Crear Empresa
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Dirección"
            variant="outlined"
            fullWidth
            margin="normal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            type="file" 
            accept="image/*" 
            onChange={(e) => setLogo(e.target.files[0])} 
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Crear Empresa
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateCompany;
