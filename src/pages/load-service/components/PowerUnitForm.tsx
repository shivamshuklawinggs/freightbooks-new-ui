import apiService from "@/service/apiService";
import { Dialog, DialogTitle, DialogActions, DialogContent, TextField, Button, Stack } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

interface PowerUnitFormProps {
  onClose: () => void;
  carrierId: string;
  open: boolean;
  onUpdate: () => void;
}

const PowerUnitForm: React.FC<PowerUnitFormProps> = ({ onClose, carrierId, open, onUpdate }) => {
  const [powerUnit, setPowerUnit] = useState("");

  const mutation = useMutation({
    mutationFn: (powerUnit: string) => apiService.addPowerunit(carrierId, powerUnit),
    onSuccess: () => {
      toast.success("Power unit added successfully");
      onUpdate();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add power unit");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!powerUnit) {
      toast.error("Please enter power unit");
      return;
    }
    mutation.mutate(powerUnit);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Power Unit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{mt:2}}>
            <TextField
              fullWidth
              label="Power Unit"
              variant="outlined"
              value={powerUnit}
              onChange={(e) => setPowerUnit(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Power Unit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PowerUnitForm;
