import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DATE_PICKER_TIME_FORMAT } from "@/config/constant";
interface CheckDateTimeDialogProps {
  open: boolean;
  title: string;
  label: string;
  value: Date | null;
  onChange: (newValue: Date | null) => void;
  onClose: () => void;
  onSave: () => void;
  isLoading?: boolean;
  disabledSave?: boolean;
  /** Optional: Custom upload component to render inside dialog */
  UploadComponent?: React.ReactNode;
}

const CheckDateTimeDialog: React.FC<CheckDateTimeDialogProps> = ({
  open,
  title,
  label,
  value,
  onChange,
  onClose,
  onSave,
  isLoading = false,
  disabledSave = false,
  UploadComponent,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 280,
            mt: 2,
          }}
        >
          <DateTimePicker
            label={label}
            value={value}
            format={DATE_PICKER_TIME_FORMAT}
            onChange={onChange}
          />

          {/* 🧩 Custom upload or additional component (passed from parent) */}
          {UploadComponent && <Box>{UploadComponent}</Box>}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isLoading || disabledSave}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckDateTimeDialog;
