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
    label = 'Find by Bill No.' 
}) => {
    const { setValue, watch } = useFormContext<IPaymentRecived>();
    const searchInvoice = watch("searchInvoice");

    return (
        <TextField
            fullWidth
            size={size}
            label={label}
            value={searchInvoice}
            onChange={(e) => {
                setValue('searchInvoice', e.target.value);
            }}
            disabled={isLoading}
            placeholder="Type to search..."
            InputProps={{
                endAdornment: searchInvoice && (
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