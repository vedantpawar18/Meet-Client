import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

/**
 * ReassignDialog component allows users to reassign a parcel to a different department
 */
export default function ReassignDialog({
  open,
  onClose,
  departments = [],
  onConfirm,
}) {
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState("");

  // Set default department when departments list changes
  React.useEffect(() => {
    if (departments[0]) {
      setSelectedDepartmentId(departments[0]._id || "");
    }
  }, [departments]);

  function handleConfirm() {
    onConfirm(selectedDepartmentId);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Reassign Parcel</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDepartmentId}
            label="Department"
            onChange={(event) => setSelectedDepartmentId(event.target.value)}
          >
            {departments.map((department) => (
              <MenuItem key={department._id} value={department._id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Reassign
        </Button>
      </DialogActions>
    </Dialog>
  );
}
