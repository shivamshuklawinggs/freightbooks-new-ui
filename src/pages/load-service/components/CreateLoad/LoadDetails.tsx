import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { setLoadDetails,setCustomerPnonumber } from '@/redux/Slice/loadSlice';
import { LoadStatus, LoadSize, EquipmentType, tempreatureEquipmentlist } from '@/data/Loads';
import { preventStringInputWithMinus } from '@/utils';
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  InputAdornment,
  Card,
  CardContent,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import apiService from '@/service/apiService';
import { useQuery } from '@tanstack/react-query';

const LoadDetails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loadDetails,pnonumber} = useSelector((state: RootState) => state.load);
  const currentCompanyType = useSelector((state: RootState) => state?.user?.currentCompanyDetails?.type);
  const allowAutogenearate=currentCompanyType==="BROKER"
  const theme = useTheme();
   
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if(name === "equipmentType" && !value?.toLowerCase()?.includes("reefer")){
      dispatch(setLoadDetails({ 
        ...loadDetails, 
        [name]: value ,
         temperature:null,
         temperatureUnit:null
    }));
    return 
    }
      dispatch(setLoadDetails({ 
        ...loadDetails, 
        [name]: value 
    }));
    
  }
  const { data: nextLoadNumber } = useQuery({
    queryKey: ['nextLoadNumber'],
    queryFn: () => apiService.getNextLoadNumber(),
    enabled:allowAutogenearate
    
  });
  useEffect(()=>{
    allowAutogenearate  && dispatch(setLoadDetails({ ...loadDetails, loadNumber: nextLoadNumber?.data || "" }))
  },[nextLoadNumber])
  return (
    <Card 
      elevation={2} 
      sx={{ 
        borderRadius: 2,
        overflow: 'visible',
        mb: 3,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* First row */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Load No"
              placeholder="Load No"
              required
              disabled={allowAutogenearate}
              name="loadNumber"
              value={loadDetails.loadNumber || ''}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Load Amount"
              placeholder="Load Amount"
              required
              name="loadAmount"
              type="number"
              value={loadDetails.loadAmount || ''}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">$</InputAdornment>,
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Load Status</InputLabel>
              <Select
                label="Load Status"
                name="status"
                value={loadDetails.status || ''}
                onChange={handleChange}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem disabled value="">Select Status</MenuItem>
                {LoadStatus.map((status, i) => (
                  <MenuItem key={i} value={status.name}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Commodity"
              placeholder="Commodity"
              required
              name="commodity"
              value={loadDetails.commodity || ''}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>

          {/* Second row */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Load Size</InputLabel>
              <Select
                label="Load Size"
                name="loadSize"
                value={loadDetails.loadSize || ''}
                onChange={handleChange}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem disabled value="">Select Load Size</MenuItem>
                {LoadSize.map((size, i) => (
                  <MenuItem key={i} value={size.id}>
                    {size.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Declared Load Value"
              placeholder="Value"
              name="declaredValue"
              type="number"
              value={loadDetails.declaredValue || ''}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">$</InputAdornment>,
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Weight"
              placeholder="Weight"
              name="weight"
              type="number"
              value={loadDetails.weight || ''}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">lbs</InputAdornment>,
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Equipment Type</InputLabel>
              <Select
                label="Equipment Type"
                name="equipmentType"
                value={loadDetails.equipmentType || ''}
                onChange={handleChange}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem disabled value="">Select Equipment</MenuItem>
                {EquipmentType.map((type, i) => (
                  <MenuItem key={i} disabled sx={{ backgroundColor: theme.palette.action.hover, fontWeight: 'bold' }}>
                    {type.category}
                  </MenuItem>
                )).concat(
                  EquipmentType.flatMap((type, i) => 
                    type.options.map((option, j) => (
                      <MenuItem key={`${i}-${j}`} value={option.value} sx={{ pl: 4 }}>
                        {option.label}
                      </MenuItem>
                    ))
                  )
                )}
              </Select>
            </FormControl>
          </Grid>
          {
           tempreatureEquipmentlist?.includes(loadDetails.equipmentType as string) && (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Load Temperature"
                  placeholder="Temperature"
                  name="temperature"
                  value={loadDetails.temperature || ''}
                  onChange={handleChange}
                  onKeyDown={preventStringInputWithMinus}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <FormControl variant="standard" sx={{ minWidth: 60 }}>
                        <Select
                          value={loadDetails.temperatureUnit as string}
                          name="temperatureUnit"
                          onChange={handleChange}
                          disableUnderline
                        >
                          <MenuItem value="F">°F</MenuItem>
                          <MenuItem value="C">°C</MenuItem>
                        </Select>
                      </FormControl>
                    ),
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
            )
          }
        
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Equipment Length</InputLabel>
              <Select
                label="Equipment Length"
                name="equipmentLength"
                value={loadDetails.equipmentLength || ''}
                onChange={handleChange}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem disabled value="">Select Length</MenuItem>
                <MenuItem value="20">20'</MenuItem>
                <MenuItem value="28">28'</MenuItem>
                <MenuItem value="40">40'</MenuItem>
                <MenuItem value="45">45'</MenuItem>
                <MenuItem value="48">48'</MenuItem>
                <MenuItem value="53">53'</MenuItem>
              </Select>
            </FormControl>
          </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Po Number"
                  placeholder="Po Number"
                  value={pnonumber || ''}
                  onChange={(e)=>dispatch(setCustomerPnonumber(e.target.value))}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
          {/* Notes section */}
          <Grid item xs={12}>
            {/* <Divider sx={{ my: 1 }} /> */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
              Additional Information
            </Typography>
            <TextField
              fullWidth
              label="Load Notes"
              placeholder="Enter additional details about this load..."
              name="notes"
              value={loadDetails.notes || ''}
              onChange={handleChange}
              multiline
              rows={2}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LoadDetails;