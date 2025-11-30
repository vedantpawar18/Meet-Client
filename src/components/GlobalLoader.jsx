import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";

/**
 * GlobalLoader component displays a loading spinner overlay
 * when there are active async operations
 */
export default function GlobalLoader() {
  const loadingCount = useSelector((state) => state.loading?.count || 0);

  // Don't render anything if there are no active operations
  if (!loadingCount) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.25)",
      }}
    >
      <CircularProgress size={64} />
    </Box>
  );
}
