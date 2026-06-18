import React from "react";
import { Box, Stack, Typography } from "@mui/material";

const Header = ({
  title,
  subtitle,
  leading,
  trailing,
  containerProps,
  titleProps,
}) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      flexWrap="wrap"
      px={2}
      py={1.5}
      {...containerProps}
    >
      {leading}
      {title ? (
        <React.Fragment>
          <Box flexGrow={1}>
            <Typography
              variant="h6"
              fontWeight={700}
              {...titleProps}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                variant="subtitle2"
                color="textSecondary"
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </React.Fragment>
      ) : null}
      {trailing}
    </Stack>
  );
};

const Page = ({ children }) => {
  return children;
};

export { Header };
export default Page;
