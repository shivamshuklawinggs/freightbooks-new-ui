import { Grid, Typography, Box, Button, TextField } from '@mui/material'
import { useFormContext, useFieldArray ,Controller} from 'react-hook-form'
import { ICarrier } from '@/types'
const PowerUnits = () => {
    const form = useFormContext<ICarrier>();
   const { fields: powerunitFields, append: appendPowerunit, remove: removePowerunit } = useFieldArray({
      control: form.control,
      name: 'powerunit' as any,
    });
  
    const { fields: trailerFields, append: appendTrailer, remove: removeTrailer } = useFieldArray({
      control: form.control,
      name: 'trailer' as any,
    });
  return (
    <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Typography variant="subtitle1">Power Units</Typography>
      {powerunitFields.map((field, index) => (
        <Box key={field.id} display="flex" gap={1} alignItems="center" mb={1}>
          <Controller
            name={`powerunit.${index}`}
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={`Power Unit ${index + 1}`}
                InputLabelProps={{ shrink: true }}
                size='small'
              />
            )}
          />
          <Button onClick={() => removePowerunit(index)} color="error">Remove</Button>
        </Box>
      ))}
      <Button variant="outlined" onClick={() => appendPowerunit('')}>Add Power Unit</Button>
    </Grid>

    <Grid item xs={12} md={6}>
      <Typography variant="subtitle1">Trailers</Typography>
      {trailerFields.map((field, index) => (
        <Box key={field.id} display="flex" gap={1} alignItems="center" mb={1}>
          <Controller
            name={`trailer.${index}`}
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={`Trailer ${index + 1}`}
                InputLabelProps={{ shrink: true }}
                size='small'
              />
            )}
          />
          <Button onClick={() => removeTrailer(index)} color="error">Remove</Button>
        </Box>
      ))}
      <Button variant="outlined" onClick={() => appendTrailer('')}>Add Trailer</Button>
    </Grid>

  </Grid>
  )
}

export default PowerUnits