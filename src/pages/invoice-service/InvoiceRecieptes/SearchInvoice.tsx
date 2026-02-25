import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useFormContext } from 'react-hook-form';
import { IPaymentRecived } from '@/types';

interface SearchInvoiceProps {
    isLoading: boolean;
    size?: 'small' | 'medium';
    label?: string;
}

const SearchInvoice: React.FC<SearchInvoiceProps> = ({ 
    isLoading, 
    size = 'medium', 
    label = 'Find by Invoice No.' 
}) => {
    const {  setValue, watch } = useFormContext<IPaymentRecived>();
     watch();
    return (
        <TextField
            fullWidth
            size={size}
            label={label}
            value={watch("searchInvoice")}
            onChange={(e) => {
                setValue('searchInvoice', e.target.value);
            }}
            disabled={isLoading}
            placeholder="Type to search..."
            InputProps={{
                endAdornment: watch("searchInvoice") && (
                    <InputAdornment position="end">
                        <IconButton
                            size="small"
                            onClick={() => setValue('searchInvoice', '')}
                        >
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    )
}

export default SearchInvoice;