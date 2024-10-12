import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CameraEnhanceOutlinedIcon from "@mui/icons-material/CameraEnhanceOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    // Aquí puedes agregar la lógica para obtener el email y el rol del usuario.
  }, []);

  const toggleMenu = () => {
    setIsBurgerOpen(!isBurgerOpen);
  };

  const toggleDropdown = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate("/login");
    setAnchorEl(null);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <AppBar
        position="fixed"
        style={{
          background: "rgba(255, 255, 255, 1)",
          backdropFilter: "blur(5px)",
          borderRadius: "10px",
          maxWidth: "60%",
          margin: "0 auto",
          top: "10px",
          left: "50%",
          transform: "translate(-50%)",
        }}
      >
        <Toolbar>
          <div style={{ flexGrow: 1 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ display: { xs: "block", md: "none" } }}
              onClick={toggleMenu}
              size="large"
            >
              <MenuIcon />
            </IconButton>
            <Button
              color="inherit"
              component={Link}
              to="/"
              style={{ color: "black" }}
            >
              <HomeOutlinedIcon
                fontSize="small"
                style={{ marginRight: "2px" }}
              />
              Home
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/features"
              style={{ color: "black" }}
            >
              <CameraEnhanceOutlinedIcon
                fontSize="small"
                style={{ marginRight: "2px" }}
              />
              Features
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/companies" // Enlace para ver empresas
              style={{ color: "black" }}
            >
              Companies
            </Button>
          </div>
          <Button
            color="inherit"
            onClick={toggleDropdown}
            style={{ color: "black" }}
          >
            <PersonIcon fontSize="small" style={{ marginRight: "2px" }} />
            {email}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/login" onClick={handleLogout}>
              Log Out
            </MenuItem>
            {isAdmin && (
              <MenuItem component={Link} to="/admin_panel">
                Admin Panel
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;
