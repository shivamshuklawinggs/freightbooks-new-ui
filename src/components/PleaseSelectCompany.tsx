import { AppDispatch, RootState } from '@/redux/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, FormControl, MenuItem, Select, Typography, Paper, SelectChangeEvent } from '@mui/material'
import { setCompany } from '@/redux/Slice/UserSlice'
import { fetchAllCompanies } from '@/redux/api'
import { ICompany } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { initialCompanyData } from '@/redux/InitialData/initialCompanyData'
const PleaseSelectCompany: React.FC = () => {
  const qc=useQueryClient()
  const [SearchParam] = useSearchParams()
  const { currentCompany, user } = useSelector((state: RootState) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [companies, setCompanies] = React.useState<ICompany[]>([])

  const handleCompanyChange = (event: SelectChangeEvent<string>) => {
    const id = event.target.value;
    const selectedCompany = companies.find(company => company._id === id);
    if (selectedCompany) {
      dispatch(setCompany(selectedCompany));
      // qc.invalidateQueries({ queryKey: ['getCompany', currentCompany] });
      qc.refetchQueries()
      const NextUrl = SearchParam.get('next')
      NextUrl && navigate(NextUrl);
    } else if (!selectedCompany) {
      dispatch(setCompany(initialCompanyData));
      // qc.invalidateQueries({ queryKey: ['getCompany', currentCompany] });
      qc.refetchQueries()
      const NextUrl = SearchParam.get('next')
      NextUrl && navigate(NextUrl);
    }
  };
  const fetchCompany = async () => {
    try {
      const data = await dispatch(fetchAllCompanies({ check: true })).unwrap();
      if (Array.isArray(data)) {
        setCompanies(data);
      } else {
        console.warn('Unexpected data format from fetchAllCompanies');
        setCompanies([]);
      }
    } catch (error) {
      console.warn('Error fetching companies:', error);
      setCompanies([]);
    }
  }
  useEffect(() => {
    fetchCompany();
  }, [user])
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Please Select a Company
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          You need to select a company to access this section
        </Typography>
     <FormControl fullWidth>
          <Select
            value={currentCompany || ''}
            onChange={handleCompanyChange}
            sx={{
              backgroundColor: 'white',
              minWidth: 120,
            }}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                // ✅ Explicitly render “All” when value is empty
                return (
                  <Typography sx={{ color: '#000' }}>
                    Select Company
                  </Typography>
                );
              }
              const selectedCompany = companies.find(c => c._id === selected);
              return (
                <Typography sx={{ color: '#000' }}>
                  {selectedCompany?.prefix || selectedCompany?.label}
                </Typography>
              );
            }}
          >
            {companies.map((company: ICompany) => (
              <MenuItem
                key={company._id || `empty-${company.label}`}
                value={company._id}
                sx={{
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    marginRight: '8px',
                    backgroundColor: company.color,
                    borderRadius: '4px',
                  },
                }}
              >
                {company.label.length > 15
                  ? company.label.slice(0, 15) + '...'
                  : company.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
    </Box>
  )
}
export default PleaseSelectCompany

