import React from 'react';
import Select, {
  Props as SelectProps,
  StylesConfig,
  components,
  MenuListProps,
  GroupBase,
  OptionsOrGroups,
} from 'react-select';
import { Box, Typography, useTheme, alpha } from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<SelectProps<SelectOption, false, GroupBase<SelectOption>>, 'options'> {
  label?: string;
  error?: string;
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  helperText?: string;
  required?: boolean;
  addNewLabel?: string;
  addNewModal?: React.ReactNode;
  showModal?: boolean;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  options,
  helperText,
  required,
  styles,
  addNewLabel,
  addNewModal,
  showModal,
  setShowModal,
  ...selectProps
}) => {
  const theme = useTheme();
  
  const handleAddNewClick = () => {
    setShowModal && setShowModal(true);
  };
  const CustomMenuList = (props: MenuListProps<SelectOption, false, GroupBase<SelectOption>>) => {
    return (
      <components.MenuList {...props}>
        {addNewLabel && (
          <Box
            onClick={handleAddNewClick}
            sx={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Typography 
              color="primary" 
              sx={{ 
                fontWeight: 500,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              + {addNewLabel}
            </Typography>
          </Box>
        )}
        {props.children}
      </components.MenuList>
    );
  };
  const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      borderColor: error 
        ? theme.palette.error.main 
        : state.isFocused 
        ? theme.palette.primary.main 
        : alpha(theme.palette.divider, 0.3),
      boxShadow: error
        ? `0 0 0 1px ${theme.palette.error.main}`
        : state.isFocused
        ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.3)}`
        : 'none',
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      fontSize: theme.typography.body2.fontSize,
      fontFamily: theme.typography.fontFamily,
      '&:hover': {
        borderColor: error 
          ? theme.palette.error.main 
          : state.isFocused 
          ? theme.palette.primary.main 
          : alpha(theme.palette.divider, 0.5),
      },
      transition: 'all 0.2s ease-in-out',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused 
        ? alpha(theme.palette.primary.main, 0.08) 
        : state.isSelected 
        ? alpha(theme.palette.primary.main, 0.12) 
        : 'transparent',
      color: state.isSelected 
        ? theme.palette.primary.main 
        : theme.palette.text.primary,
      fontSize: theme.typography.body2.fontSize,
      fontFamily: theme.typography.fontFamily,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
      transition: 'all 0.2s ease-in-out',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[8],
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      backgroundColor: theme.palette.background.paper,
    }),
    singleValue: (base) => ({
      ...base,
      color: theme.palette.text.primary,
      fontSize: theme.typography.body2.fontSize,
      fontFamily: theme.typography.fontFamily,
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
      fontSize: theme.typography.body2.fontSize,
      fontFamily: theme.typography.fontFamily,
    }),
    ...styles,
  };

  return (
    <>
      <Box>
        {label && (
          <Typography
            variant="caption"
            color={error ? 'error' : 'textSecondary'}
            sx={{ 
              mb: 0.5, 
              display: 'block', 
              fontWeight: 500,
              fontSize: '0.75rem',
              letterSpacing: '0.025em'
            }}
          >
            {label}
            {required && (
              <Typography 
                component="span" 
                color="error" 
                sx={{ 
                  ml: 0.25,
                  fontSize: '0.875rem'
                }}
              >
                *
              </Typography>
            )}
          </Typography>
        )}
        <Select<SelectOption, false, GroupBase<SelectOption>>
          options={options}
          styles={customStyles}
          menuPortalTarget={document.body}
          components={addNewLabel ? { MenuList: CustomMenuList } : undefined}
          {...selectProps}
        />
        {(error || helperText) && (
          <Typography
            variant="caption"
            color={error ? 'error' : 'textSecondary'}
            sx={{ 
              mt: 0.5, 
              display: 'block', 
              ml: 1.5,
              fontSize: '0.75rem',
              letterSpacing: '0.025em'
            }}
          >
            {error || helperText}
          </Typography>
        )}
      </Box>
      {addNewModal}
    </>
  );
};

export default FormSelect;
