// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Sync as SyncIcon,
  Task as TaskIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

// Drawer width
const drawerWidth = 240;

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Drawer open state (closed by default on mobile)
  const [open, setOpen] = useState(!isMobile);
  
  // Toggle drawer
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/pipelines', label: 'Pipelines', icon: SyncIcon },
    { path: '/jobs', label: 'Jobs', icon: TaskIcon },
    { path: '/sources', label: 'Sources', icon: StorageIcon },
    { path: '/destinations', label: 'Destinations', icon: StorageIcon },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
    { path: '/help', label: 'Help', icon: HelpIcon }
  ];
  
  // Check if a nav item is active (exact match or startsWith for nested routes)
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  // Render drawer content
  const drawerContent = (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar // necessary for content to be below app bar
      }}>
        {open ? (
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Pipeline Migration
          </Typography>
        ) : (
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            PM
          </Typography>
        )}
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List component="nav">
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <Tooltip title={!open ? item.label : ""} placement="right">
              <ListItemButton
                component={NavLink}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'primary.main' : 'inherit'
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive(item.path) ? 'bold' : 'regular'
                    }} 
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </>
  );
  
  // Mobile drawer button (only visible when drawer is closed)
  const mobileDrawerToggle = !open && isMobile && (
    <IconButton
      color="inherit"
      aria-label="open drawer"
      onClick={toggleDrawer}
      edge="start"
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1199,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: 2,
        '&:hover': {
          bgcolor: 'primary.dark',
        },
      }}
    >
      <MenuIcon />
    </IconButton>
  );
  
  return (
    <>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? toggleDrawer : undefined}
        sx={{
          width: open ? drawerWidth : theme.spacing(7),
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : theme.spacing(7),
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {mobileDrawerToggle}
    </>
  );
};

export default Sidebar;