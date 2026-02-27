import { Box, Grid, TextField, Chip, Stack, Typography, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Clear as ClearIcon } from '@mui/icons-material';
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

  const hasActiveFilters = search || startPickupDate || endPickupDate;
  
  const handleClearAll = () => {
    setSearch('');
    setStartPickupDate(null);
    setEndPickupDate(null);
  };

  return (
    <Box>
      {/* Search Section */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            minHeight: 48,
            '& .MuiAccordionSummary-content': {
              margin: '12px 0',
              fontWeight: 500
            }
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>Search & Filters</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Loads"
                placeholder="Search by Load No, Customer USDOT, MC#, Company Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomDatePicker
                name="startPickupDate"
                label="Start Pickup Date"
                value={startPickupDate}
                onChange={handleDateChange('startPickupDate')}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomDatePicker
                name="endPickupDate"
                label="End Pickup Date"
                value={endPickupDate}
                onChange={handleDateChange('endPickupDate')}
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Active Filters ({[search, startPickupDate, endPickupDate].filter(Boolean).length})
            </Typography>
            <Button 
              size="small" 
              onClick={handleClearAll}
              startIcon={<ClearIcon />}
              sx={{ textTransform: 'none' }}
            >
              Clear All
            </Button>
          </Box>
          
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {search && (
              <Chip
                label={`Search: ${search}`}
                onDelete={() => handleRemoveFilter('search')}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1 }}
              />
            )}
            {startPickupDate && (
              <Chip
                label={`Start: ${new Date(startPickupDate).toLocaleDateString()}`}
                onDelete={() => handleRemoveFilter('startPickupDate')}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1 }}
              />
            )}
            {endPickupDate && (
              <Chip
                label={`End: ${new Date(endPickupDate).toLocaleDateString()}`}
                onDelete={() => handleRemoveFilter('endPickupDate')}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1 }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default FilterBox;
