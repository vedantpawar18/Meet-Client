import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccountCircle from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';
import RuleIcon from '@mui/icons-material/Gavel';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import GlobalSnackbar from './GlobalSnackbar';
import GlobalLoader from './GlobalLoader';

export default function Layout({ children }){
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const user = useSelector(s=>s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();

  const menu = [ { to:'/', label:'Dashboard', icon:<DashboardIcon/> }, { to:'/parcels', label:'Parcels', icon:<LocalShippingIcon/> }, { to:'/parcels/upload', label:'Upload', icon:<UploadFileIcon/> }, { to:'/departments', label:'Departments', icon:<BusinessIcon/> }, { to:'/rules', label:'Rules', icon:<RuleIcon/> } ];

  function handleAvatar(e){ setAnchorEl(e.currentTarget); }
  function closeMenu(){ setAnchorEl(null); }
  function doLogout(){ dispatch(logout()); nav('/login'); }

  return (
    <Box sx={{display:'flex',minHeight:'100vh'}}>
      <AppBar position="fixed" color="default">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={()=>setOpen(true)}><MenuIcon/></IconButton>
          <Typography variant="h6" sx={{flex:1}}>{process.env.REACT_APP_TITLE || 'Parcel Distribution'}</Typography>
          {user ? (
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <Typography variant="body2">{user.name || user.email}</Typography>
              <IconButton onClick={handleAvatar}><Avatar>{(user.name||'U')[0]}</Avatar></IconButton>
            </div>
          ) : (<Link to="/login">Login</Link>)}
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={()=>setOpen(false)}>
        <Box sx={{width:260}} role="presentation">
          <List>
            {menu.map(m=> (
              <ListItemButton key={m.to} component={Link} to={m.to} selected={loc.pathname===m.to} onClick={()=>setOpen(false)}>
                <ListItemIcon>{m.icon}</ListItemIcon>
                <ListItemText primary={m.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{flex:1,p:3,mt:8}}>{children}</Box>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
        <MenuItem onClick={()=>{nav('/profile'); closeMenu();}}>My Profile</MenuItem>
        <MenuItem onClick={()=>{doLogout(); closeMenu();}}>Logout</MenuItem>
      </Menu>

      <GlobalSnackbar />
      <GlobalLoader />
    </Box>
  );
}
