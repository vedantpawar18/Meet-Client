import React from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Typography,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/**
 * LoginPage component handles user authentication (login and registration)
 */
export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const [mode, setMode] = React.useState("login"); // 'login' | 'register'
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  // Login form fields
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Registration form fields
  const [name, setName] = React.useState("");
  const [registerEmail, setRegisterEmail] = React.useState("");
  const [registerPassword, setRegisterPassword] = React.useState("");
  const [role, setRole] = React.useState("operator");

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (auth.token) {
      navigate("/");
    }
  }, [auth.token, navigate]);

  // Handle login form submission
  async function handleLogin(event) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const result = await dispatch(login({ email, password }));
      setLoading(false);

      if (result.error) {
        setMessage({
          type: "error",
          text:
            result.payload?.message || result.error.message || "Login failed",
        });
        return;
      }
      // Login successful - token is set, useEffect will navigate
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: error.message || "Login failed" });
    }
  }

  // Handle registration form submission
  async function handleRegister(event) {
    event.preventDefault();
    setMessage(null);

    // Basic client-side validation
    if (!name.trim() || !registerEmail.trim() || !registerPassword) {
      setMessage({
        type: "error",
        text: "Name, email and password are required",
      });
      return;
    }

    setLoading(true);

    try {
      // Register the new user
      const payload = {
        name: name.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        role,
      };
      await api.post("/auth/register", payload);

      // On successful registration, automatically log in the user
      const result = await dispatch(
        login({
          email: registerEmail.trim(),
          password: registerPassword,
        })
      );
      setLoading(false);

      if (result.error) {
        // Registration succeeded but login failed
        setMessage({
          type: "success",
          text: "Registered successfully — please login",
        });
        setMode("login");
      }
      // Login successful - token is set, useEffect will navigate
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setMessage({ type: "error", text: errorMessage });
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {mode === "login" ? "Login" : "Register"}
        </Typography>

        {/* Display success or error messages */}
        {message && (
          <Alert
            severity={message.type === "error" ? "error" : "success"}
            sx={{ mb: 2 }}
          >
            {message.text}
          </Alert>
        )}

        {/* Login Form */}
        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              fullWidth
              sx={{ mb: 2 }}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              sx={{ mb: 2 }}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
              <Typography variant="body2">
                No account?{" "}
                <Link
                  component="button"
                  onClick={() => {
                    setMode("register");
                    setMessage(null);
                  }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister}>
            <TextField
              label="Full name"
              fullWidth
              sx={{ mb: 2 }}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
            />
            <TextField
              label="Email"
              fullWidth
              sx={{ mb: 2 }}
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              sx={{ mb: 2 }}
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              disabled={loading}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                label="Role"
                disabled={loading}
              >
                <MenuItem value="operator">Operator</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Creating..." : "Register"}
              </Button>
              <Typography variant="body2">
                Already have an account?{" "}
                <Link
                  component="button"
                  onClick={() => {
                    setMode("login");
                    setMessage(null);
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
}
