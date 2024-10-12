import React, { useState } from "react";
import axios from "axios";

const CreateCompany = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/companies/new",
        { name, address, logo_url: logoUrl },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      // Redirigir a la página de empresas o mostrar un mensaje de éxito
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Crear Empresa</h1>
      <label>
        Nombre:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Dirección:
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>
      <label>
        URL del Logo:
        <input
          type="text"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </label>
      <button type="submit">Crear Empresa</button>
    </form>
  );
};

export default CreateCompany;
