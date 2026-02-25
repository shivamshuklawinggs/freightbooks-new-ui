import React from "react";
import { Box, CircularProgress, SxProps } from "@mui/material";
import { Theme } from "@mui/system";

interface LoadingSpinnerProps {
  size?: number;
  sx?: SxProps<Theme>;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 20, sx = { display: "flex", justifyContent: "center", alignItems: "center",} }) => {
  return <Box sx={sx}>
    <CircularProgress  />;
  </Box>
};

export default LoadingSpinner;
