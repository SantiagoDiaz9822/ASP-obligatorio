import React from "react";
import RouterPage from "./Router.js";
import NavBar from "./components/NavBar/navBar"; // Import the NavBar component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <NavBar />
      <br />
      <br />
      <br />
      <br />
      <RouterPage />
      <ToastContainer />
    </div>
  );
}

export default App;
