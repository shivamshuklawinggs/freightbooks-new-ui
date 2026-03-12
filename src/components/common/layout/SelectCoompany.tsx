import { ICompany, Role } from '@/types'
import { Box, FormControl, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchAllCompanies } from "@/redux/api";
import { setCompany } from '@/redux/Slice/UserSlice'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { initialCompanyData } from '@/redux/InitialData/initialCompanyData'
import { setPrimaryColor } from '@/redux/Slice/themeSlice';
type CompanyQueryKey = ['companies', string | undefined];
const SelectCoompany = () => {
  const [SearchParam] = useSearchParams()
  const dispatch = useDispatch<AppDispatch>();
  const { user, currentCompany } = useSelector((state: RootState) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // get all queries



  const handleCompanyChange = async (event: SelectChangeEvent<string>) => {
    const id = event.target.value;
    const selectedCompany = companies.find(company => company._id === id);
    if (selectedCompany) {
      dispatch(setCompany(selectedCompany));
      selectedCompany.color&& dispatch(setPrimaryColor(selectedCompany.color))
      await queryClient.refetchQueries()
      const NextUrl = SearchParam.get('next')
      NextUrl && navigate(NextUrl);
    } else if (!selectedCompany) {
      dispatch(setCompany(initialCompanyData));
      
      // queryClient.invalidateQueries({ queryKey: ['getCompany', currentCompany] });
      await queryClient.refetchQueries()
      const NextUrl = SearchParam.get('next')
      NextUrl && navigate(NextUrl);
    }
  };
  // Fetch companies using React Query
  const { data: companies = [] } = useQuery<ICompany[], Error, ICompany[], CompanyQueryKey>({
    queryKey: ['companies', user?._id],
    queryFn: async () => {
      const response = await dispatch(fetchAllCompanies({ check: true })).unwrap();
      return response;
    },
    enabled: !!user && user.role !== Role.SUPERADMIN,
  });
  return (
    <>
      <FormControl size="small" sx={{ minWidth: 140, maxWidth: 200 }}>
        <Select
          value={currentCompany || ''}
          onChange={handleCompanyChange}
          displayEmpty
          sx={{
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
            },
            '& .MuiSelect-select': {
              py: '6px',
            },
          }}
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Select Company
                </Typography>
              );
            }
            const selectedCompany = companies.find(c => c._id === selected);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '2px',
                    bgcolor: selectedCompany?.color || 'primary.main',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" fontWeight={700} noWrap>
                  {selectedCompany?.prefix || selectedCompany?.label}
                </Typography>
              </Box>
            );
          }}
        >
          {companies.map((company: ICompany) => (
            <MenuItem
              key={company._id || `empty-${company.label}`}
              value={company._id}
              sx={{ gap: 1.5, py: 1, fontSize: '0.8rem' }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '3px',
                  bgcolor: company.color,
                  flexShrink: 0,
                }}
              />
              {company.label.length > 20
                ? company.label.slice(0, 20) + '...'
                : company.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>)
}

export default SelectCoompany