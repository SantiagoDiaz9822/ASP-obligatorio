import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Companies = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:3000/companies", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div>
      <h1>Empresas</h1>
      <button>
        <Link to="/create-company">Crear Nueva Empresa</Link>
      </button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Logo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.name}</td>
              <td>{company.address}</td>
              <td>
                <img src={company.logo_url} alt="Logo" width={50} />
              </td>
              <td>
                <Link to={`/assign-user/${company.id}`}>Agregar Usuario</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Companies;
