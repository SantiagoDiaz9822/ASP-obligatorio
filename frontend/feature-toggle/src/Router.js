import { Route, Routes } from "react-router-dom";
import Login from "./views/Login";
import Features from "./views/Features";
import Companies from "./views/Companies"; // Importa la nueva vista
import CreateCompany from "./views/CreateCompany"; // Importa la nueva vista
import AssignUser from "./views/AssignUser"; // Importa la nueva vista
import PrivateRoute from "./components/PrivateRoute"; // Asegúrate de importar el componente

const RouterPage = () => {
  return (
    <Routes>
      <Route exact path="/login" element={<Login />} />
      <Route
        path="/features"
        element={<PrivateRoute element={<Features />} />}
      />
      <Route
        path="/companies"
        element={<PrivateRoute element={<Companies />} />}
      />
      <Route
        path="/create-company"
        element={<PrivateRoute element={<CreateCompany />} />}
      />
      <Route
        path="/assign-user/:companyId"
        element={<PrivateRoute element={<AssignUser />} />}
      />
      {/* Agrega más rutas privadas según sea necesario */}
    </Routes>
  );
};

export default RouterPage;
