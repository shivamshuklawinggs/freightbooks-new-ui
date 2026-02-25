import { Box, Grid, TextField, Select, MenuItem, FormControl } from '@mui/material';
import {ChartAccountFilterType} from "./index"
interface FilterBoxProps {
    searchQuery: string;
    setSearchQuery: (search: string) => void;
    filterType: string;
    setFilterType: (type: ChartAccountFilterType) => void;
    setPage: (page: number) => void;
}

const filterOptions = [
    { value: 'all', label: 'All' },
    {value:"createdBy",label:"Created by You"},
    { value: 'balance_sheet', label: 'Balance sheet accounts' },
    { value: 'profit_and_loss', label: 'Profit and loss accounts' },
];

const FilterBox = ({ searchQuery, setSearchQuery, filterType, setFilterType,setPage }: FilterBoxProps) => {
  return (
    <Box mb={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <TextField
            fullWidth
            label="Filter by name or number"
            value={searchQuery}
            onChange={(e) =>{
             setSearchQuery(e.target.value)
              setPage(1)
            }}
            size="small"
          />
        </Grid>
        <Grid item>
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as ChartAccountFilterType)
                      setPage(1)
                    }}
                    displayEmpty
                >
                    {filterOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FilterBox;