import React from 'react'
import { ICompany, Role } from '@/types'
import { FormControl, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchAllCompanies } from "@/redux/api";
import { setCompany } from '@/redux/Slice/UserSlice'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { initialCompanyData } from '@/redux/InitialData/initialCompanyData'
type CompanyQueryKey = ['companies', string | undefined];
const SelectCoompany = () => {
  const [SearchParam] = useSearchParams()
  const dispatch = useDispatch<AppDispatch>();
  const { user, currentCompany,primaryColor } = useSelector((state: RootState) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // get all queries



  const handleCompanyChange = async (event: SelectChangeEvent<string>) => {
    const id = event.target.value;
    const selectedCompany = companies.find(company => company._id === id);
    if (selectedCompany) {
      dispatch(setCompany(selectedCompany));
      // dispatch(setThemeColor(selectedCompany.color || '#000000'));
      // queryClient.invalidateQueries({ queryKey: ['getCompany', currentCompany] });
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
    <React.Fragment>
  <FormControl fullWidth>
      <Select
        value={currentCompany || ''}
        onChange={handleCompanyChange}
        sx={{
          backgroundColor: 'white',
          minWidth: 120,
          borderColor:`1px solid ${primaryColor}`,
          '&:hover': {
            borderColor: primaryColor,
          },
          '&.Mui-focused': {
            borderColor: primaryColor,
          },
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
  </React.Fragment>
  )
}

export default SelectCoompany