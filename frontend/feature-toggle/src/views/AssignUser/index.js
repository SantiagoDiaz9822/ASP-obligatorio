// src/views/AssignUser.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const AssignUser = () => {
  const { companyId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:3000/users", {
          headers: {
            Authorization: `${token}`, // Asegúrate de incluir 'Bearer' antes del token
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
        "http://localhost:3000/users/assign-to-company", // Endpoint correcto para asignar el usuario
        { user_id: selectedUser, company_id: companyId }, // Incluye tanto user_id como company_id
        {
          headers: {
            Authorization: `${token}`, // Asegúrate de incluir 'Bearer' antes del token
          },
        }
      );
      // Redirigir o mostrar un mensaje de éxito
      console.log("Usuario asignado a la empresa exitosamente.");
    } catch (error) {
      console.error("Error assigning user to company:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Asignar Usuario a Empresa</h1>
      <label>
        Selecciona un Usuario:
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Asignar Usuario</button>
    </form>
  );
};

export default AssignUser;
