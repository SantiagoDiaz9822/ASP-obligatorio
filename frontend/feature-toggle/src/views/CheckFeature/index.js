import React, { useState } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";

const CheckFeature = () => {
  const [featureKey, setFeatureKey] = useState("");
  const [context, setContext] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckFeature = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const apiKey = localStorage.getItem("apiKey"); // Asegúrate de tener el API Key almacenado

    try {
      const response = await axios.post(
        `http://localhost:3000/v1/features/${featureKey}`,
        context,
        {
          headers: {
            Authorization: `${apiKey}`,
          },
        }
      );
      setResult(response.data.value);
      toast.success("Consulta realizada exitosamente.");
    } catch (error) {
      console.error("Error al consultar el estado del feature:", error);
      toast.error("Error al consultar el estado del feature.");
    } finally {
      setLoading(false);
    }
  };

  const handleContextChange = (e) => {
    const { name, value } = e.target;
    setContext((prevContext) => ({
      ...prevContext,
      [name]: value,
    }));
  };

  return (
    <Container>
      <Typography variant="h4">Consultar Estado de Feature</Typography>
      <form onSubmit={handleCheckFeature}>
        <TextField
          label="Feature Key"
          fullWidth
          value={featureKey}
          onChange={(e) => setFeatureKey(e.target.value)}
          required
          margin="normal"
        />
        <Typography variant="h6">Contexto</Typography>
        <TextField
          label="Campo 1"
          name="field_1"
          fullWidth
          onChange={handleContextChange}
          margin="normal"
        />
        <TextField
          label="Campo 2"
          name="field_2"
          fullWidth
          onChange={handleContextChange}
          margin="normal"
        />
        {/* Agrega más campos según sea necesario */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Consultando..." : "Consultar Feature"}
        </Button>
      </form>

      {result !== null && (
        <Typography variant="h6" style={{ marginTop: "20px" }}>
          Estado del Feature: {result ? "Prendido" : "Apagado"}
        </Typography>
      )}
    </Container>
  );
};

export default CheckFeature;
