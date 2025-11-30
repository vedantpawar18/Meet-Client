import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../features/departments/departmentsSlice";
import { showNotification } from "../features/notifications/notificationsSlice";

/**
 * DepartmentsPage component displays and manages departments
 */
export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.departments);
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Fetch departments on component mount
  React.useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Add a new department
  async function handleAdd() {
    if (!name.trim()) {
      return;
    }

    const result = await dispatch(
      createDepartment({ name: name.trim(), description: description.trim() })
    );

    if (result.error) {
      dispatch(
        showNotification({
          message: result.payload?.message || "Failed to add department",
          severity: "error",
        })
      );
    } else {
      setName("");
      setDescription("");
      dispatch(
        showNotification({
          message: "Department added successfully",
          severity: "success",
        })
      );
    }
  }

  // Edit an existing department
  async function handleEdit(department) {
    const newName = window.prompt("Name", department.name);
    if (newName === null) {
      return; // User cancelled
    }

    const newDescription = window.prompt(
      "Description",
      department.description || ""
    );

    const result = await dispatch(
      updateDepartment({
        id: department._id,
        payload: { name: newName, description: newDescription },
      })
    );

    if (result.error) {
      dispatch(
        showNotification({
          message: result.payload?.message || "Update failed",
          severity: "error",
        })
      );
    } else {
      dispatch(
        showNotification({
          message: "Department updated successfully",
          severity: "success",
        })
      );
    }
  }

  // Delete a department
  async function handleDelete(id) {
    if (!window.confirm("Delete this department?")) {
      return;
    }

    const result = await dispatch(deleteDepartment(id));

    if (result.error) {
      dispatch(
        showNotification({
          message: result.payload?.message || "Failed to delete department",
          severity: "error",
        })
      );
    } else {
      dispatch(
        showNotification({
          message: "Department deleted successfully",
          severity: "success",
        })
      );
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Departments
      </Typography>

      {/* Admin-only: Add new department form */}
      {user?.role === "admin" && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            sx={{ mr: 1 }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            sx={{ mr: 1 }}
          />
          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </Paper>
      )}

      {/* Departments table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((department) => (
              <TableRow key={department._id}>
                <TableCell>{department.name}</TableCell>
                <TableCell>{department.description || "-"}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(department)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(department._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
