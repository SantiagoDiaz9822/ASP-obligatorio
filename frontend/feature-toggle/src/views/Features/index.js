// src/views/Features.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Features = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      const token = localStorage.getItem("token"); // Recuperar el token del localStorage

      try {
        const response = await axios.get("http://localhost:3000/features", {
          headers: {
            Authorization: `${token}`, // Incluir el token en el encabezado
          },
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching features:", error);
      }
    };

    fetchFeatures();
  }, []);

  return (
    <div>
      <h1>Características</h1>
      <ul>
        {features.map((feature) => (
          <li key={feature.id}>
            <strong>{feature.feature_key}:</strong> {feature.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Features;
