import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BusinessIcon from "@mui/icons-material/Business";
import RuleIcon from "@mui/icons-material/Gavel";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import GlobalSnackbar from "./GlobalSnackbar";
import GlobalLoader from "./GlobalLoader";

/**
 * Layout component provides the main application layout with:
 * - App bar with navigation menu
 * - Side drawer for navigation
 * - User menu
 * - Global components (snackbar, loader)
 */
export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation menu items
  const menuItems = [
    { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
    { to: "/parcels", label: "Parcels", icon: <LocalShippingIcon /> },
    { to: "/parcels/upload", label: "Upload", icon: <UploadFileIcon /> },
    { to: "/departments", label: "Departments", icon: <BusinessIcon /> },
    { to: "/rules", label: "Rules", icon: <RuleIcon /> },
  ];

  function handleAvatarClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  function handleProfileClick() {
    navigate("/profile");
    handleCloseMenu();
  }

  function handleLogoutClick() {
    handleLogout();
    handleCloseMenu();
  }

  // Get user's initial for avatar
  const userInitial = (user?.name || user?.email || "U")[0].toUpperCase();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="fixed" color="default">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {process.env.REACT_APP_TITLE || "Parcel Distribution"}
          </Typography>
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body2">{user.name || user.email}</Typography>
              <IconButton onClick={handleAvatarClick}>
                <Avatar>{userInitial}</Avatar>
              </IconButton>
            </Box>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, p: 3, mt: 8 }}>
        {children}
      </Box>

      {/* User Menu */}
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleCloseMenu}>
        <MenuItem onClick={handleProfileClick}>My Profile</MenuItem>
        <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
      </Menu>

      {/* Global Components */}
      <GlobalSnackbar />
      <GlobalLoader />
    </Box>
  );
}
