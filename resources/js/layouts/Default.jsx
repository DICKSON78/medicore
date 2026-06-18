import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Avatar,
  Box,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuList,
  Modal as MuiModal,
  Popover,
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  ExpandMoreRounded as ChevronDownIcon,
  LockRounded as LockIcon,
  LogoutRounded as LogoutIcon,
  MoreVert as MoreIcon,
  Person2Rounded as UserIcon,
} from "@mui/icons-material";
import MenuIcon from "../components/icons/Menu";

import darkTheme from "../themes/dark";
import Menu from "../components/Menu";
import Modal from "../components/Modal";
import ChangePassword from "../pages/auth/ChangePassword";

import useFetch from "../hooks/useFetch";

const drawerWidth = 272;

const drawerOpenedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(255,255,255,0.2) transparent",
  "&::-webkit-scrollbar": {
    width: 7,
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0,0,0,0.1)",
    borderRadius: 4,
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#00796B",
    borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.15)",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#00796B",
  },
});

const drawerClosedMixin = (theme) => ({
  width: 0,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  whiteSpace: "nowrap",
});

const Default = ({ setUser, smsBalance }) => {
  const notificationsTimer = useRef();
  const modalRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const breakpointDownMedium = useMediaQuery(theme.breakpoints.down("md"));
  const breakpointUpMedium = useMediaQuery(theme.breakpoints.up("md"));

  const { data: user, loading, error } = useFetch(
    "/api/auth/user",
    null,
    true,
    null,
    (response) => response.data.data
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [splashLoading, setSplashLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Force splash screen to stay for at least 7 seconds
    const timer = setTimeout(() => {
      setSplashLoading(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationsTimer.current) {
        window.clearInterval(notificationsTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      window.user = user;
      setUser(user);
      // Trigger a notification refresh once user is present to ensure authenticated fetch
      try {
        if (window.notificationEvents && typeof window.notificationEvents.refresh === 'function') {
          window.notificationEvents.refresh();
        }
      } catch (e) {}
    }
  }, [user, setUser]);

  useEffect(() => {
    if (error && !loading) {
      // Redirect to login if authentication fails
      navigate("/login");
    }
  }, [error, loading, navigate]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleAccountMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsAccountMenuOpen(true);
  };

  const handleAccountMenuClose = () => {
    setIsAccountMenuOpen(false);
    setAnchorEl(null);
  };

  const openChangePasswordModal = () => {
    let component = <ChangePassword modal={modalRef.current} />;

    modalRef.current.open("Change Password", component);
  };

  const handleLogout = () => {
    window.localStorage.clear();
    navigate("/login");
  };

  return (
    <React.Fragment>
      {user ? (
        <React.Fragment>
          <ThemeProvider theme={darkTheme}>
            <AppBar
              position="fixed"
              variant="elevation"
              elevation={1}
              sx={{
                zIndex: theme.zIndex.drawer + 1,
                bgcolor:
                  theme.palette.mode === "light"
                    ? theme.palette.primary.main
                    : "background.paper",
              }}
            >
              <Toolbar>
                <Tooltip title="Toggle menu">
                  <IconButton
                    edge="start"
                    color="inherit"
                    onClick={toggleDrawer}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  ml={2}
                  sx={{ letterSpacing: 1 }}
                >
                  MEDICORE
                  <Typography
                    component="span"
                    color="secondary"
                    variant="h6"
                    fontWeight="bold"
                    sx={{ letterSpacing: 1 }}
                  >
                    {" "}DENTAL
                  </Typography>
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ mr: 2 }}
                >
                  <Typography
                    variant="caption"
                    color="primary.contrastText"
                    sx={{ opacity: 0.8, textAlign: 'right', lineHeight: 1.2 }}
                  >
                    {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    <br />
                    {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Stack>

                <Chip
                  variant="outlined"
                  sx={{
                    display: { xs: "none", sm: "none", md: "inline-flex" },
                  }}
                  color="primary"
                  avatar={
                    <Avatar>
                      <UserIcon fontSize="small" />
                    </Avatar>
                  }
                  label={
                    <Stack
                      direction="row"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        color="primary.contrastText"
                      >
                        {user.full_name}
                      </Typography>
                      <ChevronDownIcon sx={{ ml: 0.5 }} />
                    </Stack>
                  }
                  onClick={handleAccountMenuOpen}
                />

                <IconButton
                  color="inherit"
                  sx={{
                    display: {
                      xs: "inline-flex",
                      sm: "inline-flex",
                      md: "none",
                    },
                  }}
                  onClick={handleAccountMenuOpen}
                >
                  <MoreIcon />
                </IconButton>
              </Toolbar>
              <Divider />
            </AppBar>
          </ThemeProvider>

          {/* Drawer for small screens */}
          {breakpointDownMedium ? (
            <Drawer
              container={() => window.document.body}
              variant="temporary"
              open={isDrawerOpen}
              ModalProps={{
                keepMounted: true,
                disableScrollLock: true,
              }}
              sx={{
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
              onClose={toggleDrawer}
            >
              <Toolbar />
              <Menu
                drawerOpen={isDrawerOpen}
                setDrawerOpen={setIsDrawerOpen}
                user={user}
              />
            </Drawer>
          ) : null}
          {/*****/}

          <Box sx={{ display: "flex" }}>
            {/* Drawer for large screens */}
            {breakpointUpMedium ? (
              <Drawer
                variant="permanent"
                ModalProps={{ disableScrollLock: true }}
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  ...(isDrawerOpen && {
                    ...drawerOpenedMixin(theme),
                    "& .MuiDrawer-paper": drawerOpenedMixin(theme),
                  }),
                  ...(!isDrawerOpen && {
                    ...drawerClosedMixin(theme),
                    "& .MuiDrawer-paper": drawerClosedMixin(theme),
                  }),
                }}
              >
                <Toolbar />
                <Menu
                  drawerOpen={isDrawerOpen}
                  user={user}
                />
              </Drawer>
            ) : null}
            {/*****/}

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: "100vh",
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Toolbar />
              <Box sx={{ px: "15px", py: 2, flexGrow: 1 }}>
                <Outlet />
              </Box>
            </Box>
          </Box>

          <Popover
            anchorEl={anchorEl}
            open={isAccountMenuOpen}
            onClose={handleAccountMenuClose}
          >
            <CardHeader
              title={user.full_name}
              subheader={user.job_title?.name}
              titleTypographyProps={{
                variant: "subtitle1",
                fontWeight: "500",
              }}
              avatar={
                <Avatar>
                  <UserIcon />
                </Avatar>
              }
            />
            <Divider />
            <MenuList dense>
              <ListItem disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleAccountMenuClose();
                    openChangePasswordModal();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText>Change Password</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleAccountMenuClose();
                    handleLogout();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </ListItemButton>
              </ListItem>
            </MenuList>
          </Popover>
        </React.Fragment>
      ) : null}

      <Modal ref={modalRef} />
      <MuiModal
        open={loading || (splashLoading && location.pathname !== '/dashboard')}
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
        sx={{ pointerEvents: 'none' }}
      >
        <Box
          display="flex"
          height="100vh"
          alignItems="center"
          justifyContent="center"
          sx={{ bgcolor: "background.default" }}
        >
          <CircularProgress color="primary" />
        </Box>
      </MuiModal>
    </React.Fragment>
  );
};

export default Default;
