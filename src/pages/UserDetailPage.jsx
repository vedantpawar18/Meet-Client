import React from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUser, updateUser, createUser } from "../features/users/usersSlice";
import { showNotification } from "../features/notifications/notificationsSlice";
import api from "../api/axios";

export default function UserDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    role: "operator",
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (id && id !== "new") {
      setLoading(true);
      api
        .get(`/users/${id}`)
        .then((r) => setUser(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function save() {
    try {
      if (id === "new") {
        await dispatch(createUser(user));
      } else {
        await dispatch(updateUser({ id, payload: user }));
      }
      nav("/users");
    } catch (e) {
      dispatch(showNotification({ message: "Save failed", severity: "error" }));
    }
  }

  return (
    <Box>
      <Typography variant="h4">
        {id === "new" ? "Create User" : "Edit User"}
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <TextField
          label="Name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Role"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </Paper>
    </Box>
  );
}
