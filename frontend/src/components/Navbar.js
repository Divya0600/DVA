// src/components/Navbar.js
import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  styled,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ChevronRight as ChevronRightIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Styled search component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let breadcrumbs = [];
    
    if (pathSegments.length === 0) {
      return [{ path: '/dashboard', label: 'Dashboard' }];
    }
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format the label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Special case for IDs or specific routes
      if (
        (segment.includes('-') && segment.length > 10) || 
        (index > 0 && ['edit', 'create'].includes(segment))
      ) {
        switch (segment) {
          case 'create':
            label = 'Create New';
            break;
          case 'edit':
            label = 'Edit';
            break;
          default:
            if (segment.length > 8) {
              label = segment.substring(0, 8) + '...';
            }
        }
      }
      
      breadcrumbs.push({
        path: currentPath,
        label: label,
        isLast: index === pathSegments.length - 1
      });
    });
    
    // Always include Dashboard as the first breadcrumb
    return [{ path: '/dashboard', label: 'Dashboard' }, ...breadcrumbs];
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Handle user menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  const menuId = 'primary-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email || user?.username || 'user@example.com'}
        </Typography>
      </Box>
      <Divider />
      <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/help'); }}>
        <ListItemIcon>
          <HelpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Help</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Sign Out</ListItemText>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            aria-label="breadcrumb" 
            separator={<ChevronRightIcon fontSize="small" />}
            sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              flexGrow: 1
            }}
          >
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                component={RouterLink}
                to={crumb.path}
                color={crumb.isLast ? 'primary.main' : 'inherit'}
                sx={{ 
                  fontWeight: crumb.isLast ? 'bold' : 'normal',
                  '&:hover': { textDecoration: 'none' }
                }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'flex', sm: 'none' }, flexGrow: 1 }}
          >
            Pipeline Migration
          </Typography>
          
          {/* Search box */}
          <Search sx={{ display: { xs: 'none', md: 'flex' } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          
          <Box sx={{ display: 'flex' }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            {/* Theme toggle */}
            <Tooltip title="Toggle light/dark theme">
              <IconButton color="inherit">
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* User menu */}
            <Tooltip title="Account settings">
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user?.avatar ? (
                  <Avatar src={user.avatar} alt={user.name || 'User'} sx={{ width: 32, height: 32 }} />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </Box>
  );
};

export default Navbar;