import React from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { downloadCSV } from '@/utils';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HasPermission } from '@/hooks/ProtectedRoute/authUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getIcon } from './icons/getIcon';
interface FilterTransactionProps {
  years: Array<number>,
  selectedYear: number,
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>,
  totalLoaded: number,
  totalRecords: number,
  type: "vendor" | "customer"
}
const FilterTransaction: React.FC<FilterTransactionProps> = ({ selectedYear, setSelectedYear, totalLoaded, totalRecords, years, type }) => {
  const { id } = useParams()
  const exportCustomersMutation = useMutation({
    mutationFn: () => apiService.exportTransactionyCustomerId(id as string, type),
    onSuccess: (data) => {
      downloadCSV(data.data);
      toast.success('Customers exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export customers');
    },
  });
  const handleExportData = async () => {
    exportCustomersMutation.mutate();
  }

  return (
    <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
      <FormControl sx={{ minWidth: 120 }} >
        <InputLabel>Year</InputLabel>
        <Select
          value={selectedYear}
          label="Year"
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {Array.isArray(years) && years.map((year) => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <HasPermission action="export" resource={['accounting']} component={<Button
        variant="outlined"
        onClick={handleExportData}
        disabled={exportCustomersMutation.isPending}
      >
        {exportCustomersMutation.isPending ? <LoadingSpinner size={24} /> :getIcon("fileExport")}
      </Button>} />

    </Box>
  )
}

export default FilterTransaction