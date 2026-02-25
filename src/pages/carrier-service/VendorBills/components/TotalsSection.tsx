import { FC, useEffect } from 'react';
import { Paper, Typography, TextField, Box, InputAdornment } from '@mui/material';
import { formatCurrency, maxnumberInput } from '@/utils';
import {  useFormContext } from 'react-hook-form';
import { formatDate } from '@/utils/dateUtils';
import {  IVendorBill } from '@/types';
import apiService from '@/service/apiService';
import { calculateBillSummary } from '@/utils/calculateInvoiceAndBillSummary';
import { useQuery } from '@tanstack/react-query';
import { Edit } from '@mui/icons-material';
import { paths } from '@/utils/paths';
import { useNavigate } from 'react-router-dom';
import { SelectChartOfAcc } from '@/components/common/SelectChartOfAcc';

const TotalsSection: FC<{ handleTaxModalShow: () => void }> = ({ handleTaxModalShow }) => {
  const navigate=useNavigate();
  const form = useFormContext<IVendorBill>()
  const fetchTaxOptions = async () => {
    try {
      const response = await apiService.getPurchaseTax();
      form.setValue("taxArray", response.data);
      return response.data;
    } catch (error) {
      form.setValue("taxArray", []);
      return []
    }
  };
    useQuery({
    queryKey: ['taxOptions'],
    queryFn: fetchTaxOptions,
  });
  const fieldsToWatch = [
    'discountPercent',
    'loadAmount',
    'expense',
    'type',
    'tax',
    'taxArray'
  ];
  const values = form.watch(fieldsToWatch as any, { deep: true });
  useEffect(() => {
    calculateBillSummary(form);
  }, [...values]);
  return (
    <Paper sx={{ p: 2 }}>
      {[
        // ...(form.watch("totalExpenses")
        //   ? [
        //       {
        //         label: 'Rate',
        //         value: form.watch("totalExpenses") ? `$${form.watch("totalExpenses")?.toFixed(2)}` : "",
        //       },
        //     ]
        //   : []),
        {
          label: 'Subtotal',
          value: form.watch("subTotal") ? `$${form.watch("subTotal")?.toFixed(2)}` : "",
        },
      ].map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography fontWeight={600}>{item.label}</Typography>
          <Typography fontWeight={600}>{item.value}</Typography>
        </Box>
      ))}

      {/* Discount Percent */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography fontWeight={600} sx={{ mr: 1 }}>
            Discount Percent
          </Typography>
          <TextField
            type="number"
            size="small"
            value={form.watch('discountPercent')}
            onChange={(e) =>
              form.setValue('discountPercent', Number(e.target.value))
            }
            onInput={(e) =>
              maxnumberInput(e as React.ChangeEvent<HTMLInputElement>, 100)
            }
            sx={{ width: 100 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: {
                min: 0,
                max: 100,
              },
            }}
          />
        </Box>
        <Typography fontWeight={600}>
          {formatCurrency(form.watch("totalDiscount") || 0)}
        </Typography>
      </Box>

      {/* Discount Account - Show only if discount > 0 */}
      {(form.watch('discountPercent') || 0) > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <SelectChartOfAcc  removeMasters={["vendor","customer"]} regularExpression="DISCOUNT" type="income"  />
        </Box>
      )}

      {/* Tax */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography fontWeight={600} sx={{ mr: 12 }}>Tax</Typography>
          {/* <FormControl>
            <Controller
              name="tax"
              control={form.control}
              render={({ field }) => (
                <Select
                  {...field}
                  size="small"
                  sx={{ width: 100 }}
                >
                  <MenuItem value="">Select Tax</MenuItem>
                  <MenuItem value="" onClick={handleTaxModalShow}>Add New Tax</MenuItem>
                  {form.watch("taxArray")?.map((option: ITaxOption) => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.value + "%"}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl> */}
        </Box>
        <Typography fontWeight={600}>
          {formatCurrency(form.watch("taxAmount") || 0)}
        </Typography>
      </Box>
      {/* Total */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography fontWeight={600}>Total</Typography>
        <Typography fontWeight={600}>
          {formatCurrency(form.watch("total") || 0)}
        </Typography>
      </Box>
      {/* Recieved Payment */}
      
           {
             form.watch("recievedPaymentAmount")?.map((payment,index)=>(
               <Box
               key={index}
               sx={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 flexWrap: 'wrap',
               }}
             >
               <Typography fontWeight={700} color='primary' sx={{display:'flex',alignItems:'center'}} > Payment On {formatDate(payment.paymentDate)} <Edit fontSize='small' onClick={()=>navigate(`${paths.recievedbill}/${payment.recievedPaymentId}`)}/>

               </Typography>
               <Typography fontWeight={700} color='primary'> {formatCurrency(payment.amount)}</Typography>
               </Box>
             ))
           }
      {/* Balance Due */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* <Typography fontWeight={700}>Balance Due</Typography>
        <Typography fontWeight={700}>
          {formatCurrency(form.watch("balanceDue") || 0)}
        </Typography> */}
      </Box>

    </Paper>


  );
};

export default TotalsSection; 