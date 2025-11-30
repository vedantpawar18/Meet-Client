import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../features/users/usersSlice";
import { showNotification } from "../features/notifications/notificationsSlice";
import { Link } from "react-router-dom";

export default function UsersPage() {
  const dispatch = useDispatch();
  const { list } = useSelector((s) => s.users);
  React.useEffect(() => {
    dispatch(fetchUsers());
  }, []);
  async function doDelete(id) {
    if (!window.confirm("Delete user?")) return;
    const res = await dispatch(deleteUser(id));
    if (res.error)
      dispatch(
        showNotification({
          message: res.payload?.message || "Failed",
          severity: "error",
        })
      );
    else
      dispatch(showNotification({ message: "Deleted", severity: "success" }));
  }
  return (
    <Box>
      <Typography variant="h4">Users</Typography>
      <Box sx={{ mb: 2 }}>
        <Button component={Link} to="/users/new" variant="contained">
          Create User
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((u) => (
            <TableRow key={u._id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Button component={Link} to={`/users/${u._id}`}>
                  Edit
                </Button>
                <Button color="error" onClick={() => doDelete(u._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
