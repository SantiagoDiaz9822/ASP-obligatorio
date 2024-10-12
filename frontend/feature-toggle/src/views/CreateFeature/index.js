// src/views/CreateFeature.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Typography, TextField, Button, Grid } from "@mui/material";
import { toast } from "react-toastify";

const CreateFeature = () => {
  const { projectId } = useParams(); // Obtener el ID del proyecto
  const [featureKey, setFeatureKey] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("off");
  const [conditions, setConditions] = useState([
    { field: "", operator: "", value: "" },
  ]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/features/new",
        {
          project_id: projectId,
          feature_key: featureKey,
          description,
          state,
          conditions,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      toast.success("Feature creado exitosamente");
      navigate(`/projects/${projectId}/features`);
    } catch (error) {
      toast.error("Error al crear el feature.");
    }
  };

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, { field: "", operator: "", value: "" }]);
  };

  const removeCondition = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  return (
    <Container>
      <Typography variant="h4">Crear Nuevo Feature</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Key"
          fullWidth
          value={featureKey}
          onChange={(e) => setFeatureKey(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          label="Descripción"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          margin="normal"
        />

        {/* Cambiamos el input de texto por un select para el estado */}
        <TextField
          label="Estado"
          fullWidth
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
          select
          SelectProps={{
            native: true,
          }}
          margin="normal"
        >
          <option value="off">Off</option>
          <option value="on">On</option>
        </TextField>

        <Typography variant="h6" gutterBottom>
          Condiciones
        </Typography>
        {conditions.map((condition, index) => (
          <Grid container spacing={2} key={index} marginBottom={2}>
            <Grid item xs={4}>
              <TextField
                label="Campo"
                value={condition.field}
                onChange={(e) =>
                  handleConditionChange(index, "field", e.target.value)
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={condition.operator}
                onChange={(e) =>
                  handleConditionChange(index, "operator", e.target.value)
                }
                fullWidth
                required
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Seleccionar expresion...</option>
                <option value="equals">Equals</option>
                <option value="different">Different</option>
                <option value="greater">Greater</option>
                <option value="lower">Lower</option>
                <option value="in">In</option>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Valor"
                value={condition.value}
                onChange={(e) =>
                  handleConditionChange(index, "value", e.target.value)
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => removeCondition(index)}
              >
                Eliminar Condición
              </Button>
            </Grid>
          </Grid>
        ))}

        <Button variant="contained" color="primary" onClick={addCondition}>
          Agregar Condición
        </Button>
        <br />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: "20px" }}
        >
          Crear Feature
        </Button>
      </form>
    </Container>
  );
};

export default CreateFeature;
