import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, Switch, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IPlan } from '@/types';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';


const Plans: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<IPlan>({ name: '', description: '', price: 0, noOfUsers: 1, isActive: true });

  const { data } = useQuery({
    queryKey: ['plans', search],
    queryFn: () => apiService.getPlans({search}),
  });

  const upsert = useMutation({
    mutationFn: (body: IPlan) => body._id ? apiService.updatePlan(body._id,body) : apiService.createPlan(body),
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['plans'] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiService.deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });
  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiService.setPlanActive(id,isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });

  const list: IPlan[] = data?.data || [];

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Plans</Typography>
      <Stack direction="row" spacing={2}>
        <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="contained" onClick={() => { setForm({ name: '', description: '', price: 0, noOfUsers: 1, isActive: true }); setOpen(true); }}>Add Plan</Button>
      </Stack>
      <Grid container spacing={2}>
        {list.map((p) => (
          <Grid item xs={12} md={4} key={p._id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{p.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption">Active</Typography>
                    <Switch checked={p.isActive} onChange={(_, v) => p._id && toggleActive.mutate({ id: p._id, isActive: v })} />
                    <IconButton onClick={() => { setForm(p); setOpen(true); }}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => p._id && remove.mutate(p._id)}><DeleteIcon /></IconButton>
                  </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                <Typography variant="subtitle2">Price: ${p.price}</Typography>
                <Typography variant="subtitle2">No Of Users: {p.noOfUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form._id ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField type="number" label="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <TextField type="number" label="No. of Users" value={form.noOfUsers} onChange={(e) => setForm({ ...form, noOfUsers: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => upsert.mutate(form)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default withPermission("view",["superadmin"])(Plans);


