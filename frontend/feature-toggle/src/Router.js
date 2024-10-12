// src/Router.js
import { Route, Routes } from "react-router-dom";
import Login from "./views/Login";
import Features from "./views/Features";
import Companies from "./views/Companies";
import AssignUser from "./views/AssignUser";
import AdminPanel from "./views/AdminPanel";
import CreateUser from "./views/CreateUser";
import CreateProject from "./views/CreateProject"; // Importa CreateProject
import Projects from "./views/Projects"; // Importa Projects
import PrivateRoute from "./components/PrivateRoute";

const RouterPage = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/features"
        element={<PrivateRoute element={<Features />} />}
      />
      <Route
        path="/companies"
        element={<PrivateRoute element={<Companies />} />}
      />
      <Route
        path="/assign-user/:companyId"
        element={<PrivateRoute element={<AssignUser />} />}
      />
      <Route
        path="/admin_panel"
        element={<PrivateRoute element={<AdminPanel />} />}
      />
      <Route
        path="/create-user"
        element={<PrivateRoute element={<CreateUser />} />}
      />
      <Route
        path="/projects"
        element={<PrivateRoute element={<Projects />} />}
      />
      {/* Ruta para Projects */}
      <Route
        path="/create-project"
        element={<PrivateRoute element={<CreateProject />} />}
      />
      {/* Ruta para CreateProject */}
    </Routes>
  );
};

export default RouterPage;
