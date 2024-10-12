import React, { useState } from "react";
import axios from "axios";

const CreateUser = ({ companyId }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token"); // Recuperar el token del localStorage
      await axios.post(
        `http://localhost:3000/companies/${companyId}/users`,
        {
          email,
          password,
          role,
        },
        {
          headers: {
            Authorization: `${token}`, // Incluir el token en el encabezado
          },
        }
      );

      alert("Usuario creado exitosamente");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div>
      <h1>Create User for Company ID: {companyId}</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleCreateUser}>Create User</button>
    </div>
  );
};

export default CreateUser;
