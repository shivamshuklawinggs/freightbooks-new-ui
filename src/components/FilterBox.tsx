import { Box, Grid, TextField, Chip, Stack } from '@mui/material';
import CustomDatePicker from './common/CommonDatePicker';

interface FilterBoxProps {
  search: string;
  setSearch: (search: string) => void;
  startPickupDate: Date | null;
  setStartPickupDate: (date: Date | null) => void;
  endPickupDate: Date | null;
  setEndPickupDate: (date: Date | null) => void;
}

const FilterBox = ({
  search,
  setSearch,
  startPickupDate,
  setStartPickupDate,
  endPickupDate,
  setEndPickupDate,
}: FilterBoxProps) => {
  const handleRemoveFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearch('');
        break;
      case 'startPickupDate':
        setStartPickupDate(null);
        break;
      case 'endPickupDate':
        setEndPickupDate(null);
        break;
      default:
        break;
    }
  };

  const handleDateChange = (field: 'startPickupDate' | 'endPickupDate') => (e: any) => {
    const value = e.target.value || null;
    if (field === 'startPickupDate') setStartPickupDate(value);
    else setEndPickupDate(value);
  };

  return (
    <Box mb={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Search by Load No, Customer USDOT, MC#, Company Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <CustomDatePicker
            name="startPickupDate"
            label="Start Pickup Date"
            value={startPickupDate}
            onChange={handleDateChange('startPickupDate')}
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <CustomDatePicker
            name="endPickupDate"
            label="End Pickup Date"
            value={endPickupDate}
            onChange={handleDateChange('endPickupDate')}
            size="small"
          />
        </Grid>
      </Grid>

      {/* Selected Filters */}
      {(search || startPickupDate || endPickupDate) && (
        <Box mt={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {search && (
              <Chip
                label={`Search: ${search}`}
                onDelete={() => handleRemoveFilter('search')}
                color="primary"
                variant="outlined"
              />
            )}
            {startPickupDate && (
              <Chip
                label={`Start: ${new Date(startPickupDate).toLocaleDateString()}`}
                onDelete={() => handleRemoveFilter('startPickupDate')}
                color="primary"
                variant="outlined"
              />
            )}
            {endPickupDate && (
              <Chip
                label={`End: ${new Date(endPickupDate).toLocaleDateString()}`}
                onDelete={() => handleRemoveFilter('endPickupDate')}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default FilterBox;
