import { getIcon } from "@/components/common/icons/getIcon";
import apiService from "@/service/apiService";
import { Dialog, DialogTitle, DialogActions, DialogContent, TextField, Button, Stack, IconButton } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

interface TrailerFormProps {
  onClose: () => void;
  carrierId: string;
  open: boolean;
  onUpdate: () => void;
}

const TrailerForm: React.FC<TrailerFormProps> = ({ onClose, carrierId, open, onUpdate }) => {
  const [trailer, setTrailer] = useState("");

  const mutation = useMutation({
    mutationFn: (trailer: string) => apiService.addTrailer(carrierId, trailer),
    onSuccess: () => {
      toast.success("Trailer added successfully");
      onUpdate();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add trailer");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!trailer) {
      toast.error("Please enter trailer");
      return;
    }
    mutation.mutate(trailer);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions>
        <IconButton onClick={onClose} size="small">
          {getIcon('CloseIcon')}
        </IconButton>
      </DialogActions>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Trailer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{mt:2}}>
            <TextField
              fullWidth
              label="Trailer"
              variant="outlined"
              value={trailer}
              onChange={(e) => setTrailer(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Trailer"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TrailerForm;
