import { createTheme } from "@mui/material/styles";

// Application theme configuration
// Customizes Material-UI component styling
const theme = createTheme({
  palette: {
    primary: {
      main: "#9BEC00", // Green primary color
    },
    mode: "light", // Light theme mode
  },
  typography: {
    button: {
      textTransform: "none", // Don't uppercase button text
    },
  },
});

export default theme;
