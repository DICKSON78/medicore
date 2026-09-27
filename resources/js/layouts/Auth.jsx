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
            sx={{ my: 3 }}
          >
            <Box
              component="img"
              src="/images/sarahcliniclogo.jpg"
              alt="Sarah Dental Clinic"
              sx={{
                width: 140,
                height: 140,
                objectFit: "cover",
                borderRadius: "50%",
                boxShadow: 2,
              }}
            />
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
            {new Date().getFullYear()} Sarah Dental Clinic
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Auth;
