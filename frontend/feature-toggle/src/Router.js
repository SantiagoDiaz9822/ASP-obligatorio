import { Route, Routes, Outlet } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./views/Login";
import Companies from "./views/Companies";
import AssignUser from "./views/AssignUser";
import AdminPanel from "./views/AdminPanel";
import CreateUser from "./views/CreateUser";
import CreateProject from "./views/CreateProject";
import Projects from "./views/Projects";
import FeaturesList from "./views/FeaturesList";
import CreateFeature from "./views/CreateFeature";
import EditFeature from "./views/EditFeature";
import ChangeHistory from "./views/ChangeHistory";
import UsageLog from "./views/UsageLog";
import ResetPassword from "./views/ResetPassword";
import NavBar from "./components/NavBar/navBar";

// Componente Layout
const Layout = () => {
  return (
    <>
      <NavBar />
      <Outlet /> {/* Aquí se renderizarán las rutas anidadas */}
    </>
  );
};

const RouterPage = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        {" "}
        {/* Aquí se renderiza NavBar junto con las rutas anidadas */}
        <Route
          path="/companies"
          element={<PrivateRoute element={<Companies />} />}
        />
        <Route
          path="/assign-user/:companyId"
          element={<PrivateRoute element={<AssignUser />} />}
        />
        <Route
          path="/admin-panel"
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
        <Route
          path="/create-project"
          element={<PrivateRoute element={<CreateProject />} />}
        />
        <Route
          path="/projects/:projectId/features"
          element={<FeaturesList />}
        />
        <Route
          path="/projects/:projectId/features/new"
          element={<CreateFeature />}
        />
        <Route
          path="/projects/:projectId/features/edit/:featureId"
          element={<EditFeature />}
        />
        <Route
          path="/change-history"
          element={<PrivateRoute element={<ChangeHistory />} />}
        />
        <Route path="/usage-log" element={<UsageLog />} />
      </Route>

      {/* Esta ruta no tiene NavBar */}
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};

export default RouterPage;
