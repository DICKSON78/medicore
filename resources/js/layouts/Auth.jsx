import React from "react";
import { Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const Auth = () => {
  return (
    <Container
      component="main"
      maxWidth="xs"
    >
      <Box
        py={2}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
      >
        <Card>
          <Box
            display="flex"
            justifyContent="center"
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ my: 4 }}
            >
              <span style={{ color: "#009688" }}>MEDI</span>
              <span style={{ color: "#f44336" }}>CORE</span>
            </Typography>
          </Box>
          <Outlet />
        </Card>
        <Card sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            p={2}
          >
            {"© "}
            {new Date().getFullYear()} Medicore Dental Clinic
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Auth;
